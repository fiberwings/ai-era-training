import {profileRequirements} from '../../training-planner/public/capability-model.js';
import {ancestors, cumulativeScope} from '../../training-planner/public/cohorts.js';

// Save outcome choices independently of live central-plan revisions. Courses and
// completion/feedback records are never rewritten when a scope is reviewed.
export function captureCentralScope(bundle,groupId) {
  if(!groupId)return null;
  const group=bundle.scenario.cohorts.find(g=>g.id===groupId);
  if(!group)throw Error('This central learning profile is no longer available.');
  const canonical=new Set(profileRequirements(bundle.catalogue,group.profile).map(r=>r.id));
  const actual=new Set(cumulativeScope(bundle.catalogue,bundle.scenario,group).map(r=>r.id));
  return {scenarioId:bundle.scenario.id,groupId:group.id,groupName:group.name,
    added:[...actual].filter(id=>!canonical.has(id)).sort(),removed:[...canonical].filter(id=>!actual.has(id)).sort()};
}
export function scopeDifference(bundle,profile) {
  const saved=profile.centralScope;
  if(!saved)return null;
  const group=bundle.scenario.cohorts.find(g=>g.id===saved.groupId);
  if(!group||bundle.scenario.id!==saved.scenarioId)return {missing:true,saved,current:group?captureCentralScope(bundle,group.id):null};
  const current=captureCentralScope(bundle,group.id);
  if(JSON.stringify(current.added)===JSON.stringify([...saved.added].sort())&&JSON.stringify(current.removed)===JSON.stringify([...saved.removed].sort()))return null;
  return {missing:false,saved,current};
}
export function scopeSources(bundle,profile) {
  const s=profile.centralScope;
  if(!s||s.scenarioId!==bundle.scenario.id)return [];
  const group=bundle.scenario.cohorts.find(g=>g.id===s.groupId);
  return group?[...ancestors(bundle.scenario,group),group]:[];
}
export function applyScopeChoice(bundle,profile,groupId) {
  if(groupId===(profile.centralScope?.groupId||''))return profile;
  return {...profile,centralScope:captureCentralScope(bundle,groupId)};
}
