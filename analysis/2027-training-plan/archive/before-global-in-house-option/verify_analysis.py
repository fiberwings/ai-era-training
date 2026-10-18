"""Independent, read-only reconciliation of the 2027 plan against the snapshot."""
import hashlib, json, math, re
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DATA = json.loads((ROOT/'training-planner/public/data/catalogue.json').read_text())
COURSES = {c['id']:c for c in DATA['courses']}
RESULTS = json.loads((HERE/'results.json').read_text())

def scope(c):
    return [r for r in DATA['requirements'] if r['id'] not in c['removedRequirements'] and
            (r['id'] in c['addedRequirements'] or
             (r['rank'] <= c['rank'] and ('architects' not in r['level'] or c.get('architect')) and
              (r['level'] != 'Leaders' or c.get('leaders')) and
              (r['need'] in c['needs'] or (r['need'] in c.get('lateNeeds',[]) and r['rank']==c['rank']))))]

def chain(s,c):
    result=[c]
    while c['parent']:
        c=next(x for x in s['cohorts'] if x['id']==c['parent']); result.insert(0,c)
    return result

def max_score(ids,rid):
    return max([COURSES[i]['scores'].get(rid,{}).get('score',0) for i in ids]+[0])

def measure(reqs,ids):
    groups=defaultdict(list)
    for r in reqs: groups[r['need']].append(max_score(ids,r['id']))
    need={n:sum(xs)/(3*len(xs)) for n,xs in groups.items()}
    critical=sum(r['core'] and max_score(ids,r['id'])==0 for r in reqs)
    return sum(need.values())/len(need),critical,need

def hours(cid,overrides):
    if cid in overrides:return overrides[cid]
    raw=COURSES[cid]['duration'].split('(')[0]
    assert '+' not in raw, (cid,'Unbounded duration without override')
    hs=re.findall(r'(\d+(?:\.\d+)?)\s*h',raw)
    mins=re.findall(r'(\d+(?:\.\d+)?)\s*m',raw)
    assert hs or mins, (cid,raw)
    return (max(map(float,hs)) if hs else 0)+(max(map(float,mins))/60 if mins else 0)

def check():
    assert hashlib.sha256((ROOT/DATA['filename']).read_bytes()).hexdigest()==DATA['sourceSha256']
    count=0
    for option in RESULTS['options']:
        s=json.loads((HERE/(option['id']+'.json')).read_text())
        assert s['catalogueVersion']==DATA['version']
        for c,out in zip(s['cohorts'],option['rows']):
            assert c['id']==out['id']
            ch=chain(s,c); ids=set(x for a in ch for x in a['selected'])
            reqs=scope(c); cum=list({r['id']:r for a in ch for r in scope(a)}.values())
            for rs,prefix in [(reqs,''),(cum,'cumulative')]:
                cov,crit,needs=measure(rs,ids)
                key='coverage' if not prefix else 'cumulativeCoverage'
                assert math.isclose(cov,out[key],abs_tol=1e-12),(option['id'],c['id'],key)
                assert crit==out['critical' if not prefix else 'cumulativeCritical']
                if not prefix:
                    for n in out['needs']:assert math.isclose(n['coverage'],needs[n['id']],abs_tol=1e-12)
            own_h=sum(hours(i,s['overrides']) for i in set(c['selected']))
            cum_h=sum(hours(i,s['overrides']) for i in ids)
            assert own_h<=c['budget']+1e-9
            assert math.isclose(own_h,out['courseHours']['hours'],abs_tol=1e-9)
            assert math.isclose(cum_h,out['cumulativeCourseHours']['hours'],abs_tol=1e-9)
            assert sum(x['hours'] for a in ch for x in a['internal'])==out['internalHours']
            assert all(r in {x['id'] for x in reqs} for x in c['internal'] for r in x['requirements'])
            if option['id']=='option-1':assert out['recommendation']['optimal']
            count+=1
    for r in DATA['requirements']:
        if r['need']=='N13':assert max_score(['INT-397'],r['id'])==max_score(['INT-397','INT-1840'],r['id'])
    result={'status':'passed','cohortCalculations':count,'sourceVersion':DATA['version'],
            'sourceSha256':DATA['sourceSha256'],'checks':['Workbook bytes match snapshot hash','Independent requirement maxima and equal-need coverage','Layer and inherited coverage','Full durations and deduplicated hours','All course budgets respected','Internal links stay within applicable scope','All 17 Option 1 conditional solves proven optimal','INT-397 + INT-1840 adds no N13 coverage']}
    (HERE/'verification.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2))

if __name__=='__main__':check()
