// A workbook row represents one item's assignment to one component in one plan.
// Copies can retain an item ID while their briefs evolve independently.
export const PROPOSED_SHEET = 'Proposed training';
export const PROPOSED_HEADERS = ['Title','Owner','Learner hours','Delivery status','Teaching and practice','Linked outcome IDs','Linked outcome details','Component','Category','Level','Specialism ID','Tool','Tool tasks','Scenario','Scenario status','Internal item ID','Component ID','Scenario ID'];
export function proposedRows(s,data){
 const requirements=new Map(data.requirements.map(r=>[r.id,r]));
 return s.components.flatMap(c=>c.internal.map(i=>[i.title,i.owner,i.hours,i.status,i.outcomes,i.requirements.join('\n'),i.requirements.map(id=>{const r=requirements.get(id);return r?id+' · '+r.title+'\n'+r.description:id+' · Unresolved outcome';}).join('\n\n'),c.name,c.category,Number.isInteger(c.level)?c.level:null,c.specialism||'',c.tool||'',(c.tasks||[]).join('\n'),s.name,s.status,i.id,c.id,s.id]));
}
export function proposedKey(row){return JSON.stringify([row[17],row[16],row[15]]);}
export function validateProposedRows(rows){
 const seen=new Set();
 for(const row of rows){
  if(row.length!==PROPOSED_HEADERS.length||row.some((v,i)=>![2,9].includes(i)&&typeof v!=='string'))throw Error('Proposed training has missing or invalid columns.');
  if(!row[0].trim()||![15,16,17].every(i=>row[i].trim()))throw Error('Each proposed item needs a title and its original item, component and scenario IDs.');
  if(!['Proposed','In development','Ready'].includes(row[3])||!['Draft','Reviewed','Finalised'].includes(row[14]))throw Error('Proposed training contains an invalid delivery or scenario status.');
  if(!(row[2]===null||Number.isFinite(row[2])&&row[2]>=0)||!(row[9]===null||Number.isInteger(row[9])&&row[9]>=0&&row[9]<=3))throw Error('Proposed training has invalid hours or level. Leave unknown hours blank.');
  const key=proposedKey(row);if(seen.has(key))throw Error('Duplicate proposed-training assignment: '+row[0]);seen.add(key);
 }
 return rows;
}
export function mergeProposedRows(existing,incoming){
 validateProposedRows(existing);validateProposedRows(incoming);
 const rows=new Map(existing.map(row=>[proposedKey(row),row]));
 for(const row of incoming)rows.set(proposedKey(row),row);
 return [...rows.values()];
}
export function proposedItem(row){
 validateProposedRows([row]);
 return {id:row[15],title:row[0],owner:row[1],hours:row[2],status:row[3],outcomes:row[4],requirements:[...new Set(row[5].split(/\r?\n/).map(x=>x.trim()).filter(Boolean))]};
}
// Keep workbook assignment indices so independently edited versions remain selectable.
export function catalogueProposals(data,query='',outcomeId=''){
 const terms=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 return (data.proposedTraining?.rows||[]).map((row,index)=>({row,index,item:proposedItem(row)})).filter(({row,item})=>{
  const text=row.join(' ').toLocaleLowerCase();
  return (!outcomeId||item.requirements.includes(outcomeId))&&terms.every(term=>text.includes(term));
 });
}
export function importProposedItem(s,componentId,row,replace=false){
 const c=s.components.find(c=>c.id===componentId);if(!c)throw Error('Choose a destination component.');
 const item=proposedItem(row);if(!item.requirements.length&&c.category!=='Tooling')throw Error('Link at least one outcome before adding this item to a learning component.');const existing=c.internal.find(i=>i.id===item.id);
 if(existing){
  if(JSON.stringify(existing)!==JSON.stringify(item)&&!replace)throw Error('This component already has a different version of '+item.title+'. Edit or remove that item before importing its replacement.');
  if(replace)c.internal=c.internal.map(i=>i.id===item.id?item:i);
  return false;
 }
 c.internal.push(item);return true;
}
