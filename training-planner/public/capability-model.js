// Model v2 is an applicability overlay on the versioned source rubric.
// Retired outcome mappings preserve traceability; source level metadata is historical.
export const MODEL_VERSION = 2;
export const MODEL_REVISION = 3;
export const ACTIVITIES = [
  {id:'automated-judges',name:'Use automated judges for evaluation',requirement:'N11.3'},
  {id:'ai-assisted-assurance',name:'Use AI to perform assurance work',requirement:'R6.1.2'}
];
export const RETIRED_OUTCOMES = [{id:'N5.2',replacement:'N5.1',reason:'Deepfakes merged into AI-enabled social engineering and impersonation; reassessed in catalogue v11.'}];
export function effectiveRequirement(r,profile) {
  const activity=ACTIVITIES.find(a=>a.requirement===r.id);
  return activity ? {...r,core:r.core&&(profile?.activities||[]).includes(activity.id)} : r;
}
export const NEED_TITLES = {
  N1:'AI in cyber',N2:'AI systems and agents',N3:'AI limitations',N4:'Responsible AI use',N5:'AI security risks and threats',
  N6:'Working with AI',N7:'Supervising agents',N8:'Reusable instructions and connectors',N9:'Testing your AI tasks',
  N10:'Building agents',N11:'Evaluating agents and AI systems',N12:'Securing AI',N13:'AI governance and risk',N14:'Transforming work and leading adoption',
  'R1.1':'Agent incident response','R1.2':'Agent forensics and evidence','R3.1':'Agent red-teaming','R3.2':'Testing-agent containment',
  'R4.1':'Agent exposure management','R4.2':'AI code-analysis engineering','R5.1':'Agent security architecture','R6.1':'Agent assurance','R9.1':'Agent identity lifecycle'
};
export const LEVELS = [
  {level:0, name:'Foundation — common knowledge', description:'Understand AI and agents, limitations, risks, threats and responsible use. Shared by everyone; not a fourth level.'},
  {level:1, name:'L1 Entry — Work with AI assistance', description:'Perform work primarily yourself, use AI where useful, provide context, check outputs and own the result.'},
  {level:2, name:'L2 Practitioner — Supervise agents', description:'Delegate, monitor, verify, intervene and remain accountable. Adapt task instructions and run checks within approved workflows.'},
  {level:3, name:'L3 Expert — Build and evaluate agents', description:'Design agent behaviour and workflows, configure or code agents, design evaluations and improve reliability. Includes no-code/low-code builders.'}
];
const ids = (prefix, start, end) => Array.from({length:end-start+1}, (_,i)=>`${prefix}.${i+start}`);
export const SPECIALISMS = [
  {id:'agent-engineering', name:'Security architecture & engineering — agent infrastructure', requirements:['N10.3','N10.6','N10.7']},
  {id:'ai-security', name:'AI security design and remediation', requirements:ids('N12',1,8)},
  {id:'ai-governance', name:'AI governance and risk', requirements:ids('N13',1,6)},
  {id:'workflow-transformation', name:'Workflow transformation and adoption', requirements:ids('N14',1,5)},
  {id:'leadership', name:'Leadership and accountability', requirements:[...ids('N14',1,7),'N13.3']},
  {id:'vendor-evaluation', name:'Vendor evaluation and tool selection', requirements:['N11.4','N11.6']},
  {id:'threat-intelligence', name:'Threat intelligence & detection — AI threat landscape', requirements:['N5.7']},
  {id:'incident-response', name:'Agent incident response', requirements:ids('R1.1',1,6)},
  {id:'agent-forensics', name:'Agent forensics and evidence', requirements:ids('R1.2',1,3)},
  {id:'agent-testing', name:'Agent testing and containment', requirements:[...ids('R3.1',1,2),...ids('R3.2',1,5)]},
  {id:'advanced-redteam', name:'Advanced agent red-teaming', requirements:ids('R3.1',3,5)},
  {id:'exposure-management', name:'Agent exposure management', requirements:ids('R4.1',1,6)},
  {id:'code-analysis', name:'AI code-analysis engineering', requirements:ids('R4.2',1,7)},
  {id:'agent-architecture', name:'Agent security architecture', requirements:['N12.9',...ids('R5.1',1,6)]},
  {id:'agent-assurance', name:'Agent assurance', requirements:ids('R6.1',1,2)},
  {id:'identity-operations', name:'Agent identity operations', requirements:ids('R9.1',1,7).filter(id=>id!=='R9.1.2')},
  {id:'identity-integration', name:'Agent identity integration and design', requirements:['R9.1.2',...ids('R9.1',8,10)]}
];
export function sharedLevel(requirement) {
  const {id,need} = requirement;
  if (['N4.7','N5.7','N10.3','N10.6','N10.7'].includes(id)) return id==='N4.7'?2:null;
  if (['N1','N2','N3','N4','N5'].includes(need)) return 0;
  if (need==='N6') return 1;
  if (['N7','N8','N9'].includes(need)) return 2;
  if (['N10','N11'].includes(need)) return 3;
  return null;
}
export function specialismsFor(id) {return SPECIALISMS.filter(s=>s.requirements.includes(id));}
export function requirementPlacement(r) {
  const level=sharedLevel(r), roles=specialismsFor(r.id).map(s=>s.name);
  return [level===null?null:LEVELS[level].name,...roles,r.coreCondition?`Essential: ${r.coreCondition.toLowerCase()}`:null].filter(Boolean).join(' · ');
}
export function profileRequirements(data,profile) {
  const roleIds=new Set(SPECIALISMS.filter(s=>profile.specialisms.includes(s.id)).flatMap(s=>s.requirements));
  return data.requirements.filter(r=>{
    const level=sharedLevel(r);
    return level!==null&&level<=profile.level || roleIds.has(r.id);
  });
}
export function profileLabel(c) {
  if (!c.profile) return 'Previous model · '+(c.rank===0?'Base':['','Entry','Practitioner','Expert'][c.rank]);
  return [LEVELS[c.profile.level].name,...SPECIALISMS.filter(s=>c.profile.specialisms.includes(s.id)).map(s=>s.name)].join(' + ');
}
export function crosswalk(data) {
  return data.requirements.map(r=>({id:r.id,need:r.need,title:r.title,description:r.description,core:r.core,
    component:sharedLevel(r)===null?'Role specialism':sharedLevel(r)===0?'Foundation':'Agentic level',
    agenticLevel:sharedLevel(r),specialisms:specialismsFor(r.id).map(s=>s.id),
    coreCondition:r.coreCondition||null,sourceLevel:r.level,sourceRank:r.rank,source:r.source}));
}
