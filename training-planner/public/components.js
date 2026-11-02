import {initialCohorts} from './cohorts.js';
import {MODEL_VERSION,MODEL_REVISION,SPECIALISMS,ACTIVITIES,sharedLevel,effectiveRequirement} from './capability-model.js';
import {measure,measurePlan,timeTotal,eligibility,scoreFor} from './scoring.js';
import {duration} from './duration.js';
import {CATEGORIES} from './presentation.js';
import {catalogueIdentity,catalogueWarning} from './catalogue-identity.js';

export const TOOL_TASKS = ['use','supervise','build','administer'];
export function newComponent(id,name,category,budget,requirements,extra={}){return {id,name,category,budget,requirements,dependencies:[],selected:[],pinned:[],excluded:[],internal:[],addedRequirements:[],removedRequirements:[],filters:{audience:true,types:[]},rationale:'',...extra};}
export function createComponentScenario(data,name='New component plan',template=null){
 const shared=['foundation','l1','l2','l3'].map((id,i)=>newComponent(id,CATEGORIES[i],[...CATEGORIES][i],[2,2,8,24][i],data.requirements.filter(r=>sharedLevel(r)===i).map(r=>r.id),{level:i,dependencies:i?['foundation','l1','l2'].slice(0,i):[],excluded:['TR-125','TR-128','TR-129','TR-159',...(i===0?['INT-2787']:[])]}));
 const components=[...shared,...SPECIALISMS.map(p=>newComponent('specialism-'+p.id,p.name,'Specialisms',4,[...p.requirements],{specialism:p.id,excluded:['TR-125','TR-128','TR-129','TR-159']}))];
 const presets=template?.cohorts||initialCohorts();
 for(const [index,id] of ['all','entry','practitioner','technical'].entries())shared[index].activities=[...(presets.find(c=>c.id===id)?.profile.activities||[])];
 const audiences=presets.filter(c=>!['all','entry','practitioner','technical'].includes(c.id)).map(c=>({id:c.id,name:c.name,level:c.profile.level,specialisms:[...c.profile.specialisms],activities:[...new Set([...(c.profile.activities||[]),...shared.filter(x=>x.level<=c.profile.level).flatMap(x=>x.activities)])],components:['foundation',...['l1','l2','l3'].slice(0,c.profile.level),...c.profile.specialisms.map(id=>'specialism-'+id)],rationale:c.note||'',sourceGroup:c.group}));
 return {schema:3,modelVersion:MODEL_VERSION,modelRevision:MODEL_REVISION,id:crypto.randomUUID(),name,status:'Draft',catalogueVersion:data.version,catalogueIdentity:catalogueIdentity(data),created:new Date().toISOString(),assumptions:'Blank curriculum. Foundation and cumulative L1/L2/L3 learning combine with selected responsibilities and approved tooling. Budgets are provisional and exclude internal practice. Evidence describes syllabus coverage, not learner competence or permission.',overrides:{},components,audiences};
}
export function componentChain(s,id,seen=new Set()){
 const c=s.components.find(c=>c.id===id);if(!c)throw Error('Unknown component '+id);if(seen.has(id))throw Error('Component dependency cycle');
 const next=new Set([...seen,id]);return [...new Map([...c.dependencies.flatMap(x=>componentChain(s,x,next)),c].map(x=>[x.id,x])).values()];
}
export function pathComponents(s,target){return [...new Map((target.components||[target.id]).flatMap(id=>componentChain(s,id)).map(c=>[c.id,c])).values()];}
export function componentScope(data,c,activities=[]){const ids=new Set([...c.requirements,...c.addedRequirements]);return data.requirements.filter(r=>ids.has(r.id)&&!c.removedRequirements.includes(r.id)).map(r=>effectiveRequirement(r,{activities}));}
export function pathMetrics(data,s,target){
 const cs=pathComponents(s,target),activities=target.activities||[],rows=[...new Map(cs.flatMap(c=>componentScope(data,c,activities)).map(r=>[r.id,r])).values()];
 const ids=[...new Set(cs.flatMap(c=>c.selected))],courses=data.courses.filter(c=>ids.includes(c.id)),items=[...new Map(cs.flatMap(c=>c.internal).map(i=>[i.id,i])).values()];
 const m=measurePlan(rows,courses,items,data.thresholds),time=timeTotal(courses,s.overrides);time.unknown+=ids.filter(id=>!data.courses.some(c=>c.id===id)).length;
 return {components:cs,ids,courses,items,requirements:rows,...m,time,total:{hours:time.hours+items.reduce((a,i)=>a+(i.hours||0),0),unknown:time.unknown+items.filter(i=>i.hours===null).length}};
}
export function componentAudience(c){return {profile:{level:c.level??1,specialisms:c.specialism?[c.specialism]:[]},rank:c.level??1,excluded:c.excluded,filters:c.filters,pinned:c.pinned,selected:c.selected,budget:c.budget,specialistRequirements:c.category==='Specialisms'?[...c.requirements,...c.addedRequirements]:[]};}
export function dependentAudiences(s,id){return s.audiences.filter(a=>pathComponents(s,a).some(c=>c.id===id));}
export function componentTime(data,s,c){const inherited=new Set(c.dependencies.flatMap(id=>componentChain(s,id).flatMap(x=>x.selected))),courses=data.courses.filter(x=>c.selected.includes(x.id)&&!inherited.has(x.id)),result=timeTotal(courses,s.overrides);result.unknown+=c.selected.filter(id=>!inherited.has(id)&&!data.courses.some(x=>x.id===id)).length;return result;}
export function invalidateComponent(s,id){for(const c of s.components)if(componentChain(s,c.id).some(x=>x.id===id))delete c.recommendation;}
export function cloneForAudience(s,id,audienceId){const a=s.audiences.find(a=>a.id===audienceId);if(!a||!a.components.includes(id))throw Error('Choose an audience referencing this component');const originalChain=pathComponents(s,a),c=structuredClone(s.components.find(c=>c.id===id));c.id=crypto.randomUUID();c.name+=' — '+a.name;c.variantOf=id;delete c.recommendation;s.components.push(c);a.components=a.components.map(x=>x===id?c.id:x);
 // Copy dependent shared components too, so their dependency chains cannot pull in the original.
 const replacements=new Map([[id,c.id]]);
 for(const original of originalChain){if(original.id===id||!componentChain(s,original.id).some(x=>replacements.has(x.id)))continue;const copy=structuredClone(original);copy.id=crypto.randomUUID();copy.name+=' — '+a.name;copy.variantOf=original.variantOf||original.id;copy.dependencies=copy.dependencies.map(x=>replacements.get(x)||x);delete copy.recommendation;s.components.push(copy);replacements.set(original.id,copy.id);a.components=a.components.map(x=>x===original.id?copy.id:x);}
 return c;
}
export function composeAudience(s,old,level,specialisms,toolIds){
 const previous=old?pathComponents(s,old):[],shared=[];
 for(let i=0;i<=level;i++){
  let c=previous.find(x=>x.level===i)||s.components.find(x=>x.id===['foundation','l1','l2','l3'][i]);
  if(!c)throw Error('Missing shared component for '+CATEGORIES[i]);
  if(c.dependencies.join()!==shared.join()){
   c={...structuredClone(c),id:crypto.randomUUID(),variantOf:c.variantOf||c.id,name:c.name+' — '+(old?.name||'audience variant'),dependencies:[...shared]};delete c.recommendation;s.components.push(c);
  }
  shared.push(c.id);
 }
 return [...shared,...specialisms.map(id=>previous.find(c=>c.specialism===id)?.id||'specialism-'+id),...toolIds];
}
export function courseSuggestions(data,s,c,target=c,requirementId=''){
 const m=pathMetrics(data,s,target),own=componentScope(data,c,target.activities||[]),baseline=measure(own,m.courses,data.thresholds).coverage;
 const spent=componentTime(data,s,c);
 return data.courses.filter(x=>!m.ids.includes(x.id)&&(!requirementId||(x.scores[requirementId]?.score||0)>scoreFor(m.courses,requirementId))).map(course=>{
  const hours=duration(course,s.overrides).hours,gain=measure(own,[...m.courses,course],data.thresholds).coverage-baseline,pathGain=measure(m.requirements,[...m.courses,course],data.thresholds).coverage-m.coverage;
  return {course,hours,gain,pathGain,reason:eligibility(course,componentAudience(c),s.overrides),fits:c.budget!==null&&!spent.unknown&&hours!==null&&hours<=c.budget-spent.hours+1e-8,before:requirementId?scoreFor(m.courses,requirementId):null,after:requirementId?scoreFor([...m.courses,course],requirementId):null};
 }).filter(x=>requirementId||x.gain>0).sort((a,b)=>Number(!!a.reason)-Number(!!b.reason)||b.gain-a.gain||(a.hours??Infinity)-(b.hours??Infinity)||a.course.id.localeCompare(b.course.id));
}
export function validateComponentScenario(s,data){
 const fail=m=>{throw Error('Invalid component plan: '+m);},strings=x=>Array.isArray(x)&&x.every(y=>typeof y==='string');
 if(s.schema!==3||s.modelVersion!==MODEL_VERSION||typeof s.id!=='string'||typeof s.name!=='string'||typeof s.catalogueVersion!=='string'||!['Draft','Reviewed','Finalised'].includes(s.status)||!Array.isArray(s.components)||!s.components.length||!Array.isArray(s.audiences)||typeof s.assumptions!=='string'||!s.overrides||Object.values(s.overrides).some(x=>!Number.isFinite(x)||x<0))fail('unsupported format');
 const ids=new Set();for(const c of s.components){if(typeof c.id!=='string'||ids.has(c.id)||typeof c.name!=='string'||!CATEGORIES.includes(c.category)||!(c.budget===null||Number.isFinite(c.budget)&&c.budget>=0))fail('component');ids.add(c.id);
 for(const key of ['requirements','dependencies','selected','pinned','excluded','addedRequirements','removedRequirements'])if(!strings(c[key]))fail(key);
 if(!c.filters||!strings(c.filters.types)||typeof c.filters.audience!=='boolean'||typeof c.rationale!=='string'||!Array.isArray(c.internal))fail('component settings');
 if(c.activities!==undefined&&(!strings(c.activities)||c.activities.some(id=>!ACTIVITIES.some(a=>a.id===id))))fail('component activities');
 if(c.pinned.some(id=>!c.selected.includes(id)))fail('pins');
 if(CATEGORIES.indexOf(c.category)<4&&c.level!==CATEGORIES.indexOf(c.category))fail('shared level');
 if(c.category==='Specialisms'&&!SPECIALISMS.some(p=>p.id===c.specialism))fail('specialism');
 if(c.category==='Tooling'&&(!c.tool?.trim()||!strings(c.tasks)||!c.tasks.length||c.tasks.some(t=>!TOOL_TASKS.includes(t))))fail('tool and tasks');
 for(const i of c.internal)if(typeof i.id!=='string'||typeof i.title!=='string'||typeof i.owner!=='string'||typeof i.outcomes!=='string'||!strings(i.requirements)||!['Proposed','In development','Ready'].includes(i.status)||!(i.hours===null||Number.isFinite(i.hours)&&i.hours>=0))fail('internal item');
 }
 for(const c of s.components){componentChain(s,c.id);if(c.dependencies.some(id=>{const d=s.components.find(x=>x.id===id);return !Number.isInteger(c.level)||!Number.isInteger(d.level)||d.level>=c.level;}))fail('dependencies must be earlier shared levels');}
 const audiences=new Set();for(const a of s.audiences){if(typeof a.id!=='string'||audiences.has(a.id)||typeof a.name!=='string'||![0,1,2,3].includes(a.level)||!strings(a.components)||!strings(a.specialisms)||a.specialisms.some(id=>!SPECIALISMS.some(p=>p.id===id))||!strings(a.activities)||a.activities.some(id=>!ACTIVITIES.some(x=>x.id===id)))fail('audience');audiences.add(a.id);const cs=pathComponents(s,a);for(let i=0;i<=a.level;i++)if(cs.filter(c=>c.level===i).length!==1)fail('missing or duplicate shared level');if(cs.some(c=>Number.isInteger(c.level)&&c.level>a.level))fail('level above target');if(cs.filter(c=>c.specialism).some(c=>!a.specialisms.includes(c.specialism))||a.specialisms.some(id=>!cs.some(c=>c.specialism===id)))fail('responsibility references');}
 const warnings=[],courseIds=new Set(data.courses.map(x=>x.id)),reqIds=new Set(data.requirements.map(r=>r.id));
 const version=catalogueWarning(s,data);if(version)warnings.push(version);if(s.modelRevision!==MODEL_REVISION)warnings.push('Capability model revision differs; review applicability.');
 const retiredIds=new Set((data.retiredCourses||[]).map(c=>c.id));
 for(const c of s.components){for(const id of new Set([...c.selected,...c.pinned,...c.excluded]))if(!courseIds.has(id)&&!(retiredIds.has(id)&&c.excluded.includes(id)&&!c.selected.includes(id)&&!c.pinned.includes(id)))warnings.push(c.name+(retiredIds.has(id)?': retired course ':': unresolved course ')+id);for(const id of [...c.requirements,...c.addedRequirements,...c.removedRequirements,...c.internal.flatMap(i=>i.requirements)])if(!reqIds.has(id))warnings.push(c.name+': unresolved outcome '+id);if(c.level===0&&c.selected.includes('INT-2787'))warnings.push('Remove INT-2787 from Foundation; use brief awareness teaching.');}
 return warnings;
}
