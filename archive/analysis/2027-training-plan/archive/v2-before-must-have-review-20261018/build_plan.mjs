// Version 2 annual plan. Source assessments and the capability model are read-only.
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createScenario,validateScenario,serialize,deserialize} from '../../training-planner/public/storage.js';
import {scope,selectedIds,cumulativeScope,ancestors,recommendationCohort} from '../../training-planner/public/cohorts.js';
import {measure,timeTotal,scoreFor,gapType,eligibility} from '../../training-planner/public/scoring.js';
import {duration} from '../../training-planner/public/duration.js';
import {prepareProblem,solveProblem} from '../../training-planner/public/optimisation.js';
import {crosswalk,LEVELS,SPECIALISMS,NEED_TITLES} from '../../training-planner/public/capability-model.js';
import {ROLE_FAMILIES,NEED_DOMAINS} from '../../training-planner/public/model-explanation.js';
const here=new URL('./',import.meta.url),root=new URL('../../',here),read=async p=>JSON.parse(await readFile(new URL(p,root)));
const data=await read('training-planner/public/data/catalogue.json'),by=new Map(data.courses.map(c=>[c.id,c]));
const config=await read('analysis/2027-training-plan/plan-config-v2.json');
const design=await read('analysis/2027-training-plan/in-house-design-v2.json');
const cs=ids=>ids.map(id=>{assert.ok(by.has(id),id);return by.get(id);});
const selected=config.selected,excluded=config.globalExclusions;
const s=createScenario(data,'2027 recommended training plan — v2');
s.id='2027-recommended-v2';s.created='2026-10-18T00:00:00.000Z';s.planVersion=2;s.planningYear=2027;
s.assumptions=config.assumptions;s.overrides=config.durationOverrides;
for(const c of s.cohorts){
 c.selected=selected[c.id];assert.ok(c.selected,c.id);c.budget=config.budgets[c.id]??c.budget;
 c.excluded=[...excluded];c.needsReview=false;c.rationale=config.rationale[c.id];c.note=config.audience[c.id];
 c.internal=design.modules.filter(m=>m.cohorts.includes(c.id)).map(m=>({id:m.code,title:m.title,owner:m.owner,hours:m.hours,requirements:m.requirements,outcomes:m.evidence,status:'Proposed'}));
 const applicable=new Set(scope(data,c,s).map(r=>r.id));
 for(const item of c.internal)assert.ok(item.requirements.every(id=>applicable.has(id)),`${c.id}/${item.id}: internal target outside profile`);
 for(const id of c.selected){assert.ok(!c.excluded.includes(id));assert.equal(eligibility(by.get(id),recommendationCohort(data,s,c),s.overrides),null,`${c.id}/${id}`);}
 assert.ok(timeTotal(cs(c.selected),s.overrides).hours<=c.budget+1e-8,c.id);
 assert.equal(timeTotal(cs(c.selected),s.overrides).unknown,0,c.id);
}
assert.deepEqual(validateScenario(s,data),[]);
assert.equal(new Set(s.cohorts.flatMap(c=>scope(data,c,s).map(r=>r.id))).size,140);
const coding=structuredClone(s);coding.id='2027-coding-v2';coding.name='2027 code-ready adaptation — v2';
coding.cohorts.find(c=>c.id==='entry').selected=['TR-211'];
coding.cohorts.find(c=>c.id==='entry').rationale='Claude Code provides context, session management and testing practice for Python/Git-ready learners with an approved environment. This is a targeted replacement for the general L1 course.';
coding.cohorts.find(c=>c.id==='entry').note='People using AI coding assistance who already have Python/Git familiarity and an approved coding environment. Other learners use the general L1 route.';
coding.assumptions+=' Coding adaptation: replace Build with Andrew with the complete 2h Claude Code course for learners already familiar with Python/Git and with an approved environment. All internal safe-use practice remains. No assumption of organisation-wide Claude Code access.';
const coached=structuredClone(s);coached.id='2027-coached-v2';coached.name='2027 coached no-code adaptation — v2';
coached.cohorts.find(c=>c.id==='practitioner').selected=['TR-191','TR-110'];
coached.cohorts.find(c=>c.id==='technical').selected=[];
coached.cohorts.find(c=>c.id==='practitioner').rationale='Use Skills and agent-security teaching with supported evaluation practice. Pilot Skills exercises for accessibility; retain full-course coverage only if learners complete the assessed content. The additional internal practice is proposed and unscored.';
coached.cohorts.find(c=>c.id==='technical').rationale='Use a validated no-code scaffold with guided build and evaluation practice, followed by the original capstone and independent challenge. There is no assigned L3 external course in this adaptation; its low source coverage exposes the need to develop and assess the internal curriculum before rollout.';
coached.cohorts.find(c=>c.id==='technical').note='No-code/low-code agent builders at L3. Delivery depends on an approved platform, accessible exercises, coach capacity and independent assessment; coding is not the level definition.';
coached.cohorts.find(c=>c.id==='practitioner').note='Agent supervisors using supported evaluation practice. Validate accessibility of the complete Skills course and bank exercises before assignment.';
coached.assumptions+=' Coached no-code adaptation: remove Python-dependent TR-100 and the three L3 courses; add supported evaluation practice and an approved no-code scaffold workshop. These internal proposals earn no syllabus points. The lower displayed coverage is an evidence gap, not permission to skip outcomes. Delivery requires a validated platform, calibrated assessors and approved build capacity.';
for(const [cid,code] of [['practitioner','COACH-L2'],['technical','COACH-L3']]){
 const m=design.adaptations.find(m=>m.code===code);
 coached.cohorts.find(c=>c.id===cid).internal.push({id:m.code,title:m.title,owner:m.owner,hours:m.hours,requirements:m.requirements,outcomes:m.evidence,status:'Proposed'});
}
const benchmark=structuredClone(s);benchmark.id='2027-coverage-benchmark-v2';benchmark.name='2027 coverage benchmark — v2';
benchmark.assumptions='Diagnostic comparison only. Same model-v2 profiles, course budgets, exclusions, duration rules and internal proposals as the recommended plan. Each cohort is optimised in sequence, conditional on the chosen shared learning; this is not a global workforce optimum. Source audience rules are applied, but delivery suitability and learning quality are not optimisation objectives. Do not automatically adopt these selections.';
const require=createRequire(import.meta.url),highs=await require('../../training-planner/node_modules/highs')();
for(const c of benchmark.cohorts){
 const p=prepareProblem(data,recommendationCohort(data,benchmark,c),scope(data,c,benchmark),cs(selectedIds(benchmark,c,false)),benchmark.overrides),r=solveProblem(highs,p);
 c.selected=r.ids;c.recommendation=r;console.log('benchmark',c.id,r.status);
 c.rationale='Solver-selected coverage benchmark under this profile and budget. This selection has not been endorsed for delivery suitability; review prerequisites, framework overlap and task relevance before use.';
}
const scenarios=[s,coding,coached,benchmark];
function describe(s){return {id:s.id,name:s.name,rows:s.cohorts.map(c=>{
 const ids=selectedIds(s,c),courses=cs(ids),reqs=scope(data,c,s),m=measure(reqs,courses,data.thresholds),cumReqs=cumulativeScope(data,s,c),cum=measure(cumReqs,courses,data.thresholds);
 const internal=[...new Map([...ancestors(s,c),c].flatMap(c=>c.internal).map(x=>[x.id,x])).values()];
 const details=cs(c.selected).map(course=>({...course,scores:undefined,unassessed:undefined,hours:duration(course,s.overrides).hours,durationBasis:duration(course,s.overrides).note,uniquePoints:100*(m.coverage-measure(reqs,courses.filter(x=>x.id!==course.id),data.thresholds).coverage)}));
 const requirementDetails=m.rows.map(r=>{
  const witnesses=r.score?courses.filter(c=>c.scores[r.id]?.score===r.score):[];
  const improvements=data.courses.filter(c=>!excluded.includes(c.id)&&(c.scores[r.id]?.score||0)>r.score).sort((a,b)=>b.scores[r.id].score-a.scores[r.id].score).map(c=>({id:c.id,title:c.title,score:c.scores[r.id].score}));
  return {id:r.id,need:r.need,title:r.title,description:r.description,core:r.core,source:r.source,score:r.score,status:r.assessed?'Assessed':'Unassessed',ceiling:scoreFor(data.courses,r.id),gap:gapType(r.score,scoreFor(data.courses,r.id)),evidence:witnesses.map(c=>({id:c.id,title:c.title,...c.scores[r.id]})),improvements,internal:internal.filter(i=>i.requirements.includes(r.id)).map(i=>({id:i.id,title:i.title}))};
 });
 const courseHours=timeTotal(cs(c.selected),s.overrides),cumulativeCourseHours=timeTotal(courses,s.overrides),ownInternalHours=c.internal.reduce((a,x)=>a+x.hours,0),internalHours=internal.reduce((a,x)=>a+x.hours,0);
 return {id:c.id,name:c.name,group:c.group,profile:c.profile,parent:c.parent,scopeIds:reqs.map(r=>r.id),cumulativeScopeIds:cumReqs.map(r=>r.id),budget:c.budget,selected:c.selected,inherited:selectedIds(s,c,false),coverage:m.coverage,critical:m.critical,full:m.full,cumulativeCoverage:cum.coverage,cumulativeCritical:cum.critical,cumulativeRequirements:cumReqs.length,courseHours,cumulativeCourseHours,ownInternalHours,internalHours,totalHours:cumulativeCourseHours.hours+internalHours,internalItems:c.internal,details,requirementDetails,needs:m.needs.map(n=>({id:n.id,title:NEED_TITLES[n.id],coverage:n.coverage,critical:n.critical,full:n.full,count:n.rows.length,band:n.band})),rationale:c.rationale,audience:c.note,recommendation:c.recommendation??null};
 })};}
