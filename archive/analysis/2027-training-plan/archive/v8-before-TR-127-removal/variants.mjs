import {readFile,writeFile} from 'node:fs/promises';
import {scope,selectedIds,cumulativeScope,ancestors} from '../../training-planner/public/cohorts.js';
import {measure,timeTotal} from '../../training-planner/public/scoring.js';
const d=JSON.parse(await readFile('training-planner/public/data/catalogue.json'));
const by=new Map(d.courses.map(c=>[c.id,c]));
const variants=[];
async function variant(name,file,cohort,change,extra={}){
 const s=JSON.parse(await readFile('analysis/2027-training-plan/'+file+'.json'));const c=s.cohorts.find(c=>c.id===cohort);
 change(c,s);const cs=selectedIds(s,c).map(i=>by.get(i)),m=measure(scope(d,c),cs,d.thresholds),cum=measure(cumulativeScope(d,s,c),cs,d.thresholds);
 variants.push({name,cohort,selected:c.selected,coverage:m.coverage,cumulativeCoverage:cum.coverage,critical:m.critical,cumulativeCritical:cum.critical,course:timeTotal(c.selected.map(i=>by.get(i)),s.overrides),cumulativeCourse:timeTotal(cs,s.overrides),internal:[...ancestors(s,c),c].flatMap(c=>c.internal).reduce((s,i)=>s+i.hours,0),needs:m.needs.map(n=>({id:n.id,coverage:n.coverage})),...extra});
}
await variant('Option 3B: SecAI+ Practitioner credential extension','option-3','practitioner',c=>c.selected.push('TR-155'),{revisionHoursEstimate:6,examHoursCatalogue:1,note:'Raise Practitioner course budget to 14h. Six revision hours are a starting estimate, not a pass guarantee. Confirm exam duration at booking.'});
await variant('Option 3B: GAIPS technical specialisation','option-3','technical',c=>c.selected=['TR-001','TR-063'],{revisionHoursEstimate:8,examHoursVerified:2,note:'Replaces 11h technical core with 32h. Raise course budget to 32h. Internal capstone remains 12h. Revision may need more time; current exam is 2h.'});
await variant('Option 4: Non-coding Practitioner adaptation','option-4','practitioner',c=>{c.selected=['TR-129'];c.internal[0].hours=9;},{note:'Remove TR-100 rather than claiming full-course credit for a demo. Add 3h assisted no-code evaluation-harness practice; no assessed credit until internally evidenced.'});
await variant('Option 4: Provisional organisational-design course removed','option-4','technical',c=>c.selected=c.selected.filter(i=>i!=='INT-2478'),{note:'Shows consequence if Q1 pilot rejects INT-2478; internal replacement does not retain its scores.'});
await writeFile('analysis/2027-training-plan/variants.json',JSON.stringify(variants,null,2));console.log(JSON.stringify(variants,null,2));
