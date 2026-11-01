"""Compare recalculated plans with their archived v2 results."""
from pathlib import Path
import json,collections
P=Path(__file__).resolve().parent;R=P.parents[1]
a=json.loads((P/'archive/v2-before-must-have-review-20261018/results-v2.json').read_text());b=json.loads((P/'results-v3.json').read_text());rows=[]
for old,new in zip(a['scenarios'],b['scenarios']):
 assert len(old['rows'])==len(new['rows'])
 for x,y in zip(old['rows'],new['rows']):
  assert x['id']==y['id']
  rows.append({'scenario':new['id'],'cohort':y['id'],'name':y['name'],'ownCoverageBefore':x['coverage'],'ownCoverageAfter':y['coverage'],'cumulativeCoverageBefore':x['cumulativeCoverage'],'cumulativeCoverageAfter':y['cumulativeCoverage'],'criticalZerosBefore':x['critical'],'criticalZerosAfter':y['critical'],'cumulativeCriticalBefore':x['cumulativeCritical'],'cumulativeCriticalAfter':y['cumulativeCritical'],'hoursBefore':x['totalHours'],'hoursAfter':y['totalHours'],'selectedBefore':x['selected'],'selectedAfter':y['selected'],'outcomesAdded':sorted(set(y['scopeIds'])-set(x['scopeIds'])),'outcomesRemoved':sorted(set(x['scopeIds'])-set(y['scopeIds']))})
reviews=json.loads((R/'.catalogue-v11/reassessments.json').read_text());counts={}
for q in sorted({x['requirement'] for x in reviews}):
 rr=[x for x in reviews if x['requirement']==q]
 counts[q]={'numeric':sum(x['score'] is not None for x in rr),'unassessed':sum(x['score'] is None for x in rr),'changedNumericValues':sum(x['score']!=x['priorScore'] for x in rr if x['priorScore'] is not None),'distribution':dict(collections.Counter(str(x['score']) for x in rr))}
result={'planVersion':3,'baseline':'Archived annual plan v2, catalogue v10','current':'Annual plan v3, catalogue v11, capability model 2 revision 3','reassessments':counts,'cohortCalculations':len(rows),'selectionChanges':sum(x['selectedBefore']!=x['selectedAfter'] for x in rows),'recommendedCourseSelectionsRetained':all(x['selectedBefore']==x['selectedAfter'] for x in rows[:23]),'proposedRiskOverviewHours':.75,'interpretation':'Coverage changes reflect the revised outcome definitions and evidence. Critical-zero changes also reflect essential flags and applicability; they do not measure a loss or gain in learner competence. Internal modules remain proposed and unscored.','rows':rows}
previous=json.loads((P/'archive/v3-before-foundation-simplification-20261018/results-v3.json').read_text())
result['foundationRevision']={'revision':2,'before':previous['scenarios'][0]['rows'][0]['totalHours'],'after':b['scenarios'][0]['rows'][0]['totalHours'],'removedCourse':'INT-2787','briefAwarenessMinutes':10,'addedInternalHours':0}
(P/'change-impact-v3.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='rows'},indent=2))
for x in rows[:23]:
 if x['cohort'] in ['all','entry','practitioner','technical','testing','exposure','iam','iam-integration','architecture','harness','biso']:
  print(x['cohort'],f"coverage {x['ownCoverageBefore']*100:.1f}% -> {x['ownCoverageAfter']*100:.1f}%",f"critical {x['criticalZerosBefore']} -> {x['criticalZerosAfter']}",f"hours {x['hoursBefore']:.2f} -> {x['hoursAfter']:.2f}")
