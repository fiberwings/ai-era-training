import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createComponentScenario,newComponent,componentScope,componentTime,componentAudience,pathComponents,pathMetrics,validateComponentScenario,invalidateComponent,dependentAudiences,cloneForAudience,composeAudience,courseSuggestions} from '../public/components.js';
import {prepareProblem} from '../public/optimisation.js';
import {groupedOutcomes,audienceLabel} from '../public/presentation.js';
import {catalogueReview} from '../public/catalogue-identity.js';
import {validateScenario,serialize,deserialize} from '../public/storage.js';
import {measure,measurePlan} from '../public/scoring.js';
import {scope} from '../public/cohorts.js';
const load=name=>JSON.parse(fs.readFileSync(new URL('../public/data/'+name+'.json',import.meta.url)));
const data=load('catalogue'),legacy=load('default-scenario');
const make=()=>createComponentScenario(data,'Test',legacy),get=(s,id)=>s.components.find(c=>c.id===id);

test('blank starter preserves all audience templates, activities, responsibility scope and provisional budgets',()=>{
 const s=make();assert.equal(s.components.length,21);assert.equal(s.audiences.length,19);assert.deepEqual(validateScenario(s,data),[]);
 assert.ok(s.components.every(c=>!c.selected.length&&!c.internal.length&&!c.pinned.length));
 assert.deepEqual(s.components.slice(0,4).map(c=>c.budget),[2,2,8,24]);assert.ok(s.components.slice(4).every(c=>c.budget===4));
 assert.ok(s.audiences.find(a=>a.id==='biso').activities.includes('ai-assisted-assurance'));
 assert.ok(s.audiences.find(a=>a.id==='grc-builder').activities.includes('automated-judges'));
 assert.deepEqual(load('component-starter').audiences,s.audiences);
 for(const a of s.audiences){const old=legacy.cohorts.find(c=>c.id===a.id);assert.equal(a.name,old.name);assert.equal(a.level,old.profile.level);assert.deepEqual(a.specialisms,old.profile.specialisms);}
});
test('Foundation has exactly 29 outcomes, correct category boundaries and unchanged regression evidence',()=>{
 const s=make(),f=get(s,'foundation'),m=pathMetrics(data,s,f);assert.equal(m.rows.length,29);assert.equal(m.coverage,0);assert.equal(m.needs.length,5);
 for(const id of ['N5.1','N5.4','N5.8'])assert.ok(m.rows.some(r=>r.id===id));for(const id of ['N4.7','N5.7','N5.2'])assert.ok(!m.rows.some(r=>r.id===id));
 f.selected=['INT-437'];const chosen=pathMetrics(data,s,f),old=measure(scope(data,legacy.cohorts[0],legacy),data.courses.filter(c=>c.id==='INT-437'),data.thresholds);assert.equal(chosen.coverage,old.coverage);assert.equal((100*chosen.coverage).toFixed(1),'17.9');assert.equal(chosen.critical,7);
});
test('grouping retains all 140 outcome IDs with explicit level/specialism cross references',()=>{
 const groups=groupedOutcomes(data),ids=new Set(groups.flatMap(g=>g.needs.flatMap(n=>n.rows.map(r=>r.id))));assert.equal(ids.size,140);
 const inGroup=(name,id)=>groups.find(g=>g.name===name).needs.some(n=>n.rows.some(r=>r.id===id));
 assert.ok(inGroup('L2 Practitioner','N4.7'));assert.ok(inGroup('Specialisms','N5.7'));assert.ok(inGroup('Specialisms','N10.3'));assert.ok(!inGroup('L3 Expert','N10.3'));
 assert.ok(inGroup('L3 Expert','N11.4'));assert.ok(inGroup('Specialisms','N11.4'));assert.equal(groups.at(-1).needs.length,0);
 assert.equal(audienceLabel('Base'),'Foundation');assert.equal(audienceLabel('Expert'),'L3 Expert');
});
test('composed paths deduplicate shared teaching, outcomes and internal learner time',()=>{
 const s=make(),a=s.audiences.find(a=>a.id==='leadership'),f=get(s,'foundation'),p=get(s,'specialism-vendor-evaluation');f.selected=['INT-437'];p.selected=['INT-437'];
 const item={id:'same',title:'Practice',owner:'Owner',hours:2,requirements:['N1.1'],outcomes:'Explain a case',status:'Ready'};f.internal=[item];p.internal=[structuredClone(item)];
 const m=pathMetrics(data,s,a);assert.equal(m.ids.length,1);assert.equal(m.items.length,1);assert.equal(m.total.hours,m.time.hours+2);assert.equal(new Set(m.rows.map(r=>r.id)).size,m.rows.length);
 const courses=data.courses.filter(c=>c.id==='INT-437');assert.equal(m.coverage,measure(m.requirements,courses,data.thresholds).coverage);
});
test('internal training recalculates planned coverage on add, edit and removal without changing assessments',()=>{
 const s=make(),f=get(s,'foundation');f.selected=['INT-437'];
 const before=pathMetrics(data,s,f),r=before.rows.find(r=>r.core&&r.score===0);
 const item={id:'internal',title:'Workshop',owner:'Trainer',hours:1,requirements:[r.id],outcomes:r.description,status:'Proposed'};
 for(const status of ['Proposed','In development','Ready']){
  f.internal=[{...item,status}];const m=pathMetrics(data,s,f);
  assert.equal(m.coverage,before.coverage);assert.equal(m.critical,before.critical);
  assert.ok(m.planned.coverage>before.coverage);assert.equal(m.planned.critical,before.critical-1);
  assert.equal(m.planned.rows.find(x=>x.id===r.id).score,3);
  assert.equal(m.rows.find(x=>x.id===r.id).score,0);
 }
 f.internal[0].requirements=[];assert.equal(pathMetrics(data,s,f).planned.coverage,before.coverage);
 f.internal=[];assert.deepEqual(pathMetrics(data,s,f).planned,measure(before.requirements,before.courses,data.thresholds));
});
test('planned coverage retains need weighting, maxima, scope and overlap without assessment credit',()=>{
 const reqs=[{id:'a',need:'A',core:true},{id:'b',need:'B'},{id:'c',need:'B'}],courses=[{scores:{a:{score:1},b:{score:2}}}],items=[{requirements:['a','a','outside']},{requirements:['a']}];
 const m=measurePlan(reqs,courses,items);
 assert.equal(m.coverage,(1/3+1/3)/2);assert.equal(m.planned.coverage,(1+1/3)/2);
 assert.equal(m.planned.critical,0);assert.equal(m.planned.rows.length,3);
 assert.equal(m.planned.rows.find(r=>r.id==='b').score,2);
 const internalOnly=measurePlan(reqs,[],[{requirements:['a']}]);assert.equal(internalOnly.rows[0].assessed,false);assert.equal(internalOnly.rows[0].score,0);assert.equal(internalOnly.planned.coverage,.5);
 assert.equal(measurePlan([],courses,items).planned.coverage,0);
});
test('internal coverage propagates to dependent paths, survives import and does not double count shared teaching',()=>{
 const s=make(),f=get(s,'foundation'),a=s.audiences.find(a=>a.id==='leadership'),p=get(s,'specialism-vendor-evaluation');
 const item={id:'shared-internal',title:'Workshop',owner:'Trainer',hours:2,requirements:['N1.1'],outcomes:'Teach N1.1',status:'Proposed'};
 f.internal=[item];const single=pathMetrics(data,s,a);p.internal=[structuredClone(item)];
 const duplicate=pathMetrics(data,s,a);assert.equal(duplicate.planned.coverage,single.planned.coverage);assert.equal(duplicate.total.hours,2);
 const restored=deserialize(serialize(s),data).scenario;assert.equal(pathMetrics(data,restored,restored.audiences.find(x=>x.id===a.id)).planned.coverage,single.planned.coverage);
 assert.ok(pathMetrics(data,s,get(s,'l1')).planned.coverage>0);
 assert.equal(pathMetrics(data,s,p).planned.coverage,0); // Linked N1.1 is outside this component's scope.
});
test('shared teaching changes recalculate dependent coverage without requiring a review to finalise',()=>{
 const s=make(),f=get(s,'foundation'),a=s.audiences.find(a=>a.id==='governance');
 for(const c of s.components)c.recommendation={message:'Previous recommendation'};
 f.selected=['INT-437'];const before=pathMetrics(data,s,a);
 f.selected=[];invalidateComponent(s,f.id);const after=pathMetrics(data,s,a);
 assert.ok(after.coverage<before.coverage);assert.ok(after.total.hours<before.total.hours);
 for(const id of ['foundation','l1','l2','l3'])assert.equal(get(s,id).recommendation,undefined);
 assert.ok(get(s,'specialism-ai-governance').recommendation);
 assert.ok([...s.components,...s.audiences].every(x=>!Object.hasOwn(x,'needsReview')));
 s.status='Finalised';assert.deepEqual(validateScenario(s,data),[]);
});
test('audience-specific variants do not retain the original dependency or require review',()=>{
 const s=make();
 const a=s.audiences.find(a=>a.id==='governance'),copy=cloneForAudience(s,'foundation',a.id),chain=pathComponents(s,a);assert.ok(chain.some(c=>c.id===copy.id));assert.ok(!chain.some(c=>c.id==='foundation'));assert.ok(!dependentAudiences(s,'foundation').some(x=>x.id===a.id));assert.ok(dependentAudiences(s,'foundation').some(x=>x.id==='iam'));assert.equal(new Set(chain.map(c=>c.level).filter(Number.isInteger)).size,3);assert.doesNotThrow(()=>validateScenario(s,data));
 assert.ok([...s.components,...s.audiences].every(x=>!Object.hasOwn(x,'needsReview')));
});
test('saved review flags and notes are inert on import and do not block finalisation',()=>{
 const s=make();
 for(const x of [...s.components,...s.audiences]){x.needsReview=true;x.review={date:'2026-10-30T00:00:00.000Z',note:'Earlier review'};}
 get(s,'foundation').selected=['INT-437'];invalidateComponent(s,'foundation');s.status='Finalised';
 const text=serialize(s),restored=deserialize(text,data);
 assert.deepEqual(restored.warnings,[]);assert.equal(serialize(restored.scenario),text);
 assert.ok(pathMetrics(data,restored.scenario,restored.scenario.audiences[0]).coverage>0);
});
test('conditional must-haves follow explicit audience activities without changing scope',()=>{
 const s=make(),a=s.audiences.find(a=>a.id==='biso');const before=pathMetrics(data,s,a);assert.equal(before.rows.find(r=>r.id==='R6.1.2').core,true);a.activities=[];const after=pathMetrics(data,s,a);assert.equal(after.rows.find(r=>r.id==='R6.1.2').core,false);assert.equal(before.rows.length,after.rows.length);
});
test('tooling requires product and task, and unassessed tooling adds time without evidence credit',()=>{
 const s=make(),a=s.audiences.find(a=>a.id==='iam'),tool=newComponent('tool','Claude use','Tooling',null,[],{tool:'Claude',tasks:['use']});s.components.push(tool);a.components.push(tool.id);assert.deepEqual(validateScenario(s,data),[]);
 const before=pathMetrics(data,s,a).coverage;tool.selected=['TR-151'];s.overrides['TR-151']=1;const after=pathMetrics(data,s,a);assert.equal(after.coverage,before);assert.equal(after.time.hours,1);
 tool.tasks=[];assert.throws(()=>validateScenario(s,data),/tool and tasks/);
});
test('ranked suggestions match independent before/after scores, time and budget',()=>{
 const s=make(),c=get(s,'foundation');c.selected=['INT-437'];const suggestions=courseSuggestions(data,s,c,c,'N5.8');assert.ok(suggestions.length>0);
 for(const x of suggestions){const base=pathMetrics(data,s,c),next=measure(componentScope(data,c),[...base.courses,x.course],data.thresholds);assert.ok(x.after>x.before);assert.equal(x.gain,next.coverage-base.coverage);if(x.fits)assert.ok(x.hours<=.25+1e-8);}
 assert.ok(suggestions.find(x=>x.course.id==='INT-2787')?.reason||!suggestions.some(x=>x.course.id==='INT-2787'));
});
test('version comparison names affected references without changing the saved plan',()=>{
 const s=make();s.catalogueVersion='previous';get(s,'foundation').selected=['INT-437'];const before=serialize(s),prior=structuredClone(data);prior.version='previous';prior.courses.find(c=>c.id==='INT-437').title='Previous title';prior.requirements[0].title='Previous outcome';
 const r=catalogueReview(s,data,prior);assert.deepEqual(r.changedCourses,['INT-437']);assert.ok(r.changedOutcomes.includes(data.requirements[0].id));assert.equal(r.comparisonAvailable,true);assert.equal(catalogueReview(s,data).comparisonAvailable,false);assert.equal(serialize(s),before);assert.match(validateScenario(s,data)[0],/saved previous; loaded/);
});
test('legacy inputs remain unchanged and schema 3 roundtrips; finalisation permits evidence gaps',()=>{
 const before=serialize(legacy);assert.deepEqual(deserialize(before,data).scenario,legacy);const s=make();s.status='Finalised';assert.deepEqual(validateScenario(s,data),[]);assert.deepEqual(deserialize(serialize(s),data).scenario,s);assert.equal(serialize(legacy),before);
});
test('dependency cycles, unknown references and incompatible levels fail clearly',()=>{
 let s=make();get(s,'l1').dependencies=['l2'];assert.throws(()=>validateScenario(s,data),/cycle/);
 s=make();s.audiences[0].components.push('missing');assert.throws(()=>validateScenario(s,data),/Unknown component/);
 s=make();s.audiences[0].components.push('l3');assert.throws(()=>validateScenario(s,data),/above target/);
 s=make();get(s,'foundation').selected=['missing'];assert.ok(validateScenario(s,data).some(x=>x.includes('unresolved course missing')));
});
test('component recommendations retain inherited courses, pins and specialist eligibility',()=>{
 const s=make(),f=get(s,'foundation'),l1=get(s,'l1');f.selected=['INT-437'];l1.selected=['INT-437'];assert.equal(componentTime(data,s,l1).hours,0);
 const problem=prepareProblem(data,componentAudience(l1),componentScope(data,l1),pathMetrics(data,s,f).courses,s.overrides);assert.ok(!problem.candidates.some(c=>c.id==='INT-437'));
 f.selected=['INT-437'];f.pinned=['INT-437'];f.budget=0;assert.throws(()=>prepareProblem(data,componentAudience(f),componentScope(data,f),[],{}),/Pinned courses exceed/);
 const specialist=componentAudience(get(s,'specialism-ai-governance'));assert.ok(specialist.specialistRequirements.includes('N13.1'));
});
test('unknown existing course hours cannot claim a suggestion fits the remaining budget',()=>{
 const s=make(),f=get(s,'foundation');f.selected=['TR-151'];assert.equal(componentTime(data,s,f).unknown,1);assert.ok(courseSuggestions(data,s,f,f,'N5.8').every(x=>!x.fits));
});
test('raising an audience level preserves its local Foundation variant without importing original teaching',()=>{
 const s=make(),a=s.audiences.find(a=>a.id==='iam');a.components.reverse();const variant=cloneForAudience(s,'foundation',a.id);get(s,'foundation').selected=['INT-437'];variant.selected=['TR-078'];
 a.components=composeAudience(s,a,3,a.specialisms,[]);a.level=3;assert.doesNotThrow(()=>validateScenario(s,data));const m=pathMetrics(data,s,a);assert.ok(m.ids.includes('TR-078'));assert.ok(!m.ids.includes('INT-437'));assert.deepEqual(m.components.filter(c=>Number.isInteger(c.level)).map(c=>c.level),[0,1,2,3]);
 a.components=composeAudience(s,a,0,[],[]);a.level=0;a.specialisms=[];assert.doesNotThrow(()=>validateScenario(s,data));assert.deepEqual(pathMetrics(data,s,a).ids,['TR-078']);
});
