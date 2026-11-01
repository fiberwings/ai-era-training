// Read-only comparison: never overwrite a recommended scenario or annual report.
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {scope,selectedIds,cumulativeScope,ancestors,recommendationCohort} from '../training-planner/public/cohorts.js';
import {measure,timeTotal,scoreFor,eligibility} from '../training-planner/public/scoring.js';
import {prepareProblem,solveProblem} from '../training-planner/public/optimisation.js';
const require=createRequire(import.meta.url),highs=await require('../training-planner/node_modules/highs')();
const read=async p=>JSON.parse(await readFile(new URL(p,import.meta.url)));
const old=await read('../training-planner/catalogue-history/a959067fd5d91eba.json');
const current=await read('../training-planner/public/data/catalogue.json');
const legacy=await read('../analysis/2027-training-plan/option-4.json');
const starter=await read('../training-planner/scenario-history/default-scenario-before-v10.json');
const oldIds=new Set(old.courses.map(c=>c.id)),added=current.courses.filter(c=>!oldIds.has(c.id));
const getCourses=(data,ids)=>ids.map(id=>{const c=data.courses.find(c=>c.id===id);assert.ok(c,id);return c;});
const info=c=>({id:c.id,title:c.title,duration:c.duration,url:c.url,level:c.level,limitations:c.limitations});
const compareRequirements=(a,b)=>({improved:a.rows.filter((r,i)=>b.rows[i].score>r.score).map((r,i)=>({id:r.id,before:r.score,after:b.rows.find(x=>x.id===r.id).score})),lost:a.rows.filter((r,i)=>b.rows[i].score<r.score).map(r=>({id:r.id,before:r.score,after:b.rows.find(x=>x.id===r.id).score}))});
function stats(data,s,c){
 const cs=getCourses(data,selectedIds(s,c)),rs=scope(data,c,s),m=measure(rs,cs,data.thresholds),cum=measure(cumulativeScope(data,s,c),cs,data.thresholds);
 const internal=[...new Map([...ancestors(s,c),c].flatMap(x=>x.internal).map(x=>[x.id,x])).values()];
 const own=timeTotal(getCourses(data,c.selected),s.overrides),total=timeTotal(cs,s.overrides);
 return {id:c.id,name:c.name,selected:c.selected,coverage:100*m.coverage,cumulativeCoverage:100*cum.coverage,critical:m.critical,full:m.full,courseHours:own.hours,unknownHours:own.unknown,cumulativeCourseHours:total.hours,cumulativeLearnerHours:total.hours+internal.reduce((a,x)=>a+(x.hours||0),0),internalHours:internal.reduce((a,x)=>a+(x.hours||0),0),rows:m.rows.map(r=>({id:r.id,score:r.score})),needs:m.needs.map(n=>({id:n.id,coverage:100*n.coverage}))};
}
const frozen=s=>s.cohorts.map(c=>{const before=stats(old,s,c),after=stats(current,s,c);assert.equal(before.coverage,after.coverage);return {before,after};});
const ceilings=current.requirements.map(r=>({id:r.id,title:r.title,need:r.need,core:r.core,before:scoreFor(old.courses,r.id),after:scoreFor(current.courses,r.id),newWitnesses:added.filter(c=>c.scores[r.id]?.score===scoreFor(current.courses,r.id)&&c.scores[r.id]?.score>scoreFor(old.courses,r.id)).map(info)})).filter(r=>r.after>r.before);
const needCeilings=current.needs.map(n=>{const reqs=current.requirements.filter(r=>r.need===n.id),a=measure(reqs,old.courses),b=measure(reqs,current.courses);return {id:n.id,title:n.title,before:100*a.coverage,after:100*b.coverage,fullBefore:a.full,fullAfter:b.full};});
const legacyCandidates=legacy.cohorts.map(c=>{
 const cs=getCourses(current,selectedIds(legacy,c)),rs=scope(current,c,legacy),m=measure(rs,cs,current.thresholds),cumReqs=cumulativeScope(current,legacy,c),cum=measure(cumReqs,cs,current.thresholds);
 const ranked=added.map(n=>{const mm=measure(rs,[...cs,n],current.thresholds);return {...info(n),hours:timeTotal([n],legacy.overrides).hours,addedLayerPoints:100*(mm.coverage-m.coverage),improvedRequirements:mm.rows.filter(r=>r.score>m.rows.find(x=>x.id===r.id).score).map(r=>({id:r.id,before:m.rows.find(x=>x.id===r.id).score,after:r.score})),eligibility:eligibility(n,recommendationCohort(current,legacy,c),legacy.overrides)};}).filter(x=>x.addedLayerPoints>1e-7).sort((a,b)=>b.addedLayerPoints-a.addedLayerPoints||a.hours-b.hours);
 const swaps=[];
 for(const gone of c.selected)for(const replacement of added){
  if(eligibility(replacement,recommendationCohort(current,legacy,c),legacy.overrides))continue;
  const ids=[...selectedIds(legacy,c).filter(id=>id!==gone),replacement.id],next=getCourses(current,ids),scored=measure(cumReqs,next,current.thresholds);
  const own=getCourses(current,[...c.selected.filter(id=>id!==gone),replacement.id]),hours=timeTotal(own,legacy.overrides).hours;
  if(hours>c.budget+1e-7)continue;
  const changes=compareRequirements(cum,scored),saved=stats(current,legacy,c).courseHours-hours;
  if(!changes.lost.length&&(saved>1e-7||changes.improved.length))swaps.push({remove:info(getCourses(current,[gone])[0]),add:info(replacement),hoursSaved:saved,newLayerHours:hours,cumulativeCoverageGain:100*(scored.coverage-cum.coverage),...changes});
 }
 swaps.sort((a,b)=>b.cumulativeCoverageGain-a.cumulativeCoverageGain||b.hoursSaved-a.hoursSaved);
 return {id:c.id,name:c.name,topAdditions:ranked.slice(0,8),noScoreLossSingleSwaps:swaps.slice(0,10)};
});
const v2=structuredClone(starter),v2results=[];
for(const c of v2.cohorts){
 const before=stats(current,starter,starter.cohorts.find(x=>x.id===c.id));
 const inherited=getCourses(current,selectedIds(v2,c,false));
 const p=prepareProblem(current,recommendationCohort(current,v2,c),scope(current,c,v2),inherited,v2.overrides);
 const result=solveProblem(highs,p);c.selected=result.ids;
 const after=stats(current,v2,c),changes=compareRequirements({rows:before.rows},{rows:after.rows});
 v2results.push({before,after,result,newCourses:result.ids.filter(id=>!oldIds.has(id)).map(id=>info(getCourses(current,[id])[0])),...changes});
 console.log(c.id,`${before.coverage.toFixed(1)} -> ${after.coverage.toFixed(1)}%`,`${before.courseHours.toFixed(2)} -> ${after.courseHours.toFixed(2)}h`,result.status,result.ids.join(','));
}
const result={date:'2026-10-18',baseline:old.version,current:current.version,scope:'Dry analysis only. Legacy Option 4 unchanged; v2 starter re-solved conditionally at original budgets/exclusions. Score optimisation is not a quality or delivery endorsement.',frozenLegacy:frozen(legacy),frozenV2:frozen(starter),changedCeilings:ceilings,needCeilings,legacyCandidates,v2Reoptimised:v2results};
await writeFile(new URL('plan-impact.json',import.meta.url),JSON.stringify(result,null,2));
v2.id='v10-impact-analysis-only';v2.name='V10 impact comparison — uncurated trial';v2.catalogueVersion=current.version;
v2.assumptions+=' Diagnostic trial only: maximum scored coverage, not a revised recommendation. Some substitutions lose individual outcomes or lack audience fit. No existing plan has been replaced.';
for(const c of v2.cohorts){delete c.recommendation;c.needsReview=true;}
await writeFile(new URL('v2-comparison-only.json',import.meta.url),JSON.stringify(v2,null,2));
console.log('Changed requirement ceilings:',ceilings.map(r=>`${r.id} ${r.before}->${r.after}`).join(', '));
console.log('Saved plan-impact.json; published plans unchanged.');
