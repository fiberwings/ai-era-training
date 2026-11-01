"""Capture the public DeepLearning.AI directory and linked public syllabi."""
import json, pathlib, re, urllib.request, time, concurrent.futures
from lxml import html

ROOT=pathlib.Path(__file__).resolve().parent
ROOT.mkdir(exist_ok=True)
def extract_directory():
    raw=pathlib.Path('/private/tmp/deeplearning-courses.html').read_text()
    (ROOT/'directory.html').write_text(raw)
    doc=html.fromstring(raw)
    courses=None
    for script in doc.xpath('//script/text()'):
        if not script.startswith('self.__next_f.push('):continue
        data=json.loads(script[len('self.__next_f.push('):-1])
        if len(data)<2 or not isinstance(data[1],str):continue
        for line in data[1].splitlines():
            if ':[' not in line:continue
            try:obj=json.loads(line.split(':',1)[1])
            except ValueError:continue
            if isinstance(obj,list) and len(obj)>3 and isinstance(obj[3],dict) and 'curriculums' in obj[3]:
                courses=obj[3]['curriculums']
    assert courses
    links=doc.xpath('//a/@href')
    for i,c in enumerate(courses,1):
        slug=c['wpData'].get('marketingSlug') or c['slug']
        candidates=[u for u in links if slug in u and 'learn.deeplearning.ai' not in u and '?' not in u]
        c['reviewNumber']=i
        c['url']=next((u for u in candidates if u.startswith('/')), candidates[0] if candidates else '')
        if c['url'].startswith('/'):c['url']='https://www.deeplearning.ai'+c['url']
        if not c['url']:c['url']='https://www.deeplearning.ai/'+('short-courses/' if c['type']=='short_course' else 'courses/')+slug+'/'
        if c['slug']=='intro-to-federated-learning-c2':c['url']='https://www.deeplearning.ai/courses/intro-to-federated-learning-c2'
    (ROOT/'inventory.json').write_text(json.dumps(courses,ensure_ascii=False,indent=2))
    return courses

def fetch(c):
    out=ROOT/'sources'/f"{c['reviewNumber']:03d}.html"
    try:
        if out.exists():raw=out.read_text()
        else:
            req=urllib.request.Request(c['url'],headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(req,timeout=40) as r:raw=r.read().decode();c['resolvedUrl']=r.url
            out.write_text(raw)
        doc=html.fromstring(raw)
        for s in doc.xpath('//script|//style|//nav|//footer'):s.drop_tree()
        text='\n'.join(t.strip() for t in doc.xpath('//body//text()') if t.strip())
        (ROOT/'sources'/f"{c['reviewNumber']:03d}.txt").write_text(text)
        return {'number':c['reviewNumber'],'url':c['url'],'resolvedUrl':c.get('resolvedUrl',c['url']),'status':'ok','chars':len(text)}
    except Exception as e:return {'number':c['reviewNumber'],'url':c['url'],'status':'error','error':str(e)}

if __name__=='__main__':
    import sys
    courses=extract_directory()
    (ROOT/'sources').mkdir(exist_ok=True)
    if '--fetch' in sys.argv:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(fetch,courses))
        (ROOT/'fetch-log.json').write_text(json.dumps(results,indent=2))
        print(json.dumps({'courses':len(courses),'ok':sum(x['status']=='ok' for x in results),'errors':[x for x in results if x['status']!='ok']},indent=2))
    else:
        for c in courses:print(c['reviewNumber'],c['type'],c['name'],c['url'])
