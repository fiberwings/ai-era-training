import {profileRequirements,specialismsFor} from './capability-model.js';
const layer=(id,name,budget,parent,level,specialisms=[],extra={})=>({id,name,budget,parent,rank:level,
  profile:{level,specialisms,tools:[]},needs:[],selected:[],pinned:[],excluded:[],internal:[],rationale:'',
  removedRequirements:[],addedRequirements:[],filters:{audience:true,types:[]},...extra});
export function initialCohorts(){return [
  layer('all','Foundation — common knowledge',2,null,0,[],{group:'Shared learning',note:'Common knowledge for everyone. The former combined 4h Foundation / Entry budget is provisionally split 2h + 2h; adjust to actual needs.'}),
  layer('entry','L1 Entry — Work with AI assistance',2,'all',1,[],{group:'Shared learning',note:'Primarily do the work yourself, with AI assistance. Practical use adds to the shared foundation.'}),
  layer('practitioner','L2 Practitioner — Supervise agents',8,'entry',2,[],{group:'Shared learning',note:'Supervise existing agents, adapt reusable task instructions and run task checks. Operational permission is a separate decision.'}),
  layer('technical','L3 Expert — Build and evaluate agents',24,'practitioner',3,[],{group:'Shared learning',note:'Design and evaluate agents, including no-code/low-code builds. Select infrastructure or security-design learning within Security architecture & engineering when the responsibility requires it.'}),
  layer('governance','GRC — agent supervision',4,'practitioner',2,['ai-governance'],{group:'Governance & leadership'}),
  layer('grc-builder','GRC — agent building',4,'technical',3,['ai-governance'],{group:'Governance & leadership'}),
  layer('leadership','Leadership — AI-assisted work',4,'entry',1,['leadership','vendor-evaluation'],{group:'Governance & leadership',note:'Leadership responsibilities do not imply L3. Change the agentic level to match how this cohort actually works.'}),
  layer('cdc','Agent incident response',4,'practitioner',2,['incident-response'],{group:'Cyber Defence Centre'}),
  layer('forensics','Agent forensics and investigation',4,'practitioner',2,['incident-response','agent-forensics'],{group:'Cyber Defence Centre'}),
  layer('threat-intelligence','Threat intelligence & detection — AI threat landscape',4,'practitioner',2,['threat-intelligence'],{group:'Cyber Defence Centre'}),
  layer('idp','DLP, classification & AI risk',4,'practitioner',2,['ai-governance'],{group:'Information Data Protection',note:'Apply shared supervision skills to DLP and classification; retain only governance outcomes required by the actual job.'}),
  layer('biso','Governance & assurance',4,'practitioner',2,['ai-governance','agent-assurance'],{group:'BISO'}),
  layer('testing','Agent testing and containment',4,'practitioner',2,['agent-testing'],{group:'Application Security'}),
  layer('redteam','Advanced agent red-teaming',4,'practitioner',2,['agent-testing','advanced-redteam'],{group:'Application Security',note:'Advanced testing expertise is a role responsibility, not an automatic agent-builder classification.'}),
  layer('exposure','Agent exposure management',4,'practitioner',2,['exposure-management'],{group:'Application Security'}),
  layer('harness','AI code-analysis engineering',4,'technical',3,['code-analysis'],{group:'Application Security'}),
  layer('architecture','Agent security architecture',4,'technical',3,['ai-security','agent-architecture'],{group:'Application Security'}),
  layer('engineering','Security architecture & engineering — agent infrastructure',4,'technical',3,['agent-engineering'],{group:'Security architecture & engineering'}),
  layer('security','AI security design and remediation',4,'practitioner',2,['ai-security'],{group:'Engineering & transformation'}),
  layer('transformation','Workflow transformation and adoption',4,'practitioner',2,['workflow-transformation'],{group:'Engineering & transformation'}),
  layer('iam','Agent identity operations — AI-assisted work',4,'entry',1,['identity-operations'],{group:'Identity & Access Management'}),
  layer('iam-integration','Agent identity integration and design',4,'entry',1,['identity-operations','identity-integration'],{group:'Identity & Access Management',note:'Design and integration depth is independent of agentic level. This preset assumes the person performs the work with AI assistance.'}),
  layer('cio','Strategy & tool selection',4,'entry',1,['leadership','vendor-evaluation'],{group:'CIO'})
];}
// Full target profile, before removing outcomes addressed by inherited cohorts.
export function targetScope(data,c) {
  if(c.profile){
    const active=new Set(profileRequirements(data,c.profile).map(r=>r.id));
    return data.requirements.filter(r=>!c.removedRequirements.includes(r.id)&&(active.has(r.id)||c.addedRequirements.includes(r.id)));
  }
  // Version-one scenarios retain their original scope; never infer a v2 profile.
  return data.requirements.filter(r=>{
    if(c.removedRequirements.includes(r.id)) return false;
    if(c.addedRequirements.includes(r.id)) return true;
    if(r.rank>c.rank) return false;
    if(r.level.includes('architects')&&!c.architect) return false;
    if(r.level==='Leaders'&&!c.leaders) return false;
    return c.needs.includes(r.need)||(c.lateNeeds||[]).includes(r.need)&&r.rank===c.rank;
  });
}
export function scope(data,c,s) {
  const full=targetScope(data,c);
  if(!c.profile||!s)return full;
  const inherited=new Set(ancestors(s,c).flatMap(a=>targetScope(data,a)).map(r=>r.id));
  return full.filter(r=>!inherited.has(r.id));
}
export function ancestors(s,c){const out=[],seen=new Set([c.id]);while(c.parent){c=s.cohorts.find(x=>x.id===c.parent);if(!c||seen.has(c.id))throw Error('Invalid cohort inheritance');seen.add(c.id);out.unshift(c);}return out;}
export function selectedIds(s,c,includeSelf=true){return [...new Set([...ancestors(s,c),...(includeSelf?[c]:[])].flatMap(x=>x.selected))];}
export function cumulativeScope(data,s,c){return [...new Map([...ancestors(s,c),c].flatMap(x=>scope(data,x,s)).map(r=>[r.id,r])).values()];}
export function syncNeeds(data,s){for(const c of s.cohorts)if(c.profile)c.needs=[...new Set(scope(data,c,s).map(r=>r.need))];return s;}
export function recommendationCohort(data,s,c){
  // A source course's historic level must not block specialist teaching.
  return {...c,specialistRequirements:c.profile?scope(data,c,s).filter(r=>specialismsFor(r.id).some(role=>c.profile.specialisms.includes(role.id))||c.addedRequirements.includes(r.id)).map(r=>r.id):[]};
}
export function invalidateRecommendations(s,c){
  for(const item of s.cohorts)if(item.id===c.id||ancestors(s,item).some(a=>a.id===c.id)){
    delete item.recommendation;
    if(item.profile)item.needsReview=true;
  }
}
