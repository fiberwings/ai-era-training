import {sharedLevel,SPECIALISMS,NEED_TITLES,CATEGORY_NAMES} from './capability-model.js';
import {ROLE_FAMILIES,ROLE_RESPONSIBILITIES} from './model-explanation.js';

export const CATEGORIES = CATEGORY_NAMES;
export function audienceLabel(value){return ({Base:'Foundation','Base (all)':'Foundation',Entry:'L1 Entry',Practitioner:'L2 Practitioner',Expert:'L3 Expert'})[value]||value;}
export function categoryFor(r){const level=sharedLevel(r);return level===null?'Specialisms':CATEGORIES[level];}
export function groupedOutcomes(data,requirements=data.requirements){
 return CATEGORIES.map((name,index)=>({name,roles:index===4?roleOutcomeGroups(data,requirements):[],needs:data.needs.map(n=>({...n,title:NEED_TITLES[n.id]||n.title,rows:requirements.filter(r=>r.need===n.id&&(index<4?sharedLevel(r)===index:index===4?SPECIALISMS.some(s=>s.requirements.includes(r.id)):false))})).filter(n=>n.rows.length)}));
}
export function responsibilityRoles(id){return ROLE_FAMILIES.filter(r=>(ROLE_RESPONSIBILITIES[r.id]||[]).includes(id));}
export function roleOutcomeGroups(data,requirements=data.requirements){return ROLE_FAMILIES.map(role=>{const packages=ROLE_RESPONSIBILITIES[role.id]||[],ids=new Set(SPECIALISMS.filter(s=>packages.includes(s.id)).flatMap(s=>s.requirements));return {...role,needs:data.needs.map(n=>({...n,title:NEED_TITLES[n.id]||n.title,rows:requirements.filter(r=>r.need===n.id&&ids.has(r.id))})).filter(n=>n.rows.length)};});}
