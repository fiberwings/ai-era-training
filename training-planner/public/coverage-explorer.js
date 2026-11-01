import {scoreFor} from './scoring.js';
import {NEED_TITLES} from './capability-model.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=v=>(100*v).toFixed(1)+'%';
const natural=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
const statuses=[['zero','No coverage','No teaching planned'],['partial','Partial coverage','More teaching needed'],['internal','Internal-dependent','Fully planned; relies on internal work'],['covered','Catalogue-covered','Selected course evidence at 3/3']];

export function coveragePriority(r){
 if(r.plannedScore<3)return r.core?(r.plannedScore===0?0:1):2;
 return r.status==='internal'?3:4;
}

// Presentation only: use the existing assessed and planned scores without
// changing weighting, must-have applicability or internal-training credit.
export function coverageRecords(metrics,items,catalogue,categories={}){
 const planned=new Map(metrics.planned.rows.map(r=>[r.id,r.score]));
 return [...new Map(metrics.rows.map(r=>[r.id,r])).values()].map(r=>{
  const linked=items.filter(i=>i.requirements.includes(r.id)),plannedScore=planned.get(r.id)??r.score;
  const status=plannedScore===0?'zero':plannedScore<3?'partial':r.score===3?'covered':'internal';
  return {...r,plannedScore,status,ceiling:scoreFor(catalogue,r.id),categories:categories[r.id]||[],items:linked};
 });
}

export function filterCoverage(rows,state){
 const words=(state.query||'').toLowerCase().trim().split(/\s+/).filter(Boolean);
 return rows.filter(r=>{
  const text=[r.id,r.title,r.description,r.need,NEED_TITLES[r.need],...r.categories,...r.items.flatMap(i=>[i.title,i.owner,i.outcomes])].join(' ').toLowerCase();
  const status=state.status||'all';
  return words.every(w=>text.includes(w))&&(!state.category||r.categories.includes(state.category))&&
   (state.importance!=='must'||r.core)&&(state.importance!=='other'||!r.core)&&
   (status==='all'||r.status===status||status==='incomplete'&&r.plannedScore<3||status==='must'&&r.core&&r.plannedScore===0||status==='essential'&&r.core&&r.plannedScore<3||status==='limited'&&r.plannedScore<3&&r.ceiling<3||status==='unlinked'&&r.plannedScore<3&&!r.items.length);
 });
}

export function sortCoverage(rows,sort='priority'){
 return [...rows].sort((a,b)=>{
  if(sort==='id')return natural(a.id,b.id);
  if(sort==='coverage')return a.plannedScore-b.plannedScore||coveragePriority(a)-coveragePriority(b)||natural(a.id,b.id);
  return coveragePriority(a)-coveragePriority(b)||a.plannedScore-b.plannedScore||natural(a.id,b.id);
 });
}

export function coverageCounts(rows){
 const counts={zero:0,partial:0,internal:0,covered:0,must:0,essential:0,limited:0};
 for(const r of rows){counts[r.status]++;if(r.core&&r.plannedScore===0)counts.must++;if(r.core&&r.plannedScore<3)counts.essential++;if(r.plannedScore<3&&r.ceiling<3)counts.limited++;}
 return counts;
}

export function coverageNeeds(rows,sort='priority'){
 const groups=new Map();for(const r of rows){if(!groups.has(r.need))groups.set(r.need,[]);groups.get(r.need).push(r);}
 return [...groups].map(([id,rs])=>({id,rows:rs,counts:coverageCounts(rs),coverage:rs.reduce((n,r)=>n+r.plannedScore,0)/(3*rs.length)})).sort((a,b)=>{
  if(sort==='id')return natural(a.id,b.id);
  if(sort==='coverage')return a.coverage-b.coverage||natural(a.id,b.id);
  return b.counts.must-a.counts.must||b.counts.essential-a.counts.essential||(b.counts.zero+b.counts.partial)-(a.counts.zero+a.counts.partial)||b.counts.internal-a.counts.internal||natural(a.id,b.id);
 });
}

export function createCoverageState(){return {query:'',status:'all',importance:'all',category:'',sort:'priority',need:'',expanded:new Set()};}

