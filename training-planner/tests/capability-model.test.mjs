import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import highsLoader from 'highs';
import {SPECIALISMS,sharedLevel,profileRequirements,crosswalk} from '../public/capability-model.js';
import {scope,targetScope,cumulativeScope,selectedIds,recommendationCohort,invalidateRecommendations,syncNeeds} from '../public/cohorts.js';
import {createScenario,validateScenario,serialize,deserialize,duplicateScenario} from '../public/storage.js';
import {eligibility,measure,timeTotal} from '../public/scoring.js';
import {prepareProblem,solveProblem} from '../public/optimisation.js';
const raw=readFileSync(new URL('../public/data/catalogue.json',import.meta.url));
const data=JSON.parse(raw),course=id=>data.courses.find(c=>c.id===id),ids=rs=>rs.map(r=>r.id),get=(s,id)=>s.cohorts.find(c=>c.id===id);
const legacy=JSON.parse(readFileSync(new URL('../scenario-history/default-scenario-v1.json',import.meta.url)));

test('all 140 unchanged source outcomes have a complete crosswalk; source evidence is untouched',()=>{
 // Role ordering and source-file identity can change without changing assessment evidence.
 // This digest is pinned to the evidence before the authorised 18 October role-label edit.
 const evidence={requirements:data.requirements,courses:data.courses,thresholds:data.thresholds,needs:data.needs.map(({group,...need})=>need)};
 assert.equal(createHash('sha256').update(JSON.stringify(evidence)).digest('hex'),'d50387dd7372a3e3d7db7a50bdcaf0b6a00a9325baae5ad89941be45d6f7909f');
 const rows=crosswalk(data),published=JSON.parse(readFileSync(new URL('../public/data/capability-crosswalk.json',import.meta.url)));
 assert.equal(rows.length,140);assert.deepEqual(published.requirements,rows);
 const known=new Set(ids(data.requirements));
 for(const role of SPECIALISMS)for(const id of role.requirements)assert.ok(known.has(id),id);
 for(const r of rows){assert.ok(r.agenticLevel!==null||r.specialisms.length,r.id);const source=data.requirements.find(x=>x.id===r.id);assert.equal(r.need,source.need);assert.equal(r.description,source.description);assert.equal(r.core,source.core);assert.deepEqual(r.source,source.source);}
 assert.equal(new Set(rows.map(r=>r.need)).size,23);
});

test('foundation and levels have distinct additive scope, with safe building retained',()=>{
 const s=createScenario(data),foundation=scope(data,get(s,'all'),s),entry=scope(data,get(s,'entry'),s),l2=scope(data,get(s,'practitioner'),s),l3=scope(data,get(s,'technical'),s);
 assert.deepEqual([foundation.length,entry.length,l2.length,l3.length],[29,8,16,11]);
 assert.ok(!ids(foundation).includes('N4.7'));assert.ok(ids(l2).includes('N4.7'));
 assert.ok(ids(l3).includes('N10.8'));assert.ok(ids(l3).includes('N11.1'));
 for(const id of ['N5.7','N10.3','N10.6','N10.7','N12.1','N13.1','N14.1'])assert.ok(!ids(cumulativeScope(data,s,get(s,'technical'))).includes(id),id);
 assert.equal(new Set([...foundation,...entry,...l2,...l3].map(r=>r.id)).size,64);
});

test('every role package is available independently at L1, L2 and L3',()=>{
 for(const specialism of SPECIALISMS)for(const level of [1,2,3]){
  const rs=ids(profileRequirements(data,{level,specialisms:[specialism.id]}));
  for(const id of specialism.requirements)assert.ok(rs.includes(id),`${specialism.id} L${level}: ${id}`);
 }
});

test('GRC L2 and L3, IAM L1 and leadership L1 express the intended profiles',()=>{
 const s=createScenario(data),grc2=ids(cumulativeScope(data,s,get(s,'governance'))),grc3=ids(cumulativeScope(data,s,get(s,'grc-builder'))),iam=ids(cumulativeScope(data,s,get(s,'iam'))),leader=ids(cumulativeScope(data,s,get(s,'leadership')));
 assert.ok(grc2.includes('N7.1')&&grc2.includes('N13.2'));assert.ok(!grc2.includes('N10.1'));
 assert.ok(grc3.includes('N10.1')&&grc3.includes('N11.1')&&grc3.includes('N13.2'));
 assert.ok(iam.includes('R9.1.7')&&!iam.includes('N7.1'));assert.equal(get(s,'iam').profile.level,1);
 assert.ok(leader.includes('N14.7')&&leader.includes('N11.4'));assert.ok(!leader.includes('N10.1'));assert.equal(get(s,'leadership').profile.level,1);
});

test('advanced role teaching passes audience filters without lifting the agentic level',()=>{
 const s=createScenario(data),c=get(s,'governance'),a=recommendationCohort(data,s,c);
 const sample={id:'sample',level:'Expert',type:'Course',duration:'1h',scores:{'N13.2':{score:2}},evidence:'Full syllabus'};
 assert.equal(eligibility(sample,a,{}),null);
 assert.equal(eligibility({...sample,scores:{'N13.2':{score:1}}},a,{}),'Outside audience filter');
 assert.equal(eligibility({...sample,scores:{'N10.1':{score:3}}},a,{}),'Outside audience filter');
 assert.equal(eligibility(sample,recommendationCohort(data,s,get(s,'practitioner')),{}),'Outside audience filter');
 const explicit={...c,addedRequirements:['N11.1']};
 assert.equal(eligibility({...sample,scores:{'N11.1':{score:3}}},recommendationCohort(data,s,explicit),{}),null);
 c.removedRequirements=['N13.2'];
 assert.equal(eligibility(sample,recommendationCohort(data,s,c),{}),'Outside audience filter');
});

