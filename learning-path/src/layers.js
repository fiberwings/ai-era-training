import {SPECIALISMS, ACTIVITIES, profileRequirements, effectiveRequirement, sharedLevel} from '../../training-planner/public/capability-model.js';
import {ROLE_FAMILIES, ROLE_RESPONSIBILITIES} from '../../training-planner/public/model-explanation.js';
import {ancestors} from '../../training-planner/public/cohorts.js';

import {toolUseMatch, validateToolUses} from './tool-audiences.js';
import {captureCentralScope, scopeSources} from './central-scope.js';
import {componentPathSources, groupsReviewStatus} from './published-pathways.js';

export const PATH_LEVELS = [
  {level:1, name:'L1 · Work with AI', description:'Use AI to help with your own tasks. Give clear instructions and check the result.'},
  {level:2, name:'L2 · Supervise AI agents', description:'Delegate tasks to agents, monitor their work, test results, and step in when needed.'},
  {level:3, name:'L3 · Build and evaluate agents', description:'Design or configure agents and workflows, test their behaviour, and improve reliability. Coding is optional.'}
];
export const LEARNING_ROLES = ROLE_FAMILIES.map(r=>({...r,packages:ROLE_RESPONSIBILITIES[r.id]}));
export function responsibilityName(id) {
  return {'agent-engineering':'Agent infrastructure','threat-intelligence':'Tracking the AI threat landscape and adjusting controls','code-analysis':'AI code-analysis engineering, including application-security harnesses'}[id]||SPECIALISMS.find(s=>s.id===id)?.name||id;
}
export function selectedRoles(p) { return LEARNING_ROLES.filter(r=>(p.roles||[]).includes(r.id)); }
export function rolePackages(p) { return [...new Set([...selectedRoles(p).flatMap(r=>p.roleResponsibilities?.[r.id]||[]),...(p.pendingSpecialisms||[])])]; }
export function applicableActivities(p) {
  const packages=rolePackages(p);
  return ACTIVITIES.filter(a=>!(p.centralScope?.removed||[]).includes(a.requirement)).filter(a=>a.id==='automated-judges'?p.level===3||(p.centralScope?.added||[]).includes(a.requirement):packages.includes('agent-assurance')||(p.centralScope?.added||[]).includes(a.requirement));
}
export function syncRoleProfile(p) {
  p.specialisms=rolePackages(p);
  p.activities=ACTIVITIES.filter(a=>p.activityAnswers?.[a.id]===true).map(a=>a.id);
  return p;
}
export function isLayered(learner) { return [2,3,4].includes(learner.profile.pathVersion); }
export function migrateLearner(bundle,learner) {
  const p=learner.profile;
  if(p.pathVersion===4)return learner;
  const previousVersion=p.pathVersion;
  if(![2,3].includes(p.pathVersion)){
    const g=bundle.scenario.cohorts.find(g=>g.id===p.groupId);
    p.level=Math.max(1,g?.profile.level||1);p.levelGoal=p.level;
    p.specialisms=[...new Set([...(g?.profile.specialisms||[]),...p.specialisms])];
    p.tools=[...new Set([...(g?.profile.tools||[]),...p.tools])];
  }
  if(p.pathVersion!==3){
  p.roles=[];p.roleResponsibilities={};p.pendingSpecialisms=[];
  for(const id of p.specialisms){
    const roles=LEARNING_ROLES.filter(r=>r.packages.includes(id));
    if(roles.length===1){const role=roles[0].id;if(!p.roles.includes(role))p.roles.push(role);(p.roleResponsibilities[role]??=[]).push(id);}
    else p.pendingSpecialisms.push(id);
  }
  p.roles.sort((a,b)=>a-b);p.activityAnswers={};
  // Only an explicitly saved activity can prefill Yes. Never infer an answer
  // from a central plan. Unanswered applicable questions require confirmation.
  for(const id of p.activities||[])if(ACTIVITIES.some(a=>a.id===id))p.activityAnswers[id]=true;
  }
  p.toolUses={};
  p.centralScope=null;
  if(bundle.scenario.cohorts.some(g=>g.id===p.groupId)){const scope=captureCentralScope(bundle,p.groupId);if(scope.added.length||scope.removed.length)p.centralScope=scope;}
  p.targetReview=[2,3].includes(previousVersion)&&[1,2,3].includes(p.levelGoal)&&p.levelGoal!==p.level?{previousGoal:p.levelGoal,confirmedLevel:p.level}:null;
  p.pathVersion=4;syncRoleProfile(p);
  // Course commitments, dates, notes, ratings and original feedback/completion
  // context are untouched. Unplaced packages retain their entire learning scope.
  return learner;
}
export function recommendLevel(profile) {
  const goal=[1,2,3].includes(profile.levelGoal)?profile.levelGoal:1,a=profile.answers||{};
  const basics=a.verify===1&&a.safe===2,supervision=basics&&a.agent===0;
  const level=goal===1?1:goal===3&&supervision&&a.build===1?3:supervision?2:1;
  const reason=level===3?'Your goal is to build agents, and your checks show a starting point for evaluation and oversight.':level===2?'Your answers support a starting point in supervising agents and checking their work.':goal===1?'You want AI to assist with your own work. L1 is the matching starting point.':'Start with using AI and checking its outputs, then build toward your goal.';
  return {level,goal,reason};
}
export function startingPoint(profile) {
  if(profile.quickSetup&&!Object.keys(profile.answers||{}).length)return {level:profile.level,goal:profile.level,reason:'Begin with your selected work level. Foundation and earlier practice remain available.'};
  return recommendLevel({...profile,levelGoal:profile.level});
}
export function setWorkTarget(profile,level) {
  if(![1,2,3].includes(level))throw Error('Choose one target work level.');
  return {...profile,level,levelGoal:level,targetReview:null};
}
export function quickPathProfile(base,{level,roles,tools,codingReady=false}) {
  if(!roles.length||roles.some(id=>!LEARNING_ROLES.some(r=>r.id===id)))throw Error('Choose at least one responsibility area.');
  const selected=[...new Set(roles)],roleResponsibilities=Object.fromEntries(selected.map(id=>{
    const previous=base.roles.includes(id)?base.roleResponsibilities[id]:null;
    return [id,previous?.length?[...previous]:[...LEARNING_ROLES.find(r=>r.id===id).packages]];
  }));
  const placed=new Set(Object.values(roleResponsibilities).flat());
  return validatePathChoices(syncRoleProfile({...setWorkTarget(base,level),quickSetup:true,roles:selected,roleResponsibilities,
    pendingSpecialisms:(base.pendingSpecialisms||[]).filter(id=>!placed.has(id)),
    tools:[...new Set(tools)],toolUses:Object.fromEntries(tools.filter(tool=>base.toolUses?.[tool]?.length).map(tool=>[tool,[...base.toolUses[tool]]])),codingReady}));
}
export function validateRoleChoices(p) {
  if(!p.roles?.length)throw Error('Choose at least one role for your specialisations.');
  for(const r of selectedRoles(p))if(r.packages.length&&!p.roleResponsibilities[r.id]?.length)throw Error(`Choose at least one responsibility for ${r.name}.`);
  if(!p.quickSetup&&p.pendingSpecialisms?.length)throw Error('Place each previous shared responsibility under the relevant role before saving.');
  if(!p.quickSetup)for(const a of applicableActivities(p))if(typeof p.activityAnswers?.[a.id]!=='boolean')throw Error(`Answer the activity question: ${a.name}.`);
  return p;
}
export function validatePathChoices(profile) {
  if(![1,2,3].includes(profile.level))throw Error('Choose one level: L1, L2, or L3.');
  validateRoleChoices(profile);
  if(!profile.tools.length)throw Error('Choose at least one tool for your path.');
  validateToolUses(profile);
  return syncRoleProfile(profile);
}
export function needsRoleReview(p) { return !!p.targetReview||(!p.quickSetup&&(p.tools.some(tool=>!p.toolUses?.[tool]?.length)||!!p.pendingSpecialisms?.length||applicableActivities(p).some(a=>typeof p.activityAnswers?.[a.id]!=='boolean'))); }
export function matchesTool(course,tools) {
  const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
  const c=normalize(course.tool||'');
  return tools.some(t=>{const n=normalize(t);return n.length>3&&c.length>3&&(c.includes(n)||n.includes(c));});
}
export function flattenLayers(layers) { return layers.flatMap(l=>[l,...(l.responsibilities||[])]); }
export function centralStep(layer,course) {
  const levels=layer.groups.filter(g=>g.selected.includes(course.id)||g.internal.some(i=>`internal:${i.id}`===course.id)).map(g=>g.profile.level);
  return levels.length?Math.min(...levels):null;
}
export function pathLayers(bundle,learner) {
  const p=learner.profile.pathVersion===4?learner.profile:migrateLearner(bundle,structuredClone(learner)).profile;
  const groups=bundle.scenario.cohorts,level=[1,2,3].includes(p.level)?p.level:1,specialisms=rolePackages(p);
  const componentSources=componentPathSources(bundle.scenario,p,specialisms);
  const shared=groups.filter(g=>!g.profile.specialisms.length&&g.profile.level<=level);
  const target=shared.find(g=>g.profile.level===level);
  const base=componentSources?.base||(target?[...ancestors(bundle.scenario,target),target].filter(g=>!g.profile.specialisms.length):shared);
  const removed=new Set(p.centralScope?.removed||[]),added=new Set(p.centralScope?.added||[]);
  const baseIds=new Set(base.flatMap(g=>g.requirementIds||[]));
  const baseRows=(componentSources?bundle.catalogue.requirements.filter(r=>baseIds.has(r.id)):profileRequirements(bundle.catalogue,{level,specialisms:[]})).filter(r=>!removed.has(r.id));
  const matches=componentSources?.matches||new Map(specialisms.map(id=>[id,groups.filter(g=>g.profile.specialisms.includes(id)).sort((a,b)=>{
    const fit=g=>(g.profile.level===level?100:0)+(g.id===p.groupId?10:0)-g.profile.specialisms.filter(s=>!specialisms.includes(s)).length;
    return fit(b)-fit(a);
  })]));
  const sourceGroups=[...new Map([...base,...[...matches.values()].flat()].map(g=>[g.id,g])).values()];
  const profile={level,specialisms,tools:p.tools,activities:ACTIVITIES.filter(a=>p.activityAnswers?.[a.id]===true).map(a=>a.id)};
  const map=new Map(bundle.catalogue.courses.map(c=>[c.id,c])),requirements=new Map(bundle.catalogue.requirements.map(r=>[r.id,r]));
  const foundationIds=new Set(base.filter(g=>g.profile.level===0).flatMap(g=>g.selected));
  const make=(id,kind,name,description,rows,sources,tool=null)=>{
    const fits=c=>tool?c.track==='tool'&&matchesTool(c,[tool])&&toolUseMatch(c,p,tool):c.track!=='tool'&&(componentSources||kind!=='specialist'||rows.some(r=>(c.scores[r.id]?.score||0)>=2));
    const centralIds=[...new Set(sources.flatMap(g=>g.selected))].filter(id=>map.has(id)&&fits(map.get(id))&&(kind!=='level'||!foundationIds.has(id)));
    const fitsInternal=i=>!tool&&i.requirements.some(id=>rows.some(r=>r.id===id));
    const internalIds=[...new Set(sources.flatMap(g=>g.internal.filter(fitsInternal).map(i=>`internal:${i.id}`)))];
    const directIds=new Set(sources.filter(g=>kind!=='specialist'||g.profile.level===level).flatMap(g=>[...g.selected,...g.internal.filter(fitsInternal).map(i=>`internal:${i.id}`)]));
    const roleOptionIds=kind==='specialist'?[...centralIds,...internalIds].filter(id=>!directIds.has(id)):[];
    return {id,kind,name,description,requirements:rows.map(r=>effectiveRequirement({...r,core:requirements.get(r.id)?.core??r.core},profile)),centralIds,internalIds,roleOptionIds,groups:sources,tool,profile,reviewStatus:componentSources&&['specialist','tool'].includes(kind)?'AI recommendation - to be reviewed':groupsReviewStatus(sources),excluded:[...new Set(sources.flatMap(g=>g.excluded))]};
  };
  const foundation=make('foundation','foundation','Foundation','Common knowledge, safe use, and AI risks. Always part of your path.',baseRows.filter(r=>sharedLevel(r)===0),base.filter(g=>g.profile.level===0));
  const packageLayer=(id,roleId)=>{
    const s=SPECIALISMS.find(s=>s.id===id);
    const sources=matches.get(id)||[],scopeIds=componentSources?[...new Set(sources.flatMap(g=>g.requirementIds))]:s.requirements;
    return {...make(`responsibility:${roleId}:${id}`,'specialist',responsibilityName(id),'Apply AI skills to this responsibility.',bundle.catalogue.requirements.filter(r=>scopeIds.includes(r.id)&&!removed.has(r.id)),sources),packageId:id,roleId};
  };
  const roleLayer=(role,ids)=>{
    const responsibilities=ids.map(id=>packageLayer(id,role.id));
    const merge=key=>[...new Set(responsibilities.flatMap(l=>l[key]))];
    const direct=new Set(responsibilities.flatMap(l=>[...l.centralIds,...l.internalIds].filter(id=>!l.roleOptionIds.includes(id))));
    return {id:`role:${role.id}`,kind:'specialist',name:role.name,roleId:role.id,description:'Learning for your selected responsibilities.',responsibilities,
      requirements:[...new Map(responsibilities.flatMap(l=>l.requirements).map(r=>[r.id,r])).values()],centralIds:merge('centralIds'),internalIds:merge('internalIds'),roleOptionIds:merge('roleOptionIds').filter(id=>!direct.has(id)),groups:[...new Map(responsibilities.flatMap(l=>l.groups).map(g=>[g.id,g])).values()],excluded:merge('excluded'),profile};
  };
  const roles=selectedRoles(p).map(role=>{
    if(role.id!==7)return roleLayer(role,p.roleResponsibilities[role.id]||[]);
    const layer=make('role:7','specialist',role.name,'Reuse relevant AI-risk learning from Foundation and practical learning for your selected tools.',foundation.requirements.filter(r=>r.need==='N5'),foundation.groups);
    return {...layer,roleId:7,reused:true,roleOptionIds:[],responsibilities:[]};
  });
  if(p.pendingSpecialisms?.length)roles.push({...roleLayer({id:'pending',name:'Previous responsibilities — confirm your roles'},p.pendingSpecialisms),pending:true});
  const assigned=new Set([...baseRows,...roles.flatMap(l=>l.requirements)].map(r=>r.id));
  const extras=bundle.catalogue.requirements.filter(r=>added.has(r.id)&&!removed.has(r.id)&&!assigned.has(r.id));
  if(extras.length)roles.push({...make('central-scope','specialist','Additional learning from your central profile','Explicit outcomes from '+p.centralScope.groupName,extras,scopeSources(bundle,p)),customScope:true,roleOptionIds:[],responsibilities:[]});
  return [foundation,
    make('level','level',PATH_LEVELS[level-1].name,`${PATH_LEVELS[level-1].description}${level>1?' Includes earlier-level practice where needed.':''}`,baseRows.filter(r=>sharedLevel(r)!==null&&sharedLevel(r)>0),base.filter(g=>g.profile.level>0)),
    ...roles,...p.tools.map(tool=>({...make(`tool:${tool}`,'tool',tool,'Practical learning matched to what you do with this tool.',[],sourceGroups.filter(g=>base.some(b=>b.id===g.id)||g.profile.level===level),tool),uses:p.toolUses?.[tool]||[]}))];
}
export function layeredGroup(bundle,learner) {
  const layers=pathLayers(bundle,learner),p=learner.profile,sources=[...new Map(layers.flatMap(l=>l.groups).map(g=>[g.id,g])).values()];
  return {id:`path:L${p.level}:${layers.filter(l=>l.kind==='specialist').map(l=>l.id).join('+')}:${[...layers[0].profile.specialisms].sort().join('+')}`,name:[`L${p.level}`,...layers.filter(l=>l.kind==='specialist').map(l=>l.name)].join(' · '),parent:null,
    profile:layers[0].profile,rank:p.level,needs:[...new Set(layers.flatMap(l=>l.requirements.map(r=>r.need)))],
    selected:[...new Set(layers.flatMap(l=>l.centralIds))],internal:[...new Map(sources.flatMap(g=>g.internal).filter(i=>layers.some(l=>l.internalIds.includes(`internal:${i.id}`))).map(i=>[i.id,i])).values()],
    excluded:[...new Set(sources.flatMap(g=>g.excluded))],removedRequirements:[],addedRequirements:[],filters:{audience:true,types:[]}};
}
