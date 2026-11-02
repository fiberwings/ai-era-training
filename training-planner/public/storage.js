import {initialCohorts,ancestors,syncNeeds} from './cohorts.js';
import {MODEL_VERSION,MODEL_REVISION,ACTIVITIES,SPECIALISMS} from './capability-model.js';
import {validateComponentScenario} from './components.js';
import {catalogueWarning} from './catalogue-identity.js';
export const STORE='cyber-training-planner-v1';
export function createScenario(data,name='Workshop draft'){return syncNeeds(data,{schema:2,modelVersion:MODEL_VERSION,modelRevision:MODEL_REVISION,id:crypto.randomUUID(),name,status:'Draft',catalogueVersion:data.version,created:new Date().toISOString(),assumptions:'Foundation + agentic level + relevant role specialisms + tool training. Target learning needs, not measured skill gaps: no learner baseline is recorded. Equal weight per original need; full-course evidence is not competence or operational authorisation. Shared learning is counted once. Foundation / L1 provisionally split the former 4h budget into 2h + 2h; L2 8h, L3 24h, role additions 4h. Budgets exclude internal practice. Confirm approved tools and role prerequisites with functional heads.',overrides:{},cohorts:initialCohorts()});}
export function duplicateScenario(s){return {...structuredClone(s),id:crypto.randomUUID(),name:s.name+' — copy',status:'Draft',created:new Date().toISOString()};}
export function validateScenario(s,data){
 if(s?.schema===3)return validateComponentScenario(s,data);
 const fail=m=>{throw Error('Invalid scenario: '+m);};
 const strings=a=>Array.isArray(a)&&a.every(x=>typeof x==='string');
 if(!s||![1,2].includes(s.schema)||typeof s.name!=='string'||typeof s.id!=='string'||typeof s.catalogueVersion!=='string'||!['Draft','Reviewed','Finalised'].includes(s.status)||!Array.isArray(s.cohorts)||!s.cohorts.length)fail('unsupported format');
 if(s.schema===2&&s.modelVersion!==MODEL_VERSION)fail('unsupported capability model');
 if(!s.overrides||Object.values(s.overrides).some(v=>!Number.isFinite(v)||v<0)||typeof s.assumptions!=='string')fail('hours / assumptions');
 const ids=new Set();
 for(const c of s.cohorts){
  if(typeof c.id!=='string'||ids.has(c.id)||typeof c.name!=='string'||!Number.isFinite(c.budget)||c.budget<0||![0,1,2,3].includes(c.rank))fail('cohort');ids.add(c.id);
  for(const k of ['selected','pinned','excluded','needs','removedRequirements','addedRequirements'])if(!strings(c[k]))fail(k);
  if(!c.filters||!strings(c.filters.types)||typeof c.filters.audience!=='boolean'||typeof c.rationale!=='string'||!Array.isArray(c.internal))fail('cohort settings');
  if(s.schema===2){
   if(!c.profile||![0,1,2,3].includes(c.profile.level)||c.rank!==c.profile.level||!strings(c.profile.specialisms)||!strings(c.profile.tools))fail('capability profile');
   if(c.profile.activities!==undefined&&(!strings(c.profile.activities)||c.profile.activities.some(id=>!ACTIVITIES.some(a=>a.id===id))))fail('unknown activity');
   if(c.profile.specialisms.some(id=>!SPECIALISMS.some(x=>x.id===id)))fail('unknown role specialism');
   if(c.profile.level===0&&c.profile.specialisms.length)fail('foundation cannot carry role specialisms; choose L1–L3');
  }else if(c.profile||s.modelVersion)fail('profile needs scenario schema 2');
  if(c.pinned.some(id=>!c.selected.includes(id)))fail('pinned course must be selected');
  for(const i of c.internal)if(typeof i.id!=='string'||typeof i.title!=='string'||typeof i.owner!=='string'||typeof i.outcomes!=='string'||!['Proposed','In development','Ready'].includes(i.status)||!strings(i.requirements)||!(i.hours===null||Number.isFinite(i.hours)&&i.hours>=0))fail('internal item');
 }
 for(const c of s.cohorts){const parents=ancestors(s,c);if(c.profile&&parents.some(a=>a.profile.level>c.profile.level||a.profile.specialisms.length))fail('inherit only shared learning at or below the target agentic level');}
 const courseIds=new Set(data.courses.map(x=>x.id)),reqIds=new Set(data.requirements.map(x=>x.id)),needIds=new Set(data.needs.map(x=>x.id));
 const warnings=[];
 if(s.schema===2&&s.modelRevision!==MODEL_REVISION)warnings.push('Must-have applicability was revised. Review automated judges, AI-assisted assurance and identity integration before finalising.');
 if(s.catalogueVersion!==data.version)warnings.push(catalogueWarning(s,data));
 const retiredIds=new Set((data.retiredCourses||[]).map(c=>c.id));
 for(const c of s.cohorts){if(c.profile?.level===0&&c.selected.includes('INT-2787'))warnings.push(`${c.name}: remove INT-2787; a full social-engineering course is excessive for Foundation. Use brief awareness teaching in the bank session.`);for(const id of new Set([...c.selected,...c.pinned,...c.excluded]))if(!courseIds.has(id)&&!(retiredIds.has(id)&&c.excluded.includes(id)&&!c.selected.includes(id)&&!c.pinned.includes(id)))warnings.push(`${c.name}: ${retiredIds.has(id)?'retired':'unresolved'} course ${id}`);
 for(const id of [...c.addedRequirements,...c.removedRequirements,...c.internal.flatMap(i=>i.requirements)])if(!reqIds.has(id))warnings.push(`${c.name}: unresolved requirement ${id}`);
 for(const id of c.needs)if(!needIds.has(id))warnings.push(`${c.name}: unresolved need ${id}`);}
 return warnings;
}
export function serialize(s){return JSON.stringify(s,null,2);}
export function deserialize(text,data){const s=JSON.parse(text);return {scenario:s,warnings:validateScenario(s,data)};}
export function csv(rows){const cell=v=>{let s=String(v??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return '\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n');}
