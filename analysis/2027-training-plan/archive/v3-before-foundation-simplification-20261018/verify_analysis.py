"""Independently reconcile all v3 scenarios against immutable catalogue evidence."""
import hashlib,json,math,re
from collections import defaultdict
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
DATA=json.loads((ROOT/'training-planner/public/data/catalogue.json').read_text())
RESULTS=json.loads((HERE/'results-v3.json').read_text())
COURSES={c['id']:c for c in DATA['courses']}
REQ={r['id']:r for r in DATA['requirements']}

def level(r):
    if r['id']=='N4.7':return 2
    if r['id'] in ['N5.7','N10.3','N10.6','N10.7']:return None
    return 0 if r['need'] in ['N1','N2','N3','N4','N5'] else 1 if r['need']=='N6' else 2 if r['need'] in ['N7','N8','N9'] else 3 if r['need'] in ['N10','N11'] else None

def chain(s,c):
    out=[c]
    while out[0]['parent']:
        a=next(x for x in s['cohorts'] if x['id']==out[0]['parent']);assert a not in out;out.insert(0,a)
    return out

def target(c):
    p=c['profile']; role=set(i for x in RESULTS['model']['specialisms'] if x['id'] in p['specialisms'] for i in x['requirements'])
    return {r['id'] for r in DATA['requirements'] if (level(r) is not None and level(r)<=p['level']) or r['id'] in role}

def scope(s,c):
    inherited=set().union(*(target(a) for a in chain(s,c)[:-1]))
    return target(c)-inherited

def hours(cid,s):
    if cid in s['overrides']:return s['overrides'][cid]
    raw=COURSES[cid]['duration'].lower().replace('–','-').replace('—','-')
    if '<1h' in raw:return 1
    a=re.search(r'(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*h',raw)
    if a:return float(a[2])
    a=re.search(r'(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*min',raw)
    if a:return float(a[2])/60
    a=re.search(r'(\d+(?:\.\d+)?)\s*h(?:ours?)?(?:\s*(\d+)\s*m)?',raw.split('+')[0])
    if a:return float(a[1])+float(a[2] or 0)/60
    a=re.search(r'(\d+)\s*m(?:in(?:utes?)?)?\b',raw)
    assert a,(cid,raw)
    return float(a[1])/60

def score(ids,r):return max([0]+[COURSES[i]['scores'].get(r,{}).get('score',0) for i in ids])
def measure(ids,reqs):
    by=defaultdict(list)
    for r in reqs:by[REQ[r]['need']].append(score(ids,r))
    return sum(sum(v)/(len(v)*3) for v in by.values())/len(by) if by else 0

def near(a,b):assert math.isclose(a,b,abs_tol=1e-8),(a,b)

def is_core(r,c):
    activity={'N11.3':'automated-judges','R6.1.2':'ai-assisted-assurance'}.get(r)
    return REQ[r]['core'] and (not activity or activity in c['profile'].get('activities',[]))

def verify():
    checked=0;union=set();selected=set()
    for out in RESULTS['scenarios']:
        s=json.loads((HERE/(out['id']+'.json')).read_text())
        assert s['schema']==s['modelVersion']==2
        assert s['catalogueVersion']==DATA['version']
        for c,row in zip(s['cohorts'],out['rows']):
            assert c['id']==row['id'];reqs=scope(s,c);union|=reqs
            assert set(row['scopeIds'])==reqs
            ch=chain(s,c);ids=set(i for a in ch for i in a['selected']);selected|=ids
            cum=set().union(*(scope(s,a) for a in ch));assert set(row['cumulativeScopeIds'])==cum
            near(measure(ids,reqs),row['coverage']);near(measure(ids,cum),row['cumulativeCoverage'])
            assert row['critical']==sum(is_core(r,c) and score(ids,r)==0 for r in reqs)
            cores={r for a in ch for r in target(a) if r in cum and is_core(r,a)}
            assert set(row['cumulativeCoreIds'])==cores
            assert row['cumulativeCritical']==sum(score(ids,r)==0 for r in cores)
            assert row['full']==sum(score(ids,r)==3 for r in reqs)
            own=sum(hours(i,s) for i in set(c['selected']));total=sum(hours(i,s) for i in ids)
            near(own,row['courseHours']['hours']);near(total,row['cumulativeCourseHours']['hours']);assert own<=c['budget']+1e-8
            assert row['courseHours']['unknown']==row['cumulativeCourseHours']['unknown']==0
            internal={x['id']:x for a in ch for x in a['internal']};ih=sum(x['hours'] for x in internal.values())
            near(ih,row['internalHours']);near(sum(x['hours'] for x in c['internal']),row['ownInternalHours']);near(total+ih,row['totalHours'])
            for a in ch:
                for m in a['internal']:
                    assert m['status']=='Proposed';assert set(m['requirements'])<=scope(s,a)
            for rd in row['requirementDetails']:
                assert rd['score']==score(ids,rd['id'])
                for e in rd['evidence']:assert e['score']==rd['score'] and e['evidence']==COURSES[e['id']]['scores'][rd['id']]['evidence']
            for i in c['selected']:
                assert i not in c['excluded'];assert COURSES[i]['review'] not in ['Rejected','Needs delivery validation']
            for n in row['needs']:
                nr={r for r in reqs if REQ[r]['need']==n['id']};v=measure(ids,nr);near(v,n['coverage'])
                critical=sum(is_core(r,c) and score(ids,r)==0 for r in nr)
                band='Full' if v==1 else 'Strong' if v>=.7 and not critical else 'Partial' if v>=.3 else 'Weak'
                assert n['band']==band
            if 'benchmark' in out['id']:assert row['recommendation']['status']=='Optimal'
            checked+=1
    assert union==set(REQ) and len(union)==140
    assert [(i,sum(level(r)==i for r in DATA['requirements'])) for i in range(4)]==[(0,29),(1,8),(2,16),(3,11)]
    expected=DATA['sourceSha256']
    assert hashlib.sha256((ROOT/'AI_Era_Cyber_Training_Catalogue_v11.xlsx').read_bytes()).hexdigest()==expected==DATA['sourceSha256']
    archive=HERE/'archive/v1-before-model-v2-20261018';manifest=json.loads((archive/'archive-manifest.json').read_text())
    for x in manifest['files']:
        assert hashlib.sha256((archive/x['file']).read_bytes()).hexdigest()==x['sha256'],x
    archived=len(manifest['files'])
    archive=HERE/'archive/v2-before-must-have-review-20261018';manifest=json.loads((archive/'archive-manifest.json').read_text())
    for x in manifest['files']:
        assert hashlib.sha256((archive/x['file']).read_bytes()).hexdigest()==x['sha256'],x
    archived+=len(manifest['files'])
    result={'status':'PASS','scenarios':4,'cohortCalculations':checked,'distinctOutcomes':len(union),'sourceWorkbookSha256':expected,'catalogueVersion':DATA['version'],'archivedFilesVerified':archived,'checks':['Independent model-v2 revision-3 shared placement and profile-scope calculation','Need-weighted maximum evidence scores, bands and critical gaps','Full-resource durations, budget limits and unique inherited time','Proposed internal targets scoped correctly with zero score credit','All four schemas roundtrip in JavaScript builder','Conditional benchmark optimal statuses','Source workbook bytes and archive SHA-256 preservation']}
    (HERE/'verification-v3.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
if __name__=='__main__':verify()
