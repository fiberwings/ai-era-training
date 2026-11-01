import concurrent.futures, hashlib, json, pathlib, urllib.request, urllib.parse, re
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent
data = json.loads((ROOT / 'original.json').read_text())
urls = sorted({u.strip() for r in data['Offers'][1:] for u in str(r[24] or '').splitlines() if u.strip().startswith('http')})
class Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]; self.skip=0
    def handle_starttag(self,t,a):
        if t in ('script','style','noscript'): self.skip+=1
        if t in ('p','div','li','h1','h2','h3','h4','section','br'): self.parts.append('\n')
    def handle_endtag(self,t):
        if t in ('script','style','noscript'): self.skip=max(0,self.skip-1)
    def handle_data(self,d):
        if not self.skip:self.parts.append(d)
def fetch(url):
    key=hashlib.sha256(url.encode()).hexdigest()[:16]; target=ROOT/'sources'/f'{key}.json'
    if target.exists(): return json.loads(target.read_text())
    record={'url':url,'key':key}
    try:
        req=urllib.request.Request(urllib.parse.quote(url,safe=':/?=&%+-_.,~'),headers={'User-Agent':'Mozilla/5.0 (compatible; course-catalogue-review/1.0)'})
        with urllib.request.urlopen(req,timeout=25) as response:
            content=response.read(12_000_000);record.update(status=response.status,final_url=response.url,content_type=response.headers.get('Content-Type',''))
        if content.startswith(b'%PDF'):
            import io
            from pypdf import PdfReader
            record['text']='\n'.join(p.extract_text() or '' for p in PdfReader(io.BytesIO(content)).pages)
        else:
            raw=content.decode('utf-8',errors='replace');p=Text();p.feed(raw)
            record['text']='\n'.join(re.sub(r'\s+',' ',s).strip() for s in ''.join(p.parts).splitlines() if s.strip())
        record['length']=len(record['text'])
    except Exception as e:record.update(status='unavailable',error=str(e),text='')
    target.write_text(json.dumps(record,ensure_ascii=False));return record
if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        records=list(pool.map(fetch,urls))
    (ROOT/'source-index.json').write_text(json.dumps(records,ensure_ascii=False))
    print(json.dumps({'urls':len(records),'retrieved':sum(r.get('status')==200 for r in records),'unavailable':sum(r.get('status')!='200' and r.get('status')!=200 for r in records)},indent=2))