for(const scenario of scenarios){assert.deepEqual(validateScenario(scenario,data),[]);assert.deepEqual(deserialize(serialize(scenario),data).scenario,scenario);await writeFile(new URL(scenario.id+'.json',here),JSON.stringify(scenario,null,2)+'\n');}
const results={planVersion:2,modelVersion:2,year:2027,date:'2026-10-18',catalogueVersion:data.version,sourceSha256:data.sourceSha256,recommendedId:s.id,scenarios:scenarios.map(describe),config,design,model:{levels:LEVELS,roles:ROLE_FAMILIES,specialisms:SPECIALISMS,needs:data.needs.map(n=>({...n,title:NEED_TITLES[n.id],...NEED_DOMAINS[n.id]})),crosswalk:crosswalk(data)},courseNames:Object.fromEntries(data.courses.map(c=>[c.id,c.title]))};
await writeFile(new URL('results-v2.json',here),JSON.stringify(results,null,2)+'\n');
if(process.argv.includes('--publish'))await writeFile(new URL('training-planner/public/data/default-scenario.json',root),JSON.stringify(s,null,2)+'\n');
for(const r of results.scenarios[0].rows)console.log(r.id,(r.coverage*100).toFixed(1)+'%',r.courseHours.hours.toFixed(2)+'h courses',r.ownInternalHours+'h internal',r.totalHours.toFixed(2)+'h cumulative');
