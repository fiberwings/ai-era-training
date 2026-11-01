import {profileRequirements, effectiveRequirement, sharedLevel, SPECIALISMS, NEED_TITLES, LEVELS, MODEL_REVISION} from '../../training-planner/public/capability-model.js';
import {ancestors, selectedIds, cumulativeScope, targetScope, recommendationCohort} from '../../training-planner/public/cohorts.js';
import {measure, eligibility, timeTotal} from '../../training-planner/public/scoring.js';
import {duration} from '../../training-planner/public/duration.js';
import {validateScenario, csv} from '../../training-planner/public/storage.js';
import {isLayered, pathLayers, layeredGroup, matchesTool, flattenLayers, LEARNING_ROLES, rolePackages, startingPoint} from './layers.js';

import {TOOL_USES, toolUseMatch} from './tool-audiences.js';
import {prepareCentralScenario, groupsReviewStatus} from './published-pathways.js';

export const STORAGE_KEY = 'my-ai-learning-path-v1';
export const STATUSES = ['saved', 'planned', 'in-progress', 'completed', 'deferred'];
export const STATUS_LABELS = {saved:'Saved for later', planned:'Planned', 'in-progress':'In progress', completed:'Completed', deferred:'Deferred'};
export const TRACK_NAMES = ['Foundation', 'L1', 'L2', 'L3', 'Specialist', 'Tooling'];
export const FEEDBACK_FIELDS = ['COURSE_ID','COURSE_TITLE','GROUP_ID','GROUP_NAME','CATALOGUE_VERSION','COMPLETED_ON','USEFULNESS','DIFFICULTY','ACTUAL_HOURS','COMMENT','RESPONSE_ID'];
export const CHECKS = [
  {id:'verify', title:'AI gives you a convincing answer. What do you do next?', need:'N3', options:['Use it because it sounds confident','Check the important claims against reliable sources','Ask the same AI if it is sure'], correct:1, explanation:'Verify important claims and evidence. Confidence is not proof of accuracy.'},
  {id:'safe', title:'You want AI to summarise a sensitive work document. What comes first?', need:'N4', options:['Remove the title and use any free tool','Upload it and ask the AI to keep it private','Check the approved tool, data rules, and permitted use'], correct:2, explanation:'Use approved tools and follow your organisation’s data-handling rules.'},
  {id:'agent', title:'An agent starts taking unexpected actions. What is the best response?', need:'N7', options:['Pause or stop it, inspect what happened, and escalate if needed','Wait until it finishes before checking','Give it wider access so it can fix the problem'], correct:0, explanation:'Keep human oversight: stop or take over, inspect evidence, and follow the agreed escalation process.'},
  {id:'build', title:'You have built an agent. How do you check it is ready for wider use?', need:'N11', options:['One successful demonstration is enough','Test representative cases, failures, and controls against clear criteria','Choose the largest model and trust its answers'], correct:1, explanation:'Evaluate representative tasks, failure cases, and controls against clear criteria before expanding use.'}
];
export function uid() { return globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function localDate(date=new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function signature(bundle) { return `${bundle.catalogue.version}:${bundle.scenario.id}:${bundle.scenarioVersion}`; }
export function newLearner(bundle) {
  return {schema:'ai-learning-path/1', id:uid(), created:new Date().toISOString(), updated:null,
    acknowledged:signature(bundle), onboarding:false,
    profile:{pathVersion:4,toolUses:{},centralScope:null,targetReview:null,roles:[],roleResponsibilities:{},pendingSpecialisms:[],activities:[],activityAnswers:{},level:1,levelGoal:1,groupId:bundle.scenario.cohorts.some(g=>g.id==='entry')?'entry':bundle.scenario.cohorts[0].id,name:'',weeklyHours:2,experience:'some',codingReady:false,tools:[],specialisms:[],answers:{},priorLearning:''},
    items:{},feedback:[],formsTemplate:'',formsDisabled:false,history:[]};
}
export function groupFor(bundle,learner) { return isLayered(learner)?layeredGroup(bundle,learner):bundle.scenario.cohorts.find(g=>g.id===learner.profile.groupId)||bundle.scenario.cohorts[0]; }
export function profileFor(bundle,learner) {
  const g=groupFor(bundle,learner);
  return {...g.profile,tools:[...new Set([...(g.profile.tools||[]),...learner.profile.tools])],specialisms:[...new Set([...g.profile.specialisms,...learner.profile.specialisms])]};
}
export function requirementsFor(bundle,learner) {
  if(isLayered(learner))return [...new Map(pathLayers(bundle,learner).flatMap(l=>l.requirements).map(r=>[r.id,r])).values()];
  const g=groupFor(bundle,learner), profile=profileFor(bundle,learner), rows=new Map(cumulativeScope(bundle.catalogue,bundle.scenario,g).map(r=>[r.id,r]));
  // Additional responsibilities extend the learner's target; the central assignment stays intact.
  const extra=profileRequirements(bundle.catalogue,{...profile,specialisms:learner.profile.specialisms}).filter(r=>sharedLevel(r)===null||learner.profile.specialisms.some(id=>SPECIALISMS.find(s=>s.id===id)?.requirements.includes(r.id)));
  for(const r of extra) if(!g.removedRequirements.includes(r.id)) rows.set(r.id,effectiveRequirement(r,profile));
  return [...rows.values()];
}
export function centralIds(bundle,learner) { return selectedIds(bundle.scenario,groupFor(bundle,learner)); }
export function internalItems(bundle,learner) {
  const group=groupFor(bundle,learner), chain=[...ancestors(bundle.scenario,group),group];
  return [...new Map(chain.flatMap(g=>g.internal).map(i=>[`internal:${i.id}`,{...i,id:`internal:${i.id}`,originalId:i.id,provider:i.owner||'Internal learning',description:i.outcomes,duration:i.hours===null?'Time to confirm':`${i.hours}h`,scores:{},track:'internal',type:'Internal practice',evidence:'Not assessed against rubric',tool:'',url:'',level:'',review:i.status,internal:true}])).values()];
}
export function allInternalItems(bundle) {
  return [...new Map(bundle.scenario.cohorts.flatMap(g=>g.internal).map(i=>[`internal:${i.id}`,{...i,id:`internal:${i.id}`,originalId:i.id,provider:i.owner||'Internal learning',description:i.outcomes,duration:i.hours===null?'Time to confirm':`${i.hours}h`,scores:{},track:'internal',type:'Internal practice',evidence:'Not assessed against rubric',tool:'',url:'',level:'',review:i.status,internal:true}])).values()];
}
export function courseMap(bundle) { return new Map([...bundle.catalogue.courses,...allInternalItems(bundle)].map(c=>[c.id,c])); }
export function hoursFor(bundle,course) { return course.internal?course.hours:duration(course,bundle.scenario.overrides).hours; }
export function formatHours(h) {
  if(h===null||h===undefined)return 'Time to confirm';
  if(h===0)return '0h';
  const mins=Math.round(h*60), hours=Math.floor(mins/60), rest=mins%60;
  return hours?(rest?`${hours}h ${rest}m`:`${hours}h`):`${mins}m`;
}
export function toolMatch(course,tools) {
  return matchesTool(course,tools);
}
export function tracksFor(course,requirements) {
  if(course.track==='tool')return ['Tooling'];
  const reqs=course.internal?requirements.filter(r=>course.requirements.includes(r.id)):requirements.filter(r=>(course.scores[r.id]?.score||0)>=2);
  const tracks=new Set(reqs.map(r=>sharedLevel(r)===null?'Specialist':TRACK_NAMES[sharedLevel(r)]));
  if(!course.internal&&reqs.some(r=>SPECIALISMS.some(s=>s.requirements.includes(r.id))))tracks.add('Specialist');
  return TRACK_NAMES.filter(t=>tracks.has(t));
}
export function displayTracks(bundle,learner,course) {
  if(course.track==='tool')return ['Tooling'];
  if(isLayered(learner)){
    const layers=pathLayers(bundle,learner),fits=r=>course.internal?course.requirements.includes(r.id):(course.scores[r.id]?.score||0)>=2;
    const specialist=layers.some(l=>l.kind==='specialist'&&!l.reused&&l.requirements.some(fits));
    const shared=layers.filter(l=>['foundation','level'].includes(l.kind)).flatMap(l=>l.requirements).filter(fits);
    return [...(specialist?['Specialist']:[]),...TRACK_NAMES.slice(0,4).filter((_,level)=>shared.some(r=>sharedLevel(r)===level))];
  }
  const g=groupFor(bundle,learner),chain=[...ancestors(bundle.scenario,g),g];
  const assigned=chain.filter(x=>course.internal?x.internal.some(i=>`internal:${i.id}`===course.id):x.selected.includes(course.id));
  if(assigned.length)return [...new Set(assigned.map(x=>x.profile.specialisms.length?'Specialist':TRACK_NAMES[x.profile.level]))];
  return tracksFor(course,requirementsFor(bundle,learner));
}
export function centralItems(bundle,learner) {
  const map=courseMap(bundle);
  return [...centralIds(bundle,learner).map(id=>map.get(id)).filter(Boolean),...internalItems(bundle,learner)];
}
export function sourceFor(bundle,learner,id,suggested=false) {
  if(isLayered(learner)){
    const assigned=pathLayers(bundle,learner).filter(l=>[...l.centralIds,...l.internalIds].includes(id));
    if(assigned.length)return assigned.some(l=>!l.roleOptionIds.includes(id))?'central':'central-role';
  }else if(centralIds(bundle,learner).includes(id)||internalItems(bundle,learner).some(i=>i.id===id))return 'central';
  if(['central','central-role'].includes(learner.items[id]?.source))return 'previous-central';
  const source=learner.items[id]?.source;
  return ['central','central-role','previous-central','personalised','personal'].includes(source)?source:(suggested?'personalised':'catalog');
}
export function centralReviewStatus(bundle,learner,id) {
  const groups=isLayered(learner)?flattenLayers(pathLayers(bundle,learner)).flatMap(l=>l.groups):bundle.scenario.cohorts;
  return groupsReviewStatus(groups.filter(g=>g.selected.includes(id)||g.internal.some(i=>`internal:${i.id}`===id)));
}
export function unavailable(course) {
  if(course.internal&&course.status!=='Ready')return 'In development — not available yet';
  if(course.review==='Rejected'||course.review==='Needs delivery validation'||course.evidence==='Not found'||/coming soon/i.test(course.title))return 'Availability needs review';
  return null;
}
export function requiresCoding(course) {
  return /Python(?: and Git)? familiarity|React and Python familiarity|requires? (?:basic )?(?:Python|coding)|(?:Python|coding) (?:knowledge|experience) (?:is )?(?:required|assumed)/i.test(`${course.description||''} ${course.limitations||''}`);
}
export function assessment(learner) {
  const answered=CHECKS.filter(q=>Number.isInteger(learner.profile.answers[q.id]));
  return {answered:answered.length,correct:answered.filter(q=>learner.profile.answers[q.id]===q.correct).length,
    focus:answered.filter(q=>learner.profile.answers[q.id]!==q.correct).map(q=>q.need)};
}
export function recommendations(bundle,learner,limit=8,layer=null) {
  const g=groupFor(bundle,learner), profile=profileFor(bundle,learner), reqs=layer?layer.requirements:requirementsFor(bundle,learner), central=new Set(centralIds(bundle,learner)), map=courseMap(bundle);
  const done=Object.entries(learner.items).filter(([,i])=>i.status==='completed').map(([id])=>map.get(id)).filter(Boolean);
  const baseline=[...central].map(id=>map.get(id)).filter(Boolean).concat(Object.entries(learner.items).filter(([,i])=>['planned','in-progress','completed'].includes(i.status)).map(([id])=>map.get(id)).filter(Boolean));
  const before=new Map(reqs.map(r=>[r.id,Math.max(0,...baseline.map(c=>c.scores[r.id]?.score||0))]));
  const learned=new Map(reqs.map(r=>[r.id,Math.max(0,...done.map(c=>c.scores[r.id]?.score||0))]));
  const start=startingPoint(learner.profile);
  const cfg={...recommendationCohort(bundle.catalogue,bundle.scenario,g),profile:layer?.kind==='foundation'?{...profile,level:0}:layer?.kind==='level'?{...profile,level:start.level}:profile,rank:layer?.kind==='foundation'?0:layer?.kind==='level'?start.level:g.rank,specialistRequirements:reqs.filter(r=>SPECIALISMS.some(s=>profile.specialisms.includes(s.id)&&s.requirements.includes(r.id))||learner.profile.centralScope?.added.includes(r.id)).map(r=>r.id),excluded:layer?layer.excluded:[...new Set([...ancestors(bundle.scenario,g),g].flatMap(x=>x.excluded))]};
  const check=assessment(learner), counts={};for(const r of reqs)counts[r.need]=(counts[r.need]||0)+1;
  const quality=bundle.feedbackSummary?.reviewed===true?bundle.feedbackSummary.courses||[]:[];
  const roleWords=[...new Set(SPECIALISMS.filter(s=>profile.specialisms.includes(s.id)).flatMap(s=>s.name.toLowerCase().split(/[^a-z]+/)).filter(w=>w.length>3&&!['agent','agents','learning','with','work','engineering'].includes(w)))];
  const ranked=[];
  for(const c of bundle.catalogue.courses){
    if(layer&&(layer.kind==='tool'?c.track!=='tool'||!toolMatch(c,[layer.tool]):c.track==='tool'))continue;
    if(central.has(c.id)||learner.items[c.id]&&learner.items[c.id].status!=='saved'||cfg.excluded.includes(c.id)||unavailable(c))continue;
    if(['Certification','Practice tests'].includes(c.type)||/^Exam$/i.test(c.type)||/^Exam$/i.test(c.format)||/exam/i.test(c.duration)&&!c.duration.includes('+'))continue;
    if(requiresCoding(c)&&!learner.profile.codingReady)continue;
    const tooling=c.track==='tool'&&toolMatch(c,profile.tools);
    if(tooling&&isLayered(learner)&&!profile.tools.some(tool=>toolMatch(c,[tool])&&toolUseMatch(c,learner.profile,tool)))continue;
    if(!tooling&&eligibility(c,cfg,bundle.scenario.overrides))continue;
    if(c.track==='tool'&&!tooling)continue;
    const relevant=reqs.filter(r=>(c.scores[r.id]?.score||0)>=2);
    if(!tooling&&!relevant.length)continue;
    const gain=reqs.reduce((n,r)=>n+Math.max(0,(c.scores[r.id]?.score||0)-before.get(r.id))/(3*counts[r.need])*(profile.level>0&&sharedLevel(r)===0?.3:1),0);
    const focus=relevant.filter(r=>check.focus.includes(r.need)&&learned.get(r.id)<2);
    const basic=learner.profile.experience==='new'&&relevant.some(r=>sharedLevel(r)===0&&learned.get(r.id)<2);
    if(!tooling&&gain===0&&!focus.length&&!basic)continue;
    const h=hoursFor(bundle,c), fit=h===null?0:Math.min(1,learner.profile.weeklyHours/Math.max(.25,h));
    const review=quality.find(x=>x.courseId===c.id), qualityBonus=review&&review.count>=5?Math.max(-.05,Math.min(.05,((review.usefulness||3)-3)*.025)):0;
    // Prefer useful next steps over broad, multi-week courses. This is a transparent
    // marginal-evidence ranking, not the builder's coverage optimisation objective.
    const effort=Math.pow(Math.max(1,(h??learner.profile.weeklyHours*4)/learner.profile.weeklyHours),.8);
    const topicFit=tooling?Math.min(.3,roleWords.filter(w=>c.title.toLowerCase().includes(w)).length*.1):0;
    const score=(gain+(focus.length?.3:0)+(basic?.2:0))/effort+(tooling?.65:0)+topicFit+fit*.15+qualityBonus;
    const reasons=[];
    if(tooling){
      const explicit=profile.tools.some(tool=>toolMatch(c,[tool])&&learner.profile.toolUses?.[tool]?.length);
      reasons.push(`Practice with ${c.tool}${learner.profile.quickSetup&&!explicit?` matched to your selected L${learner.profile.level} level`:isLayered(learner)?' for the tasks you selected':', one of your selected tools'}. Coverage is unassessed unless recorded below.`);
    }
    if(gain>0)reasons.push(`Adds recorded teaching for ${[...new Set(relevant.filter(r=>(c.scores[r.id]?.score||0)>before.get(r.id)).map(r=>NEED_TITLES[r.need]||r.need))].slice(0,2).join(' and ')}.`);
    if(focus.length||basic)reasons.push('A refresher based on your starting-point answers; your central pathway stays available.');
    if(review?.count>=5)reasons.push(`Reviewed learner feedback: ${review.usefulness.toFixed(1)}/5 from ${review.count} responses.`);
    ranked.push({course:c,score,reason:reasons.join(' ')});
  }
  const toolCounts=new Map();
  return ranked.sort((a,b)=>b.score-a.score||a.course.title.localeCompare(b.course.title)).filter(x=>{
    if(x.course.track!=='tool')return true;
    const count=toolCounts.get(x.course.tool)||0;toolCounts.set(x.course.tool,count+1);return count<2;
  }).slice(0,limit);
}
export function centralReason(bundle,learner,course) {
  if(isLayered(learner)){
    const layers=pathLayers(bundle,learner).filter(l=>(course.internal?l.internalIds:l.centralIds).includes(course.id));
    const names=[...new Set(layers.flatMap(l=>l.groups.filter(g=>course.internal?g.internal.some(i=>`internal:${i.id}`===course.id):g.selected.includes(course.id)).map(g=>g.name.replace(/cohort/gi,'learning group')+(g.profile.level?` (L${g.profile.level})`:' (Foundation)'))))];
    return `${sourceFor(bundle,learner,course.id)==='central-role'?'Central role option':'Central selection'} from ${names.join('; ')}. Shown in ${layers.map(l=>l.name).join('; ')}. ${sourceFor(bundle,learner,course.id)==='central-role'?'Selected for this responsibility in another-level central plan. Check professional and course prerequisites before committing. ':''}${course.internal?'Internal practice has no assessed coverage.':'A course is counted once in your personal plan, even if it supports several layers.'}`;
  }
  const g=groupFor(bundle,learner), chain=[...ancestors(bundle.scenario,g),g];
  const assigned=chain.filter(x=>course.internal?x.internal.some(i=>`internal:${i.id}`===course.id):x.selected.includes(course.id));
  const names=assigned.map(x=>x.name.replace(/cohort/gi,'learning group'));
  return `Included in ${names.join(' and ')||g.name}. ${course.internal?'Internal practice adds learning time; it has no assessed coverage.':'Shared learning is counted once in your pathway.'}`;
}
export function setStatus(bundle,learner,id,status,source) {
  if(!STATUSES.includes(status))throw Error('Choose a valid learning status.');
  const c=courseMap(bundle).get(id);if(!c)throw Error('This offering is no longer in this catalog.');
  if(unavailable(c)&&status!=='saved'&&status!=='deferred')throw Error('This offering is not ready to plan. You can save it for later.');
  const old=learner.items[id], now=new Date().toISOString();
  const requestedSource=old?.source||source||sourceFor(bundle,learner,id);
  const selectionSource=['central','central-role','previous-central','personalised','personal'].includes(requestedSource)?requestedSource:'personal';
  learner.items[id]={added:now,order:Object.keys(learner.items).length,dueDate:'',notes:'',actualHours:null,...old,status,source:selectionSource,title:c.title,updated:now};
  if(status==='completed'&&!old?.completedOn){
    learner.items[id].completedOn=localDate();
    const g=groupFor(bundle,learner);
    learner.items[id].completionContext={groupId:g.id,groupName:g.name,catalogueVersion:bundle.catalogue.version};
  }
  if(status!=='completed'){delete learner.items[id].completedOn;delete learner.items[id].completionContext;}
  learner.updated=now;
  return learner.items[id];
}
export function progress(bundle,learner) {
  const map=courseMap(bundle), entries=Object.entries(learner.items).filter(([,i])=>!['saved','deferred'].includes(i.status));
  let known=0,remaining=0,unknown=0;for(const [id,i] of entries){const c=map.get(id),h=c?hoursFor(bundle,c):null;if(h===null)unknown++;else{known+=h;if(i.status!=='completed')remaining+=h;}}
  const completed=entries.filter(([,i])=>i.status==='completed').length;
  return {total:entries.length,completed,known,remaining,unknown,weeks:Math.ceil(remaining/learner.profile.weeklyHours)};
}
export function selectedCourses(bundle,learner,mode) {
  const ids=mode==='central'?centralIds(bundle,learner):Object.entries(learner.items).filter(([,i])=>mode==='completed'?i.status==='completed':['planned','in-progress','completed'].includes(i.status)).map(([id])=>id);
  const map=courseMap(bundle);return [...new Set(ids)].map(id=>map.get(id)).filter(Boolean);
}
export function coverage(bundle,learner,mode='selected') {
  const profile=profileFor(bundle,learner), reqs=requirementsFor(bundle,learner), courses=selectedCourses(bundle,learner,mode);
  const enrich=rs=>{
    const m=measure(rs,courses,bundle.catalogue.thresholds);
    for(const n of m.needs){n.title=NEED_TITLES[n.id]||n.id;n.unassessed=n.rows.every(r=>!r.assessed);}
    return {...m,covered:m.needs.filter(n=>['Full','Strong'].includes(n.band)).length};
  };
  const sharedRows=isLayered(learner)?pathLayers(bundle,learner).filter(l=>['foundation','level'].includes(l.kind)).flatMap(l=>l.requirements):reqs;
  const rows=TRACK_NAMES.slice(0,4).map((name,level)=>({id:`level-${level}`,name,applicable:level<=profile.level,requirements:sharedRows.filter(r=>sharedLevel(r)===level),...enrich(sharedRows.filter(r=>sharedLevel(r)===level))}));
  if(isLayered(learner)){
    for(const layer of pathLayers(bundle,learner).filter(l=>l.kind==='specialist'))rows.push({id:layer.id,name:layer.name,track:'Specialist',applicable:true,reused:!!layer.reused,requirements:layer.requirements,...enrich(layer.requirements)});
  }else {
    for(const s of SPECIALISMS.filter(s=>profile.specialisms.includes(s.id))) { const rs=reqs.filter(r=>s.requirements.includes(r.id));rows.push({id:s.id,name:s.name,track:'Specialist',applicable:true,requirements:rs,...enrich(rs)}); }
  }
  for(const tool of profile.tools){const list=bundle.catalogue.courses.filter(c=>c.track==='tool'&&toolMatch(c,[tool]));const chosen=courses.filter(c=>list.some(t=>t.id===c.id));const rs=reqs.filter(r=>chosen.some(c=>Object.hasOwn(c.scores,r.id)));rows.push({id:`tool-${tool}`,name:tool,track:'Tooling',applicable:true,tool:true,trainingCount:chosen.length,completed:list.filter(c=>learner.items[c.id]?.status==='completed').length,requirements:rs,...enrich(rs)});}
  return {rows,total:enrich(reqs)};
}
export function searchCourses(bundle,learner,query='',filters={}) {
  const reqs=requirementsFor(bundle,learner), central=new Set(centralIds(bundle,learner)), terms=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const layer=filters.layer?flattenLayers(pathLayers(bundle,learner)).find(l=>l.id===filters.layer):null;
  // Explore the full model, independently of the learner's selected responsibilities.
  const role=LEARNING_ROLES.find(r=>`role:${r.id}`===filters.specialisation);
  const specialisationIds=new Set(SPECIALISMS.filter(s=>role?role.packages.includes(s.id):s.id===filters.specialisation).flatMap(s=>s.requirements));
  if(role?.id===7)for(const r of bundle.catalogue.requirements)if(r.need==='N5'&&sharedLevel(r)===0)specialisationIds.add(r.id);
  const ranked=[];
  for(const c of bundle.catalogue.courses){
    if(layer&&!layer.centralIds.includes(c.id)&&(layer.kind==='tool'?!toolMatch(c,[layer.tool])||c.track!=='tool':!layer.requirements.some(r=>(c.scores[r.id]?.score||0)>=2)))continue;
    if(filters.specialisation&&![...specialisationIds].some(id=>(c.scores[id]?.score||0)>=2))continue;
    if(filters.tool&&!toolMatch(c,[filters.tool]))continue;
    const tracks=displayTracks(bundle,learner,c), text=[c.id,c.title,c.provider,c.description,c.tool,...tracks,...reqs.filter(r=>(c.scores[r.id]?.score||0)>=2).map(r=>NEED_TITLES[r.need]||r.title)].join(' ').toLocaleLowerCase();
    if(!terms.every(t=>text.includes(t)))continue;
    const h=hoursFor(bundle,c);
    if(filters.track&& !tracks.includes(filters.track))continue;
    if(filters.provider&&c.provider!==filters.provider)continue;
    if(filters.type&&c.type!==filters.type)continue;
    if(filters.short&&(h===null||h>2))continue;
    if(filters.myTools&&!toolMatch(c,profileFor(bundle,learner).tools))continue;
    if(filters.relevant&&!central.has(c.id)&&!(c.track==='tool'?toolMatch(c,profileFor(bundle,learner).tools):reqs.some(r=>(c.scores[r.id]?.score||0)>=2)))continue;
    if(filters.available&&unavailable(c))continue;
    if(filters.saved&&!learner.items[c.id])continue;
    if(filters.need&&!reqs.some(r=>r.need===filters.need&&(c.scores[r.id]?.score||0)>=2))continue;
    const score=(central.has(c.id)?20:0)+terms.reduce((n,t)=>n+(c.title.toLowerCase().includes(t)?5:0),0)+(tracks.length?3:0);
    ranked.push({course:c,score});
  }
  return ranked.sort((a,b)=>filters.sort==='shortest'?(hoursFor(bundle,a.course)??Infinity)-(hoursFor(bundle,b.course)??Infinity)||a.course.title.localeCompare(b.course.title):filters.sort==='title'?a.course.title.localeCompare(b.course.title):b.score-a.score||a.course.title.localeCompare(b.course.title)).map(x=>x.course);
}
export function validateBackup(raw) {
  if(!raw||raw.schema!=='ai-learning-path/1'||typeof raw.id!=='string'||typeof raw.acknowledged!=='string'||!raw.profile||!raw.items||Array.isArray(raw.items)||!Array.isArray(raw.feedback))throw Error('This is not a supported learning-path backup.');
  const p=raw.profile, strings=(a,max)=>Array.isArray(a)&&a.length<=max&&a.every(x=>typeof x==='string'&&x.length<=500);
  if(p.learningRoute!==undefined&&!['standard','coached'].includes(p.learningRoute))throw Error('Invalid learning route.');
  if(typeof p.groupId!=='string'||typeof p.name!=='string'||p.name.length>80||!Number.isFinite(p.weeklyHours)||p.weeklyHours<.25||p.weeklyHours>80||!['new','some','regular'].includes(p.experience)||!strings(p.tools,100)||!strings(p.specialisms,50)||!p.answers||typeof p.priorLearning!=='string'||p.priorLearning.length>2000)throw Error('The profile in this backup is invalid.');
  for(const q of CHECKS)if(p.answers[q.id]!==undefined&&(!Number.isInteger(p.answers[q.id])||p.answers[q.id]<0||p.answers[q.id]>2))throw Error('Invalid starting-point answer.');
  if(p.specialisms.some(id=>!SPECIALISMS.some(s=>s.id===id)))throw Error('Unknown responsibility in the profile.');
  if(p.codingReady!==undefined&&typeof p.codingReady!=='boolean')throw Error('Invalid prerequisite preference.');
  if(p.quickSetup!==undefined&&typeof p.quickSetup!=='boolean')throw Error('Invalid quick setup preference.');
  if(p.pathVersion!==undefined&&(![2,3,4].includes(p.pathVersion)||![1,2,3].includes(p.level)||p.levelGoal!==undefined&&![1,2,3].includes(p.levelGoal)))throw Error('Invalid learning-path level.');
  if([3,4].includes(p.pathVersion)){
    const unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
    if(!unique(p.roles)||p.roles.some(id=>!LEARNING_ROLES.some(r=>r.id===id))||!p.roleResponsibilities||Array.isArray(p.roleResponsibilities))throw Error('Invalid learning roles.');
    for(const [id,packages] of Object.entries(p.roleResponsibilities)){
      const role=LEARNING_ROLES.find(r=>String(r.id)===id);
      if(!role||!p.roles.includes(role.id)||!unique(packages)||packages.some(pkg=>!role.packages.includes(pkg)))throw Error('Invalid role responsibility.');
    }
    if(!unique(p.pendingSpecialisms)||p.pendingSpecialisms.some(id=>LEARNING_ROLES.filter(r=>r.packages.includes(id)).length<2))throw Error('Invalid unplaced responsibility.');
    if(!p.activityAnswers||Array.isArray(p.activityAnswers)||Object.entries(p.activityAnswers).some(([id,v])=>!['automated-judges','ai-assisted-assurance'].includes(id)||typeof v!=='boolean'))throw Error('Invalid activity answer.');
    const expected=rolePackages(p),activities=Object.keys(p.activityAnswers).filter(id=>p.activityAnswers[id]);
    if(!unique(p.specialisms)||expected.length!==p.specialisms.length||expected.some(id=>!p.specialisms.includes(id)))throw Error('Responsibility scope does not match the selected roles.');
    if(!unique(p.activities)||activities.length!==p.activities.length||activities.some(id=>!p.activities.includes(id)))throw Error('Activities do not match the learner answers.');
  }
  if(p.pathVersion===4){
    if(!p.toolUses||Array.isArray(p.toolUses)||typeof p.toolUses!=='object')throw Error('Invalid tool purposes.');
    for(const [tool,uses] of Object.entries(p.toolUses))if(!p.tools.includes(tool)||!strings(uses,4)||new Set(uses).size!==uses.length||uses.some(id=>!TOOL_USES.some(u=>u.id===id)))throw Error('Invalid tool purpose.');
    if(p.targetReview!==null&&(!p.targetReview||![1,2,3].includes(p.targetReview.previousGoal)||![1,2,3].includes(p.targetReview.confirmedLevel)))throw Error('Invalid target-level review.');
    const scope=p.centralScope;
    if(scope!==null){
      if(!scope||!['scenarioId','groupId','groupName'].every(k=>typeof scope[k]==='string'&&scope[k].length<=1000)||!['added','removed'].every(k=>strings(scope[k],500)&&new Set(scope[k]).size===scope[k].length&&scope[k].every(id=>/^(N\d+|R\d+\.\d+)\.\d+$/.test(id)))||scope.added.some(id=>scope.removed.includes(id)))throw Error('Invalid central outcome scope.');
    }
  }
  if(Object.keys(raw.items).length>3000||raw.feedback.length>10000)throw Error('The backup is too large.');
  for(const [id,item] of Object.entries(raw.items)) {
    if(!/^[\w:.-]{1,150}$/.test(id)||['__proto__','constructor','prototype'].includes(id)||!item||!STATUSES.includes(item.status)||!['central','central-role','previous-central','personalised','personal'].includes(item.source)||typeof item.title!=='string'||item.title.length>1000||!Number.isFinite(item.order)||item.order<0||typeof item.notes!=='string'||item.notes.length>10000||typeof item.dueDate!=='string'||item.dueDate&&!/^\d{4}-\d{2}-\d{2}$/.test(item.dueDate)||item.actualHours!==null&&(!Number.isFinite(item.actualHours)||item.actualHours<0||item.actualHours>10000))throw Error('A saved learning item is invalid.');
    if(item.completionContext&&!['groupId','groupName','catalogueVersion'].every(key=>typeof item.completionContext[key]==='string'))throw Error('Invalid completion history.');
  }
  for(const f of raw.feedback)validateFeedback(f);
  if(typeof raw.formsTemplate!=='string'||raw.formsTemplate.length>16000)throw Error('Invalid feedback configuration.');
  if(raw.formsDisabled!==undefined&&typeof raw.formsDisabled!=='boolean')throw Error('Invalid feedback configuration.');
  if(raw.formsTemplate)validateFormsTemplate(raw.formsTemplate);
  if(!Array.isArray(raw.history)||raw.history.length>1000)throw Error('Invalid update history.');
  return structuredClone(raw);
}
export function validateCentralScenario(scenario,bundle) {
  return prepareCentralScenario(scenario,bundle.catalogue);
}
export function updateDifference(bundle,learner) {
  const ids=new Set(centralIds(bundle,learner)),map=courseMap(bundle);
  return {changed:learner.acknowledged!==signature(bundle),added:[...ids].filter(id=>!learner.items[id]),removed:Object.keys(learner.items).filter(id=>['central','central-role'].includes(learner.items[id].source)&&!ids.has(id)&&!id.startsWith('internal:')),unresolved:Object.keys(learner.items).filter(id=>!map.has(id)),missingGroup:!isLayered(learner)&&!bundle.scenario.cohorts.some(g=>g.id===learner.profile.groupId)};
}
export function validateFormsTemplate(value) {
  let u;try{u=new URL(value);}catch{throw Error('Paste the full pre-filled Microsoft Forms URL.');}
  if(u.protocol!=='https:'||!['forms.office.com','forms.cloud.microsoft','forms.microsoft.com'].includes(u.hostname)||u.username||u.password)throw Error('Use an HTTPS Microsoft Forms link.');
  const values=[...u.searchParams.values()].join(' '), missing=FEEDBACK_FIELDS.filter(k=>!values.includes(`{{${k}}}`));
  if(missing.length)throw Error(`The pre-filled link is missing these placeholders: ${missing.map(x=>`{{${x}}}`).join(', ')}`);
  return u;
}
export function feedbackUrl(template,feedback) {
  const u=validateFormsTemplate(template), fields={COURSE_ID:feedback.courseId,COURSE_TITLE:feedback.courseTitle,GROUP_ID:feedback.groupId,GROUP_NAME:feedback.groupName,CATALOGUE_VERSION:feedback.catalogueVersion,COMPLETED_ON:feedback.completedOn,USEFULNESS:feedback.usefulness,DIFFICULTY:feedback.difficulty,ACTUAL_HOURS:feedback.actualHours??'',COMMENT:feedback.comment,RESPONSE_ID:feedback.id};
  for(const [key,val] of [...u.searchParams])u.searchParams.set(key,val.replace(/\{\{([A-Z_]+)\}\}/g,(token,k)=>Object.hasOwn(fields,k)?String(fields[k]):token));
  if(u.href.length>15000)throw Error('This feedback link is too long. Shorten the optional comment.');
  return u.href;
}
export function validateFeedback(f) {
  if(!f||typeof f.id!=='string'||typeof f.courseId!=='string'||typeof f.courseTitle!=='string'||typeof f.groupId!=='string'||typeof f.groupName!=='string'||typeof f.catalogueVersion!=='string'||typeof f.completedOn!=='string'||!Number.isInteger(f.usefulness)||f.usefulness<1||f.usefulness>5||!['Too basic','About right','Too advanced'].includes(f.difficulty)||!(f.actualHours===null||Number.isFinite(f.actualHours)&&f.actualHours>=0&&f.actualHours<=10000)||typeof f.comment!=='string'||f.comment.length>1200)throw Error('Invalid feedback: check the course, rating, difficulty, and hours.');
  return f;
}
export function exportPlan(bundle,learner) {
  const map=courseMap(bundle);return csv([['Course ID','Course','Provider','Recommendation source','Personal status','Target date','Completed on','Estimated hours','Actual hours','Notes','Course URL','Learning group','Catalog version'],...Object.entries(learner.items).sort((a,b)=>a[1].order-b[1].order).map(([id,i])=>{const c=map.get(id);return [id,c?.title||i.title,c?.provider||'',sourceFor(bundle,learner,id),STATUS_LABELS[i.status],i.dueDate,i.completedOn||'',c?hoursFor(bundle,c):'',i.actualHours??'',i.notes,c?.url||'',groupFor(bundle,learner).name,bundle.catalogue.version];})]);
}
export function parseCSV(text) {
  const rows=[];let row=[],cell='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(!quoted&&cell!=='')throw Error('Invalid CSV quoting.');else quoted=!quoted;}else if(ch===','&&!quoted){row.push(cell);cell='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=ch;}
  if(quoted)throw Error('Unclosed quote in CSV.');row.push(cell);if(row.some(Boolean))rows.push(row);
  if(!rows.length)throw Error('The file is empty.');const headers=rows.shift().map(s=>s.trim());if(new Set(headers).size!==headers.length)throw Error('CSV contains duplicate column names.');return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])));
}
export function feedbackFromRows(rows) {
  const field=(r,key)=>r[key]??r[key.toLowerCase()]??'';
  return rows.map(r=>validateFeedback({id:String(field(r,'RESPONSE_ID')),courseId:String(field(r,'COURSE_ID')),courseTitle:String(field(r,'COURSE_TITLE')),groupId:String(field(r,'GROUP_ID')),groupName:String(field(r,'GROUP_NAME')),catalogueVersion:String(field(r,'CATALOGUE_VERSION')),completedOn:String(field(r,'COMPLETED_ON')),usefulness:Number(field(r,'USEFULNESS')),difficulty:String(field(r,'DIFFICULTY')),actualHours:field(r,'ACTUAL_HOURS')===''?null:Number(field(r,'ACTUAL_HOURS')),comment:String(field(r,'COMMENT'))}));
}
export function summariseFeedback(feedback,bundle) {
  const unique=new Map(),map=courseMap(bundle), groups=new Map();
  for(const f of feedback){validateFeedback(f);if(!f.id||!map.has(f.courseId))throw Error(`Unrecognised course or response ID: ${f.courseId}`);unique.set(f.id,f);}
  for(const f of unique.values()){
    const key=`${f.courseId}|${f.groupId}|${f.catalogueVersion}`;
    if(!groups.has(key))groups.set(key,{courseId:f.courseId,courseTitle:map.get(f.courseId).title,groupId:f.groupId,groupName:f.groupName,catalogueVersion:f.catalogueVersion,responses:[]});groups.get(key).responses.push(f);
  }
  const result=[...groups.values()].map(g=>{const times=g.responses.map(x=>x.actualHours).filter(x=>x!==null).sort((a,b)=>a-b),c=map.get(g.courseId);return {...g,count:g.responses.length,usefulness:g.responses.reduce((n,f)=>n+f.usefulness,0)/g.responses.length,tooAdvanced:g.responses.filter(x=>x.difficulty==='Too advanced').length,tooBasic:g.responses.filter(x=>x.difficulty==='Too basic').length,medianHours:times.length?times.length%2?times[Math.floor(times.length/2)]:(times[times.length/2-1]+times[times.length/2])/2:null,estimatedHours:hoursFor(bundle,c)};});
  return {responses:[...unique.values()],groups:result};
}
export function reviewedSummary(feedback,bundle) {
  const grouped=new Map();for(const f of summariseFeedback(feedback,bundle).responses){if(!grouped.has(f.courseId))grouped.set(f.courseId,[]);grouped.get(f.courseId).push(f);}
  return {schema:'ai-learning-feedback-summary/1',reviewed:true,reviewedOn:new Date().toISOString(),catalogueVersion:bundle.catalogue.version,courses:[...grouped].map(([courseId,rs])=>({courseId,count:rs.length,usefulness:rs.reduce((n,r)=>n+r.usefulness,0)/rs.length}))};
}
