import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PROPOSED_HEADERS,proposedRows,proposedKey,mergeProposedRows,proposedItem,importProposedItem,validateProposedRows,catalogueProposals} from '../public/proposed-training.js';
import {pathMetrics} from '../public/components.js';
const data=JSON.parse(readFileSync(new URL('../public/data/catalogue.json',import.meta.url)));
const starter=JSON.parse(readFileSync(new URL('../public/data/component-starter.json',import.meta.url)));
const make=()=>structuredClone(starter),component=(s,id)=>s.components.find(c=>c.id===id);
const item={id:'shared-id',title:'Practice = test & review',owner:'Owner\nSecond line',hours:null,status:'Proposed',outcomes:'First line\nSecond line <practice> "quotes"',requirements:['N1.1','N2.1']};
test('all internal item details and their component/plan provenance survive row roundtrip',()=>{
 const s=make();component(s,'foundation').internal=[structuredClone(item)];
 const [row]=proposedRows(s,data);assert.equal(row.length,PROPOSED_HEADERS.length);
 assert.deepEqual(proposedItem(row),item);assert.match(row[6],/N1.1/);assert.match(row[6],/N2.1/);
 assert.equal(row[7],'Foundation');assert.equal(row[16],'foundation');assert.equal(row[17],s.id);
 row[2]=0;assert.equal(proposedItem(row).hours,0);
 for(const status of ['Proposed','In development','Ready']){row[3]=status;assert.equal(proposedItem(row).status,status);}
});
test('upsert updates only the same plan/component/item, retaining variants and other plans',()=>{
 const s=make();component(s,'foundation').internal=[structuredClone(item)];component(s,'l1').internal=[{...structuredClone(item),title:'L1 variant'}];
 const existing=proposedRows(s,data),other=structuredClone(existing[0]);other[17]='another-plan';
 const changed=structuredClone(existing[0]);changed[0]='Revised';
 const result=mergeProposedRows([...existing,other],[changed]);assert.equal(result.length,3);
 assert.equal(result.find(r=>proposedKey(r)===proposedKey(changed))[0],'Revised');
 assert.equal(result.find(r=>r[16]==='l1')[0],'L1 variant');assert.equal(result.find(r=>r[17]==='another-plan')[0],item.title);
 assert.deepEqual(mergeProposedRows(result,[changed]),result);
 assert.deepEqual(mergeProposedRows(result,[]),result);
 assert.throws(()=>mergeProposedRows([changed,changed],[]),/Duplicate/);
});
test('reusing a saved item preserves scope, coverage/time deduplication and assessed scores',()=>{
 const source=make();component(source,'foundation').internal=[{...structuredClone(item),hours:2}];const [row]=proposedRows(source,data);
 const s=make(),f=component(s,'foundation'),l1=component(s,'l1'),before=pathMetrics(data,s,l1);
 assert.equal(importProposedItem(s,f.id,row),true);assert.equal(importProposedItem(s,f.id,row),false);
 const after=pathMetrics(data,s,l1);assert.ok(after.planned.coverage>before.planned.coverage);assert.equal(after.coverage,before.coverage);assert.equal(after.total.hours,2);
 assert.equal(l1.internal.length,0);assert.equal(importProposedItem(s,l1.id,row),true);assert.equal(pathMetrics(data,s,l1).total.hours,2);
 const changed=structuredClone(row);changed[0]='Edited in Excel';assert.throws(()=>importProposedItem(s,l1.id,changed),/different version/);
 importProposedItem(s,l1.id,changed,true);assert.equal(l1.internal.length,1);assert.equal(l1.internal[0].title,'Edited in Excel');assert.equal(f.internal[0].title,item.title);
});
test('invalid hours, statuses, duplicate assignments and missing IDs are rejected',()=>{
 const s=make();component(s,'foundation').internal=[structuredClone(item)];const [valid]=proposedRows(s,data);
 for(const [index,value] of [[2,-1],[2,'Unknown'],[3,'Done'],[9,4],[15,''],[16,''],[17,'']]){const row=structuredClone(valid);row[index]=value;assert.throws(()=>validateProposedRows([row]));}
 assert.deepEqual(proposedRows(make(),data),[]);
});
test('tool proposals retain product/task context and can have no linked outcomes',()=>{
 const s=make(),tool={...structuredClone(component(s,'foundation')),id:'tool',name:'Tool practice',category:'Tooling',level:undefined,tool:'Approved product',tasks:['use','supervise'],internal:[{...structuredClone(item),requirements:[],hours:1}]};s.components.push(tool);
 const [row]=proposedRows(s,data);assert.equal(row[9],null);assert.equal(row[11],'Approved product');assert.equal(row[12],'use\nsupervise');assert.deepEqual(proposedItem(row).requirements,[]);
 assert.throws(()=>importProposedItem(s,'foundation',row),/Link at least one outcome/);
 tool.internal=[];assert.equal(importProposedItem(s,'tool',row),true);
});

test('the saved AI use cases brief is found by catalogue proposal search',()=>{
 const [entry]=catalogueProposals(data,'AI use cases','N1.1');assert.ok(entry);
 assert.deepEqual(entry.item,{id:'cf694d28-c0af-4b87-919d-4d282e175d3d',title:'AI use cases',owner:'',hours:1,status:'Proposed',outcomes:'A training that showcases what AI does today in cyber by showing existing use in our organization, discuss about planned future development and beyond.',requirements:['N1.1','N1.2','N1.3']});
 assert.equal(catalogueProposals(data,'ORGANIZATION')[0].index,entry.index);
 assert.deepEqual(catalogueProposals(data,'AI use cases','N2.1'),[]);
 assert.deepEqual(catalogueProposals(data,'not a matching brief'),[]);
});
