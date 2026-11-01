import {NEED_TITLES} from './capability-model.js';

export function outcomePickerGroups(data,{query='',filter='all',scopeIds=[],gapIds=[],selectedIds=[]}={}){
 const scope=new Set(scopeIds),gaps=new Set(gapIds),selected=new Set(selectedIds),words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return data.needs.map(need=>{
  const title=NEED_TITLES[need.id]||need.title,all=data.requirements.filter(r=>r.need===need.id);
  const rows=all.filter(r=>{
   if(filter==='scope'&&!scope.has(r.id)||filter==='gaps'&&!gaps.has(r.id)||filter==='selected'&&!selected.has(r.id))return false;
   const text=[need.id,title,r.id,r.title,r.description].join(' ').toLowerCase();
   return words.every(word=>text.includes(word));
  });
  const count=rows.filter(r=>selected.has(r.id)).length;
  return {id:need.id,title,rows,selectedCount:count,checked:rows.length>0&&count===rows.length,indeterminate:count>0&&count<rows.length};
 }).filter(g=>g.rows.length);
}

export function mountOutcomePicker(root,data,{selectedIds=[],scopeIds=[],gapIds=[],scopeLabel='This component'}={}){
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const selected=new Set(selectedIds);
 let query='',filter=scopeIds.length?'scope':'all';
 root.classList.add('outcome-picker');
 root.innerHTML=`<div class="outcome-picker-controls"><label>Filter outcomes<input type="search" data-outcome-query placeholder="Search need, outcome ID, title or description…"></label><label>Show outcomes<select data-outcome-filter><option value="scope">${esc(scopeLabel)}</option><option value="gaps">Remaining plan gaps</option><option value="all">All outcomes</option><option value="selected">Selected outcomes</option></select></label></div><p class="inline-note">Tick a learning need to select all its shown outcomes. Filters keep your other selections.</p><div class="outcome-picker-actions"><div><button type="button" class="small" data-outcome-action="select">Select shown</button> <button type="button" class="small" data-outcome-action="clear">Clear shown</button></div><span class="outcome-picker-count" role="status" aria-live="polite"></span></div><div class="outcome-picker-list" role="group" aria-label="Learning needs and outcomes"></div>`;
 root.querySelector('[data-outcome-filter]').value=filter;
 const list=root.querySelector('.outcome-picker-list');
 const groups=()=>outcomePickerGroups(data,{query,filter,scopeIds,gapIds,selectedIds:selected});
 function render(resetScroll=false){
  const visible=groups(),rows=visible.flatMap(g=>g.rows),visibleIds=new Set(rows.map(r=>r.id)),hidden=[...selected].filter(id=>!visibleIds.has(id)).length;
  const active=root.ownerDocument.activeElement,focusId=active?.dataset.outcomeId,focusNeed=active?.dataset.outcomeNeed,scrollTop=resetScroll?0:list.scrollTop;
  root.querySelector('.outcome-picker-count').textContent=`${selected.size} selected · ${rows.length} of ${data.requirements.length} shown${hidden?' · '+hidden+' selected outside this filter':''}`;
  for(const button of root.querySelectorAll('[data-outcome-action]'))button.disabled=!rows.length;
  list.innerHTML=visible.map(g=>`<section class="outcome-picker-need" role="group" aria-label="${esc(g.id+' · '+g.title)}"><div class="outcome-picker-need-header"><label class="outcome-choice"><input type="checkbox" data-outcome-need="${esc(g.id)}" aria-label="Select all shown outcomes in ${esc(g.id+' · '+g.title)}" ${g.checked?'checked':''}><strong>${esc(g.id+' · '+g.title)}</strong></label><small>${g.selectedCount}/${g.rows.length} selected</small></div>${g.rows.map(r=>`<label class="outcome-choice outcome-picker-row"><input type="checkbox" data-outcome-id="${esc(r.id)}" aria-label="${esc(r.id+' · '+r.title)}" ${selected.has(r.id)?'checked':''}><span><strong>${esc(r.id+' · '+r.title)}</strong><small>${esc(r.description)}</small></span></label>`).join('')}</section>`).join('')||'<p class="empty">No outcomes match these filters. Try another search or choose All outcomes.</p>';
  for(const input of list.querySelectorAll('[data-outcome-need]'))input.indeterminate=visible.find(g=>g.id===input.dataset.outcomeNeed).indeterminate;
  const focus=focusId?[...list.querySelectorAll('[data-outcome-id]')].find(el=>el.dataset.outcomeId===focusId):focusNeed?[...list.querySelectorAll('[data-outcome-need]')].find(el=>el.dataset.outcomeNeed===focusNeed):null;
  focus?.focus({preventScroll:true});list.scrollTop=scrollTop;
 }
 function setRows(rows,checked){for(const r of rows)if(checked)selected.add(r.id);else selected.delete(r.id);render();}
 root.addEventListener('input',e=>{if(e.target.hasAttribute('data-outcome-query')){query=e.target.value;render(true);}});
 root.addEventListener('change',e=>{
  const el=e.target;
  if(el.hasAttribute('data-outcome-filter')){filter=el.value;render(true);}
  else if(el.hasAttribute('data-outcome-id'))setRows([{id:el.dataset.outcomeId}],el.checked);
  else if(el.hasAttribute('data-outcome-need'))setRows(groups().find(g=>g.id===el.dataset.outcomeNeed)?.rows||[],el.checked);
 });
 root.addEventListener('click',e=>{const button=e.target.closest('[data-outcome-action]');if(button)setRows(groups().flatMap(g=>g.rows),button.dataset.outcomeAction==='select');});
 render();
 return {selectedIds:()=>[...selected]};
}
