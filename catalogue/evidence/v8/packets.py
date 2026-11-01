import json,pathlib,re,sys
R=pathlib.Path(__file__).resolve().parent
D=json.loads((R/'original.json').read_text())
S={r['url']:r for r in json.loads((R/'source-index.json').read_text())}
def source(row):
    f=R/'sources'/f'{row[0]}-retry.txt'
    if not f.exists(): f=R/'sources'/f'{row[0]}-web.txt'
    if f.exists():
        raw=f.read_text(); text=re.sub(r'^L\d+: ?', '', raw,flags=re.M)
        a=text.find('## What you');b=text.find('## Requirements',a)
        if a>=0 and b>=0:return text[a:b]
        return text
    ts=[]
    for u in str(row[24]).splitlines():
        if u in S and S[u]['text']:
            t=S[u]['text'];p=t.find('Course Syllabus')
            if p>=0:t=t[p:]
            e=t.find('Things You Need To Know')
            if e>=0:t=t[:e]
            ts.append((u,t))
    return '\n'.join(u+'\n'+t for u,t in ts)
if __name__=='__main__':
    start,end=map(int,sys.argv[1:3]); mode=sys.argv[3] if len(sys.argv)>3 else 'summary'
    for r in D['Offers'][start+1:end+1]:
        print('\n###',r[0],r[2]);print('Prior:',r[21])
        if mode=='summary':print('Synopsis:',r[20]);print('Fit:',r[23])
        elif mode=='web':print(source(r))
        else:
            t=source(r)
            lines=[x for x in t.splitlines() if x.strip()]
            if r[0].startswith('INT-'):
                # Only read the provider's curriculum and outcomes, not reviews or related courses.
                lines=[x for x in lines if not re.match(r'^\s*\*?\s*(Quiz|\d+ questions|Preview|Expand all|Show more)',x)]
            print('Source:', '\n'.join(lines)[:int(mode)])
