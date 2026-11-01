import {validateScenario} from '../../training-planner/public/storage.js';
import {pathComponents, componentChain, componentScope} from '../../training-planner/public/components.js';
import {profileRequirements} from '../../training-planner/public/capability-model.js';

// Keep the source component plan intact. Cohorts are a compatibility view for
// saved central scopes and older profiles, never a replacement planning source.
export function prepareCentralScenario(source,catalogue) {
  if(![2,3].includes(source?.schema))throw Error('Use a current model-v2 scenario from the training builder. Older models are not silently converted.');
  const warnings=validateScenario(source,catalogue);
  if(warnings.length)throw Error(`Review this central plan in the training builder first: ${warnings.join(' ')}`);
  if(source.schema===2)return source;
  const scenario=structuredClone(source);
  const group=(id,name,profile,components,extra={})=>{
    const rows=[...new Set(components.flatMap(c=>componentScope(catalogue,c,profile.activities).map(r=>r.id)))];
    const canonical=profileRequirements(catalogue,profile).map(r=>r.id);
    return {id,name,parent:null,rank:profile.level,profile,budget:null,
      needs:[...new Set(catalogue.requirements.filter(r=>rows.includes(r.id)).map(r=>r.need))],
      selected:[...new Set(components.flatMap(c=>c.selected))],pinned:[],excluded:[...new Set(components.flatMap(c=>c.excluded))],
      internal:[...new Map(components.flatMap(c=>c.internal).map(i=>[i.id,i])).values()],
      addedRequirements:rows.filter(id=>!canonical.includes(id)),removedRequirements:canonical.filter(id=>!rows.includes(id)),
      filters:{audience:true,types:[]},rationale:'',...extra};
  };
  scenario.cohorts=scenario.audiences.map(a=>group(a.id,a.name,{level:a.level,specialisms:a.specialisms,tools:[],activities:a.activities},pathComponents(scenario,a),{rationale:a.rationale,reviewStatus:a.reviewStatus}));
  for(const [level,id] of ['all','entry','practitioner','technical'].entries()){
    const c=scenario.components.find(c=>c.level===level&&!c.variantOf);
    if(c&&!scenario.cohorts.some(g=>g.id===id))scenario.cohorts.push(group(id,c.name,{level,specialisms:[],tools:[],activities:c.activities||[]},componentChain(scenario,c.id),{rationale:c.rationale,reviewStatus:c.reviewStatus}));
  }
  return scenario;
}

function componentGroup(c,level,audience=null) {
  return {id:c.id+(audience?'@'+audience.id:''),name:audience?`${audience.name} / ${c.name}`:c.name,parent:null,
    profile:{level,specialisms:c.specialism?[c.specialism]:[],tools:c.tool?[c.tool]:[],activities:c.activities||[]},rank:level,
    selected:c.selected,internal:c.internal,excluded:c.excluded,filters:c.filters,addedRequirements:c.addedRequirements,removedRequirements:c.removedRequirements,
    requirementIds:[...new Set([...c.requirements,...c.addedRequirements])].filter(id=>!c.removedRequirements.includes(id)),
    reviewStatus:c.reviewStatus,reviewDate:c.reviewDate,rationale:c.rationale,sourceComponentId:c.id,sourceAudienceId:audience?.id};
}

export function componentPathSources(scenario,profile,specialisms) {
  if(scenario.schema!==3)return null;
  const level=profile.level||1;
  const coached=profile.learningRoute==='coached';
  const target=scenario.components.find(c=>c.level===level&&(coached?c.id===`l${level}-coached`:!c.variantOf))||scenario.components.find(c=>c.level===level&&!c.variantOf);
  const base=target?componentChain(scenario,target.id).map(c=>componentGroup(c,c.level)):[];
  const matches=new Map(specialisms.map(id=>[id,[]]));
  const assign=(ids,roleId)=>{
    const role=scenario.publication?.roles?.find(r=>r.id===roleId);
    const eligible=scenario.audiences.filter(a=>a.specialisms.length&&a.specialisms.every(id=>ids.includes(id))&&(!role||role.audiences.includes(a.id)));
    const preferred=profile.centralScope?.scenarioId===scenario.id?profile.centralScope.groupId:profile.groupId;
    eligible.sort((a,b)=>Number(b.id===preferred)-Number(a.id===preferred)||b.specialisms.length-a.specialisms.length||Number(b.level===level)-Number(a.level===level));
    const remaining=new Set(ids);
    for(const a of eligible){
      // Choose the combined branch once, rather than merging all alternative
      // governance, architecture or identity packages into one learner path.
      if(!a.specialisms.every(id=>remaining.has(id)))continue;
      const cs=pathComponents(scenario,a);
      for(const id of a.specialisms){
        const components=cs.filter(c=>c.specialism===id);
        matches.get(id).push(...components.map(c=>componentGroup(c,a.level,a)));
        remaining.delete(id);
      }
    }
    for(const id of remaining){const c=scenario.components.find(c=>c.specialism===id&&!c.variantOf);if(c)matches.get(id).push(componentGroup(c,level));}
  };
  const assigned=new Set();
  for(const roleId of profile.roles||[]){const ids=(profile.roleResponsibilities?.[roleId]||[]).filter(id=>matches.has(id));assign(ids,roleId);ids.forEach(id=>assigned.add(id));}
  assign(specialisms.filter(id=>!assigned.has(id)),null);
  for(const [id,groups] of matches)matches.set(id,[...new Map(groups.map(g=>[g.id,g])).values()]);
  return {base,matches};
}

export function groupsReviewStatus(groups) {
  const statuses=[...new Set(groups.map(g=>g.reviewStatus==='AI generated — to be reviewed'?'AI recommendation - to be reviewed':g.reviewStatus).filter(Boolean))];
  return statuses.includes('AI recommendation - to be reviewed')?'AI recommendation - to be reviewed':statuses.every(s=>s==='Reviewed')&&statuses.length?'Reviewed':statuses.join('; ');
}