export function mountCoverageExplorer(root,{metrics,items,catalogue,needs,categories={},state,renderDetail}){
 const rows=coverageRecords(metrics,items,catalogue,categories),totals=coverageCounts(rows);
 const options=(values,value)=>values.map(([id,label])=>`<option value="${esc(id)}" ${id===value?'selected':''}>${esc(label)}</option>`).join('');
 const statusOptions=[['all','All outcomes'],['incomplete','Remaining plan gaps'],['must','Must-have gaps at zero'],['essential','All incomplete must-haves'],...statuses.map(([id,label])=>[id,label]),['limited','Catalogue cannot fully close'],['unlinked','Incomplete, no internal work']];
 const cats=[...new Set(rows.flatMap(r=>r.categories))];
 root.innerHTML=`<div class="coverage-dashboard">
  <div class="coverage-headline"><span><strong>${rows.length?pct(metrics.planned.coverage):'Not assessed'}</strong> planned · ${rows.length?pct(metrics.coverage):'Not assessed'} assessed</span><span>${rows.length} unique outcomes · ${metrics.needs.length} learning needs</span></div>
  <div class="coverage-tiles">${statuses.map(([id,label,hint])=>`<button type="button" class="coverage-tile status-${id}" data-coverage-status="${id}" aria-pressed="${state.status===id}"><strong>${totals[id]}</strong><span>${label}</span><small>${hint}</small></button>`).join('')}</div>
  <div class="coverage-attention"><strong>Start with the essentials</strong><button type="button" data-coverage-status="must">${totals.must} must-have gaps at zero →</button><button type="button" data-coverage-status="essential">${totals.essential} incomplete must-haves →</button><button type="button" data-coverage-status="limited">${totals.limited} gaps the catalogue cannot fully close →</button></div>
  <p class="inline-note">Counts above cover the whole selected scope and count each outcome once. Internal-dependent outcomes are fully planned, but still rely on internal delivery; they are not assessed course coverage.</p>
  <div class="coverage-toolbar">
   <label class="coverage-search">Search outcomes or internal work<input data-coverage-field="query" type="search" value="${esc(state.query)}" placeholder="Need, outcome, description, owner…"></label>
   <label>Show<select data-coverage-field="status">${options(statusOptions,state.status)}</select></label>
   <label>Importance<select data-coverage-field="importance">${options([['all','All importance'],['must','Must-have'],['other','Other applicable']],state.importance)}</select></label>
   ${cats.length>1?`<label>Category<select data-coverage-field="category">${options([['','All categories'],...cats.map(c=>[c,c])],state.category)}</select></label>`:''}
   <label>Sort needs & outcomes<select data-coverage-field="sort">${options([['priority','Priority first'],['coverage','Lowest coverage'],['id','Need / outcome ID']],state.sort)}</select></label>
   <button type="button" class="small" data-coverage-reset>Reset view</button>
  </div>
  <p class="inline-note coverage-sort-note"></p>
  <div class="coverage-results"></div>
 </div>`;
 function resultView(){
  const matches=filterCoverage(rows,state),groups=coverageNeeds(matches,state.sort);
  if(state.need!=='all'&&!groups.some(n=>n.id===state.need))state.need=groups[0]?.id||'';
  const selected=state.need==='all'?matches:matches.filter(r=>r.need===state.need),shown=sortCoverage(selected,state.sort);
  const allNeeds=new Map(coverageNeeds(rows).map(n=>[n.id,n]));
  const current=needs.find(n=>n.id===state.need);
  const label=state.need==='all'?'All matching outcomes':NEED_TITLES[state.need]||current?.title||'Outcomes';
  root.querySelector('.coverage-sort-note').textContent=state.sort==='priority'?'Priority order: must-have at zero → partially covered must-have → other gaps → internal-dependent → catalogue-covered. Needs are ranked by matching gap counts; need totals remain unfiltered.':state.sort==='coverage'?'Lowest planned coverage first. Need percentages always describe the complete need; filters only narrow the outcomes shown.':'Learning needs and outcomes are ordered by their identifiers.';
  root.querySelector('.coverage-results').innerHTML=`<div class="coverage-result-count" role="status">${matches.length} of ${rows.length} outcomes match · ${groups.length} needs · ${shown.length} shown${state.need&&state.need!=='all'?' in '+esc(state.need):''}</div>${!rows.length?'<div class="empty">No assessed outcomes in this scope. Tooling metadata and task fit do not provide assessment scores.</div>':!matches.length?'<div class="empty">No outcomes match these filters. Reset the view or broaden your search.</div>':`<div class="coverage-workbench">
   <nav class="coverage-needs" aria-label="Learning needs"><h2>Where to focus</h2><button type="button" class="coverage-need" data-coverage-need="all" aria-pressed="${state.need==='all'}"><strong>All matching outcomes</strong><small>${matches.length} outcomes across ${groups.length} needs</small></button>${groups.map(n=>{const full=allNeeds.get(n.id),c=full.counts,band=metrics.planned.needs.find(x=>x.id===n.id)?.band;return `<button type="button" class="coverage-need" data-coverage-need="${esc(n.id)}" aria-pressed="${state.need===n.id}"><span class="coverage-need-title"><strong>${esc(n.id+' · '+(NEED_TITLES[n.id]||needs.find(x=>x.id===n.id)?.title||n.id))}</strong><b>${pct(full.coverage)}<small>${esc(band)}</small></b></span><span class="coverage-stack" aria-hidden="true">${statuses.map(([id])=>`<span class="status-${id}" style="width:${100*c[id]/full.rows.length}%"></span>`).join('')}</span><small>${c.zero+c.partial} gaps · ${c.essential} must-have${c.must?' ('+c.must+' at zero)':''}<br>${c.covered} catalogue-covered · ${c.internal} internal-dependent${n.rows.length!==full.rows.length?'<br>'+n.rows.length+' of '+full.rows.length+' match filters':''}</small></button>`;}).join('')}</nav>
   <section class="coverage-outcomes" aria-label="Outcome review"><div class="coverage-outcomes-heading"><div><h2>${esc(label)}</h2><small>${shown.length} outcomes · expand an outcome for evidence and actions</small></div><div class="actions"><button type="button" class="small" data-coverage-expand="yes">Expand shown</button><button type="button" class="small" data-coverage-expand="no">Collapse shown</button></div></div>${current?`<p class="inline-note">${esc(current.description)}</p>`:''}
   ${shown.map(r=>`<details class="coverage-outcome" data-coverage-outcome="${esc(r.id)}" ${state.expanded.has(r.id)?'open':''}><summary><span class="coverage-outcome-heading"><span><span class="mono">${esc(r.id)}</span> ${r.core?'<span class="pill '+(r.plannedScore<3?'amber':'')+'">Must-have'+(r.plannedScore===0?' · at zero':'')+'</span>':''} <span class="pill status-${r.status}">${statuses.find(([id])=>id===r.status)[1]}</span></span><strong>${esc(r.title)}</strong><small>Planned ${r.plannedScore}/3 · Assessed ${r.score}/3 · Catalogue ceiling ${r.ceiling}/3${r.categories.length?' · '+esc(r.categories.join(' / ')):''}</small><small class="coverage-next">${r.plannedScore<3?(r.ceiling===3?'Next: explore assessed courses':r.ceiling>r.score?'Next: compare courses and plan internal completion':'Next: plan internal completion or review further evidence'):r.status==='internal'?'Next: confirm internal delivery · '+r.items.filter(i=>i.status!=='Ready').length+' linked items to develop':'Full selected course evidence; review details as needed'}</small></span></summary><div class="coverage-evidence" data-coverage-detail="${esc(r.id)}"></div></details>`).join('')}
   </section></div>`}`;
  for(const detail of root.querySelectorAll('[data-coverage-outcome]')){
   const fill=()=>{const body=detail.querySelector('[data-coverage-detail]');if(!body.childElementCount)body.innerHTML=renderDetail(rows.find(r=>r.id===detail.dataset.coverageOutcome));};
   if(detail.open)fill();
   detail.addEventListener('toggle',()=>{if(detail.open){state.expanded.add(detail.dataset.coverageOutcome);fill();}else state.expanded.delete(detail.dataset.coverageOutcome);});
  }
  for(const tile of root.querySelectorAll('[data-coverage-status]'))tile.setAttribute('aria-pressed',String(tile.dataset.coverageStatus===state.status));
 }
 root.addEventListener('input',e=>{if(e.target.dataset.coverageField==='query'){state.query=e.target.value;resultView();}});
 root.addEventListener('change',e=>{const key=e.target.dataset.coverageField;if(!key||key==='query')return;state[key]=e.target.value;resultView();});
 root.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-coverage-status')){state.status=state.status===b.dataset.coverageStatus?'all':b.dataset.coverageStatus;state.query='';state.category='';state.importance='all';state.need='';for(const field of root.querySelectorAll('[data-coverage-field]'))field.value=state[field.dataset.coverageField];resultView();}
  if(b.hasAttribute('data-coverage-need')){state.need=b.dataset.coverageNeed;resultView();root.querySelector(`[data-coverage-need="${state.need}"]`)?.focus({preventScroll:true});const heading=root.querySelector('.coverage-outcomes-heading');if(heading&&heading.getBoundingClientRect().top<0)heading.scrollIntoView({block:'start'});}
  if(b.hasAttribute('data-coverage-reset')){Object.assign(state,createCoverageState());for(const field of root.querySelectorAll('[data-coverage-field]'))field.value=state[field.dataset.coverageField];resultView();}
  if(b.hasAttribute('data-coverage-expand'))for(const detail of root.querySelectorAll('[data-coverage-outcome]'))detail.open=b.dataset.coverageExpand==='yes';
 });
 resultView();
}