test('role selections and inheritance deduplicate outcomes and learner time',()=>{
 const s=createScenario(data),c=get(s,'leadership');c.profile.specialisms.push('workflow-transformation','ai-governance');
 const reqs=scope(data,c,s);assert.equal(ids(reqs).filter(id=>id==='N14.1').length,1);assert.equal(ids(reqs).filter(id=>id==='N13.3').length,1);
 get(s,'all').selected=['INT-437'];get(s,'entry').selected=['INT-437'];c.selected=['INT-437'];
 assert.deepEqual(selectedIds(s,c),['INT-437']);assert.equal(timeTotal(selectedIds(s,c).map(course)).hours,timeTotal([course('INT-437')]).hours);
 assert.equal(measure(reqs,[course('INT-397'),course('INT-397')]).coverage,measure(reqs,[course('INT-397')]).coverage);
 // Removing inheritance puts all lower shared outcomes into this cohort's scope.
 c.parent=null;assert.ok(ids(scope(data,c,s)).includes('N6.1'));assert.ok(ids(scope(data,c,s)).includes('N1.1'));
});

test('tool training affects recorded practice/time but supplies no invented outcome evidence',()=>{
 const s=createScenario(data),c=get(s,'iam'),before=measure(scope(data,c,s),[]);
 const tool=data.courses.find(c=>c.track==='tool');c.profile.tools=[tool.tool];c.selected=[tool.id];
 assert.equal(Object.keys(tool.scores).length,0);assert.equal(measure(scope(data,c,s),[tool]).coverage,before.coverage);
 assert.match(eligibility(tool,recommendationCohort(data,s,c),{}),/assessment/);
 assert.equal(timeTotal([tool],{[tool.id]:2}).hours,2);assert.deepEqual(deserialize(serialize(s),data).scenario.cohorts.find(x=>x.id==='iam').profile.tools,[tool.tool]);
});

test('profile edits invalidate affected recommendations without discarding choices',()=>{
 const s=createScenario(data),c=get(s,'entry');for(const item of s.cohorts){item.selected=['INT-437'];item.recommendation={status:'Optimal'};}
 const selected=serialize(s.cohorts.map(c=>c.selected));invalidateRecommendations(s,c);
 assert.ok(!get(s,'all').needsReview);assert.ok(get(s,'governance').needsReview);assert.equal(get(s,'technical').recommendation,undefined);assert.equal(serialize(s.cohorts.map(c=>c.selected)),selected);
 assert.ok(validateScenario(s,data).some(x=>x.includes('Planning inputs changed')));
});

test('v2 roundtrips; v1 imports and duplicates retain all original scope and selections',()=>{
 const s=createScenario(data);assert.equal(s.schema,2);assert.equal(s.modelVersion,2);assert.deepEqual(deserialize(serialize(s),data).scenario,s);
 const imported=deserialize(serialize(legacy),data).scenario;assert.deepEqual(imported,legacy);assert.equal(imported.schema,1);assert.equal(imported.modelVersion,undefined);
 const copied=duplicateScenario(legacy);assert.equal(copied.schema,1);assert.deepEqual(copied.cohorts,legacy.cohorts);
 for(const c of imported.cohorts)assert.deepEqual(scope(data,c,imported),targetScope(data,c));
 assert.ok(ids(scope(data,get(imported,'technical'),imported)).includes('N12.1'));
});

test('the recalculated starter covers the full model without stale or unresolved selections',()=>{
 const s=JSON.parse(readFileSync(new URL('../public/data/default-scenario.json',import.meta.url)));
 assert.equal(s.schema,2);assert.deepEqual(validateScenario(s,data),[]);assert.equal(s.cohorts.length,23);
 assert.equal(new Set(s.cohorts.flatMap(c=>ids(scope(data,c,s)))).size,140);
 for(const c of s.cohorts){
  assert.ok(c.recommendation);assert.equal(c.needsReview,false);
  const inherited=new Set(selectedIds(s,c,false)),own=c.selected.filter(id=>!inherited.has(id)).map(course);
  assert.ok(timeTotal(own,s.overrides).hours<=c.budget+1e-7,c.id);
  for(const id of c.selected){assert.ok(!['TR-125','TR-128','TR-129'].includes(id));assert.equal(eligibility(course(id),recommendationCohort(data,s,c),s.overrides),null,id);}
 }
});

test('invalid profiles, future versions and incompatible inherited paths are rejected',()=>{
 for(const change of [s=>s.modelVersion=99,s=>get(s,'iam').profile.level=4,s=>get(s,'iam').profile.specialisms=['unknown'],s=>get(s,'iam').profile.tools='not-an-array',s=>get(s,'iam').rank=3,s=>get(s,'iam').parent='technical',s=>get(s,'iam').parent='governance',s=>get(s,'all').profile.specialisms=['ai-governance'],s=>s.schema=1]){
  const s=createScenario(data);change(s);assert.throws(()=>validateScenario(s,data),/Invalid scenario/);
 }
});

test('an L2 governance recommendation can select an Expert-labelled governance course',async()=>{
 const s=createScenario(data),c=get(s,'governance'),req=data.requirements.filter(r=>r.id==='N13.2');c.budget=1;
 const d={requirements:data.requirements,courses:[{id:'governance-course',level:'Expert',type:'Course',duration:'1h',scores:{'N13.2':{score:3}},evidence:'Full syllabus'}]};
 const p=prepareProblem(d,recommendationCohort(data,s,c),req,[],{}),result=solveProblem(await highsLoader(),p);
 assert.deepEqual(result.ids,['governance-course']);assert.equal(c.profile.level,2);
});
