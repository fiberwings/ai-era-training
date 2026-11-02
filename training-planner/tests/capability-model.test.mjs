import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import highsLoader from 'highs';
import {SPECIALISMS,sharedLevel,profileRequirements,crosswalk} from '../public/capability-model.js';
import {scope,targetScope,cumulativeScope,selectedIds,recommendationCohort,invalidateRecommendations,syncNeeds} from '../public/cohorts.js';
import {createScenario,validateScenario,serialize,deserialize,duplicateScenario} from '../public/storage.js';
import {eligibility,measure,timeTotal} from '../public/scoring.js';
import {prepareProblem,solveProblem} from '../public/optimisation.js';
const raw=readFileSync(new URL('../public/data/catalogue.json',import.meta.url));
const data=JSON.parse(raw),course=id=>data.courses.find(c=>c.id===id),ids=rs=>rs.map(r=>r.id),get=(s,id)=>s.cohorts.find(c=>c.id===id);
const legacy=JSON.parse(readFileSync(new URL('../scenario-history/default-scenario-v1.json',import.meta.url)));

test('approved v11 revisions retain every unaffected score and a complete 140-outcome crosswalk',()=>{
 const prior=JSON.parse(readFileSync(new URL('../catalogue-history/d2604d12cdfe9509.json',import.meta.url)));
 const v11=JSON.parse(readFileSync(new URL('../catalogue-history/6f245643cc5bf083.json',import.meta.url)));
 assert.deepEqual(data.thresholds,prior.thresholds);
 const changed=new Set(['N5.1','N5.2','N5.8','R3.1.2','R4.1.3']);
 for(const old of prior.courses){const current=v11.courses.find(c=>c.id===old.id);assert.ok(current,old.id);
  for(const [id,score] of Object.entries(old.scores))if(!changed.has(id))assert.deepEqual(current.scores[id],score,`${old.id}/${id}`);
  for(const [id,score] of Object.entries(old.unassessed))if(!changed.has(id))assert.deepEqual(current.unassessed[id],score,`${old.id}/${id}`);
 }
 assert.ok(!data.requirements.some(r=>r.id==='N5.2'));
 assert.ok(data.requirements.find(r=>r.id==='N5.8').core);
 assert.equal(data.requirements.find(r=>r.id==='N6.4').title,'Accountability');
 for(const r of prior.requirements.filter(r=>r.need==='N8'||r.id==='N5.4'))assert.deepEqual(data.requirements.find(x=>x.id===r.id),r);
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

test('conditional essentials follow activities; delegated-token depth follows integration',()=>{
 const s=createScenario(data),builder=get(s,'technical'),biso=get(s,'biso');
 assert.equal(scope(data,builder,s).find(r=>r.id==='N11.3').core,false);
 builder.profile.activities=['automated-judges'];
 assert.equal(scope(data,builder,s).find(r=>r.id==='N11.3').core,true);
 assert.equal(scope(data,biso,s).find(r=>r.id==='R6.1.2').core,false);
 biso.profile.activities=['ai-assisted-assurance'];
 assert.equal(scope(data,biso,s).find(r=>r.id==='R6.1.2').core,true);
 assert.ok(!ids(targetScope(data,get(s,'iam'))).includes('R9.1.2'));
 assert.ok(ids(targetScope(data,get(s,'iam-integration'))).includes('R9.1.2'));
 assert.ok(scope(data,get(s,'iam'),s).find(r=>r.id==='R9.1.3').core);
 assert.ok(ids(scope(data,get(s,'all'),s)).includes('N5.4'));
 assert.ok(ids(scope(data,get(s,'all'),s)).includes('N5.8'));
 const grc=get(s,'grc-builder');builder.profile.activities=[];grc.profile.activities=['automated-judges'];
 assert.ok(cumulativeScope(data,s,grc).find(r=>r.id==='N11.3').core);
 assert.equal(ids(cumulativeScope(data,s,grc)).filter(id=>id==='N11.3').length,1);
 const old=structuredClone(s);delete old.modelRevision;assert.ok(validateScenario(old,data).some(x=>x.includes('Must-have applicability')));
 assert.deepEqual(validateScenario(s,data),[]);
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
 assert.ok(get(s,'all').recommendation);assert.equal(get(s,'governance').recommendation,undefined);assert.equal(get(s,'technical').recommendation,undefined);assert.equal(serialize(s.cohorts.map(c=>c.selected)),selected);
 assert.ok(s.cohorts.every(c=>!Object.hasOwn(c,'needsReview')));
 s.status='Finalised';assert.deepEqual(validateScenario(s,data),[]);
});

test('legacy saved review flags no longer warn or block finalisation',()=>{
 const s=createScenario(data);
 for(const c of s.cohorts){c.needsReview=true;c.review={date:'2026-10-30T00:00:00.000Z',note:'Earlier review'};}
 invalidateRecommendations(s,get(s,'all'));s.status='Finalised';
 const text=serialize(s),restored=deserialize(text,data);
 assert.deepEqual(restored.warnings,[]);assert.equal(serialize(restored.scenario),text);
});

test('v2 roundtrips; v1 imports and duplicates retain all original scope and selections',()=>{
 const s=createScenario(data);assert.equal(s.schema,2);assert.equal(s.modelVersion,2);assert.deepEqual(deserialize(serialize(s),data).scenario,s);
 const imported=deserialize(serialize(legacy),data).scenario;assert.deepEqual(imported,legacy);assert.equal(imported.schema,1);assert.equal(imported.modelVersion,undefined);
 const copied=duplicateScenario(legacy);assert.equal(copied.schema,1);assert.deepEqual(copied.cohorts,legacy.cohorts);
 for(const c of imported.cohorts)assert.deepEqual(scope(data,c,imported),targetScope(data,c));
 assert.ok(ids(scope(data,get(imported,'technical'),imported)).includes('N12.1'));
});

test('current legacy starter applies the approved retirement to the preserved annual v3 decisions',()=>{
 const s=JSON.parse(readFileSync(new URL('../public/data/default-scenario.json',import.meta.url)));
 const annual=JSON.parse(readFileSync(new URL('../../archive/analysis/2027-training-plan/2027-recommended-v3.json',import.meta.url)));
 const expected=structuredClone(annual);
 expected.planRevision=3;const l3=get(expected,'technical');l3.selected=l3.selected.filter(id=>id!=='TR-229');l3.excluded.push('TR-229');
 assert.deepEqual({...s,catalogueVersion:annual.catalogueVersion,assumptions:annual.assumptions},expected);
 assert.ok(s.assumptions.startsWith(annual.assumptions));
 assert.equal(s.planVersion,3);assert.equal(s.modelVersion,2);assert.equal(s.catalogueVersion,data.version);
 assert.equal(s.cohorts.length,23);assert.deepEqual(validateScenario(s,data),[]);
 assert.deepEqual(deserialize(serialize(s),data).scenario,s);
 assert.equal(new Set(s.cohorts.flatMap(c=>ids(scope(data,c,s)))).size,140);
 for(const c of s.cohorts){
  assert.equal(c.recommendation,undefined);assert.equal(c.needsReview,false);
  const applicable=new Set(ids(scope(data,c,s)));
  for(const item of c.internal){assert.equal(item.status,'Proposed');assert.ok(item.requirements.every(id=>applicable.has(id)));}
  const time=timeTotal(c.selected.map(course),s.overrides);assert.equal(time.unknown,0);assert.ok(time.hours<=c.budget+1e-8);
  for(const id of c.selected){assert.ok(!['TR-125','TR-128','TR-129','TR-279'].includes(id));assert.equal(eligibility(course(id),recommendationCohort(data,s,c),s.overrides),null,id);}
 }
 assert.deepEqual(get(s,'all').selected,['INT-437']);
 assert.equal(get(s,'all').budget,2);
 assert.equal(s.planRevision,3);
 assert.ok(get(s,'all').excluded.includes('INT-2787'));
 assert.match(eligibility(course('INT-2787'),{...get(s,'all'),excluded:[],filters:{audience:false,types:[]}},{}),/Too specialised for Foundation/);
 assert.equal(eligibility(course('INT-2787'),{...get(s,'entry'),excluded:[],filters:{audience:false,types:[]}},{}),null);
 const prior=structuredClone(s);get(prior,'all').selected.push('INT-2787');assert.ok(validateScenario(prior,data).some(w=>w.includes('remove INT-2787')));
 assert.ok(get(s,'practitioner').selected.includes('TR-191'));
 assert.ok(get(s,'harness').selected.includes('TR-179'));
 assert.equal(get(s,'leadership').profile.level,1);assert.equal(get(s,'iam-integration').profile.level,1);
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
