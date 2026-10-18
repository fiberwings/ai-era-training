import {scoreFor,eligibility,measure} from './scoring.js';
import {duration} from './duration.js';
export function prepareProblem(data,cohort,reqs,inherited,overrides){
 const inheritedIds=new Set(inherited.map(c=>c.id));
 const pins=cohort.pinned.filter(id=>!inheritedIds.has(id));
 const candidates=data.courses.filter(c=>!inheritedIds.has(c.id)&&(pins.includes(c.id)||!eligibility(c,cohort,overrides))).filter(c=>pins.includes(c.id)||reqs.some(r=>(c.scores[r.id]?.score||0)>scoreFor(inherited,r.id))).map(c=>({...c,hours:duration(c,overrides).hours}));
 if(pins.some(id=>!candidates.find(c=>c.id===id)))throw Error('A pinned course is unresolved. Review it before recommending.');
 if(candidates.some(c=>pins.includes(c.id)&&c.hours===null))throw Error('Enter a duration estimate for pinned courses before recommending.');
 if(candidates.filter(c=>pins.includes(c.id)).reduce((a,c)=>a+c.hours,0)>cohort.budget+1e-8)throw Error('Pinned courses exceed this layer’s budget. Increase the budget or unpin a course.');
 const counts={};for(const r of reqs)counts[r.need]=(counts[r.need]||0)+1;
 const needs=Object.keys(counts).length;
 const gains=[];
 for(const r of reqs)for(let t=scoreFor(inherited,r.id)+1;t<=3;t++){
  const covering=candidates.flatMap((c,j)=>(c.scores[r.id]?.score||0)>=t?[j]:[]);
  if(covering.length)gains.push({name:'y'+gains.length,weight:100/(needs*3*counts[r.need]),covering});
 }
 return {candidates,pins,gains,budget:cohort.budget,reqs,inherited};
}
const expression=terms=>terms.length?terms.map(([v,n])=>`${v<0?'-':'+'} ${Math.abs(v).toPrecision(14)} ${n}`).join(' '):'0 x0';
export function makeLP(p,phase='coverage',limits={}){
 const vars=p.candidates.map((_,i)=>'x'+i),binary=[...vars,...p.gains.map(g=>g.name)];
 const objectives={coverage:p.gains.map(g=>[g.weight,g.name]),hours:p.candidates.map((c,i)=>[c.hours,vars[i]]),count:vars.map(n=>[1,n])};
 const lines=[phase==='coverage'?'Maximize':'Minimize',' obj: '+expression(objectives[phase]),'Subject To',' budget: '+expression(objectives.hours)+' <= '+p.budget];
 p.gains.forEach((g,i)=>lines.push(` cov${i}: ${expression([[1,g.name],...g.covering.map(j=>[-1,vars[j]])])} <= 0`));
 p.candidates.forEach((c,i)=>{if(p.pins.includes(c.id))lines.push(` pin${i}: ${vars[i]} = 1`);});
 if(limits.coverage!==undefined)lines.push(' keepCoverage: '+expression(objectives.coverage)+' >= '+Math.max(0,limits.coverage-1e-7));
 if(limits.hours!==undefined)lines.push(' keepHours: '+expression(objectives.hours)+' <= '+(limits.hours+1e-7));
 lines.push('Bounds',...binary.map(n=>` 0 <= ${n} <= 1`),'Binary',...binary,'End');return lines.join('\n');
}
export function solutionIds(p,result){return p.candidates.filter((c,i)=>(result.Columns?.['x'+i]?.Primal??0)>.5).map(c=>c.id);}
export function coverageGain(p,ids){const chosen=p.candidates.filter(c=>ids.includes(c.id));return (measure(p.reqs,[...p.inherited,...chosen]).coverage-measure(p.reqs,p.inherited).coverage)*100;}
export function solveProblem(highs,p,seconds=15){
 if(!p.candidates.length)return {ids:[],status:'Optimal',optimal:true,message:'No eligible resource improves the current coverage.',gap:null};
 const start=performance.now(),remaining=()=>Math.max(.01,seconds-(performance.now()-start)/1000);
 let r=highs.solve(makeLP(p),{time_limit:remaining(),mip_rel_gap:0}),ids=solutionIds(p,r);
 const optimal=r.Status==='Optimal';
 // A time-limited solve may not have a feasible incumbent. Never present an empty invalid plan.
 const feasible=ids.every(id=>p.candidates.some(c=>c.id===id))&&p.pins.every(id=>ids.includes(id))&&p.candidates.filter(c=>ids.includes(c.id)).reduce((a,c)=>a+c.hours,0)<=p.budget+1e-6;
 if(!['Optimal','Time limit reached','Time limit'].includes(r.Status)||!feasible)throw Error('Solver returned '+r.Status+'. No recommendation applied.');
 const gain=coverageGain(p,ids);let hours=p.candidates.filter(c=>ids.includes(c.id)).reduce((a,c)=>a+c.hours,0),tieComplete=false;
 if(optimal&&remaining()>.1){const h=highs.solve(makeLP(p,'hours',{coverage:gain}),{time_limit:remaining(),mip_rel_gap:0});if(h.Status==='Optimal'){ids=solutionIds(p,h);hours=p.candidates.filter(c=>ids.includes(c.id)).reduce((a,c)=>a+c.hours,0);if(remaining()>.1){const n=highs.solve(makeLP(p,'count',{coverage:gain,hours}),{time_limit:remaining(),mip_rel_gap:0});if(n.Status==='Optimal'){ids=solutionIds(p,n);tieComplete=true;}}}}
 return {ids,status:r.Status,optimal,tieComplete,gap:r.MipGap??r.Info?.mip_gap??null,message:optimal?'Optimal coverage within these constraints'+(tieComplete?'; ties resolved by hours, then course count.':'; tie-breaking incomplete.'):'Best feasible result; optimality not proven.'};
}
