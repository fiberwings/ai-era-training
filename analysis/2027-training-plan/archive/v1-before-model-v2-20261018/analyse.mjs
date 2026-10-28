import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {validateScenario} from '../../training-planner/public/storage.js';
import {scope,selectedIds,cumulativeScope,ancestors} from '../../training-planner/public/cohorts.js';
import {measure,timeTotal,scoreFor,gapType,eligibility} from '../../training-planner/public/scoring.js';
import {prepareProblem,solveProblem} from '../../training-planner/public/optimisation.js';
const require=createRequire(import.meta.url),highs=await require('../../training-planner/node_modules/highs')();
const root=new URL('./',import.meta.url),data=JSON.parse(await readFile(new URL('../../training-planner/public/data/catalogue.json',import.meta.url)));
const byId=new Map(data.courses.map(c=>[c.id,c]));
const courses=ids=>ids.map(id=>{if(!byId.has(id))throw Error('Unknown '+id);return byId.get(id);});
const configs=JSON.parse(await readFile(new URL('options.json',root)));
// This report reproduces the historical annual plan. Never use the current
// model's starter to reinterpret its approved scopes or internal commitments.
const legacyTemplate=JSON.parse(await readFile(new URL('../../training-planner/scenario-history/default-scenario-v1.json',root)));
if(legacyTemplate.schema!==1)throw Error('The 2027 reference requires its version-one scenario template.');
const summary=[];
for(const config of configs){
 const s=structuredClone(legacyTemplate);s.id=config.id;s.name=config.name;s.status='Draft';s.catalogueVersion=data.version;s.created=new Date().toISOString();
 s.assumptions='Previous capability model (v1). Equal weight per need. Full-course assessment evidence; course completion is not competency sign-off. Budgets exclude internal practice. Shared learning is inherited once.';
 for(const c of s.cohorts){c.selected=[];c.pinned=[];c.excluded=[];c.internal=[];c.rationale='';c.addedRequirements=[];c.removedRequirements=[];delete c.recommendation;}
 s.assumptions+=' Planning year 2027. '+config.assumptions; s.overrides=config.overrides||{};
 const rows=[];
 for(const c of s.cohorts){
  if(config.budgets?.[c.id]!==undefined)c.budget=config.budgets[c.id];
  const allow=config.allow?.[c.id]||config.allow?.allLayers;
  if(allow)c.excluded=data.courses.filter(x=>!allow.includes(x.id)).map(x=>x.id);
  if(config.noUdemy)c.excluded.push(...data.courses.filter(x=>x.provider.includes('Udemy')).map(x=>x.id));
  if(config.excluded)c.excluded.push(...config.excluded);
  c.excluded=[...new Set(c.excluded)];
  if(config.selected?.[c.id]){c.selected=config.selected[c.id];c.rationale=config.rationale?.[c.id]||'Curated syllabus selection; no optimality claim.';}
  else {const p=prepareProblem(data,c,scope(data,c),courses(selectedIds(s,c,false)),s.overrides);const result=solveProblem(highs,p);c.selected=result.ids;c.recommendation=result;}
  const applicable=new Set(scope(data,c).map(r=>r.id));
  c.internal=(config.internal?.[c.id]||[]).map((x,i)=>({id:config.id+'-'+c.id+'-'+i,status:'Proposed',...x,requirements:x.requirements.filter(id=>applicable.has(id))}));
  const cs=courses(selectedIds(s,c)),reqs=scope(data,c),m=measure(reqs,cs,data.thresholds),cum=measure(cumulativeScope(data,s,c),cs,data.thresholds);
  const internal=[...new Map([...ancestors(s,c),c].flatMap(x=>x.internal).map(x=>[x.id,x])).values()];
  const details=courses(c.selected).map(course=>({id:course.id,title:course.title,provider:course.provider,duration:course.duration,hours:timeTotal([course],s.overrides).hours,level:course.level,type:course.type,evidence:course.evidence,url:course.url,sources:course.sources,source:course.source,uniquePoints:100*(m.coverage-measure(reqs,cs.filter(x=>x.id!==course.id),data.thresholds).coverage)}));
  rows.push({id:c.id,name:c.name,group:c.group,requirements:reqs.length,coverage:m.coverage,critical:m.critical,full:m.full,cumulativeCoverage:cum.coverage,cumulativeCritical:cum.critical,cumulativeRequirements:cum.rows.length,courseHours:timeTotal(courses(c.selected),s.overrides),cumulativeCourseHours:timeTotal(cs,s.overrides),internalHours:internal.reduce((sum,x)=>sum+x.hours,0),ownInternalHours:c.internal.reduce((sum,x)=>sum+x.hours,0),courseCount:c.selected.length,cumulativeCourseCount:cs.length,details,needs:m.needs.map(n=>({id:n.id,coverage:n.coverage,band:n.band,critical:n.critical,full:n.full,count:n.rows.length})),gaps:m.rows.filter(r=>r.score<3).map(r=>({id:r.id,need:r.need,title:r.title,score:r.score,core:r.core,ceiling:scoreFor(data.courses,r.id),classification:gapType(r.score,scoreFor(data.courses,r.id)),source:r.source})),recommendation:c.recommendation||null});
 }
 validateScenario(s,data);
 await writeFile(new URL(config.id+'.json',root),JSON.stringify(s,null,2));
 summary.push({id:config.id,name:config.name,rows});
 console.log('\n'+config.name);for(const r of rows)console.log(r.id,(100*r.coverage).toFixed(1)+'%',r.critical+' critical',r.courseHours.hours.toFixed(2)+'h',r.details.map(c=>c.id).join(','));
}
await writeFile(new URL('results.json',root),JSON.stringify({version:data.version,date:'2026-10-16',year:2027,options:summary},null,2));
const catalogueCeiling=data.needs.map(n=>{const rs=data.requirements.filter(r=>r.need===n.id),m=measure(rs,data.courses,data.thresholds);return {id:n.id,name:n.title,coverage:m.coverage,critical:m.critical,full:m.full,count:rs.length,gaps:m.rows.filter(r=>r.score<3).map(r=>({id:r.id,title:r.title,score:r.score,core:r.core}))};});
await writeFile(new URL('catalogue-ceilings.json',root),JSON.stringify(catalogueCeiling,null,2));
