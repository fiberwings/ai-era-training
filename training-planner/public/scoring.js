import {duration} from './duration.js';
export function scoreFor(courses,id){return Math.max(0,...courses.map(c=>c.scores[id]?.score||0));}
export function coversNeed(course,need,requirements){return requirements.some(r=>r.need===need&&(course.scores[r.id]?.score||0)>0);}
export function measure(reqs,courses,thresholds={strong:.7,partial:.3}){
 const groups={};
 const rows=reqs.map(r=>({...r,score:scoreFor(courses,r.id),assessed:courses.some(c=>Object.hasOwn(c.scores,r.id)),witnesses:courses.filter(c=>c.scores[r.id]?.score===scoreFor(courses,r.id))}));
 for(const r of rows)(groups[r.need]??=[]).push(r);
 const needs=Object.entries(groups).map(([id,rs])=>{const coverage=rs.reduce((a,r)=>a+r.score,0)/(3*rs.length),critical=rs.filter(r=>r.core&&r.score===0).length;return {id,rows:rs,coverage,critical,full:rs.filter(r=>r.score===3).length,band:coverage===1?'Full':coverage>=thresholds.strong&&!critical?'Strong':coverage>=thresholds.partial?'Partial':'Weak'};});
 return {rows,needs,coverage:needs.length?needs.reduce((a,n)=>a+n.coverage,0)/needs.length:0,critical:rows.filter(r=>r.core&&r.score===0).length,full:rows.filter(r=>r.score===3).length};
}
export function gapType(current,best){if(current===3)return 'Complete';if(best<=1)return 'No assessed teaching found';if(best===3)return 'Can be completed through another assessed resource';if(best>current)return 'Can be improved, but needs internal completion';return 'Internal completion needed';}
export function timeTotal(courses,overrides={}){let hours=0,unknown=0;for(const c of new Map(courses.map(c=>[c.id,c])).values()){const d=duration(c,overrides);if(d.hours===null)unknown++;else hours+=d.hours;}return {hours,unknown};}
const levelRank={Base:0,Entry:1,Practitioner:2,Expert:3};
export function eligibility(course,cohort,overrides={}){
 if(cohort.excluded.includes(course.id)) return 'Excluded by planner';
 if(!Object.keys(course.scores).length) return 'Insufficient assessment';
 if(course.evidence==='Not found'||/coming soon/i.test(course.title)||course.review==='Rejected')return 'Unavailable / needs validation';
 if(course.type==='Practice tests'||(/exam/i.test(course.duration)&&!course.duration.includes('+'))||course.type==='Certification')return 'Exam / certification record; select learning separately';
 const specialistFit=cohort.profile&&(cohort.specialistRequirements||[]).some(id=>(course.scores[id]?.score||0)>=2);
 if(cohort.filters.audience && !specialistFit && (levelRank[course.level]===undefined||levelRank[course.level]>cohort.rank))return 'Outside audience filter';
 if(cohort.filters.types.length&&!cohort.filters.types.includes(course.type))return 'Outside resource-type filter';
 if(duration(course,overrides).hours===null)return 'Uncertain duration';
 return null;
}
