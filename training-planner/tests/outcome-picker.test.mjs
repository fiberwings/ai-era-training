import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {outcomePickerGroups} from '../public/outcome-picker.js';

const data=JSON.parse(fs.readFileSync(new URL('../public/data/catalogue.json',import.meta.url)));
const ids=groups=>groups.flatMap(g=>g.rows.map(r=>r.id));

test('outcome picker groups every outcome once under its learning need',()=>{
 const groups=outcomePickerGroups(data),all=ids(groups);
 assert.equal(groups.length,23);assert.equal(all.length,140);assert.equal(new Set(all).size,140);
 assert.ok(groups.every(g=>g.rows.every(r=>r.need===g.id)));
 assert.equal(groups.find(g=>g.id==='N1').title,'AI in cyber');
});
test('outcome filters match need names, outcome IDs and descriptions with scope intersection',()=>{
 assert.deepEqual(ids(outcomePickerGroups(data,{query:' N1.1 '})),['N1.1']);
 assert.deepEqual(ids(outcomePickerGroups(data,{query:'AI IN CYBER'})),data.requirements.filter(r=>r.need==='N1').map(r=>r.id));
 assert.ok(ids(outcomePickerGroups(data,{query:'multiplayer'})).length===0);
 assert.ok(ids(outcomePickerGroups(data,{query:'triage enrichment'})).includes('N1.1'));
 assert.deepEqual(ids(outcomePickerGroups(data,{filter:'scope',scopeIds:['N1.1','N2.1'],query:'N1'})),['N1.1']);
 assert.deepEqual(outcomePickerGroups(data,{query:'no-such-outcome'}),[]);
});
test('gap and selected filters retain out-of-filter selections and group mixed states',()=>{
 const selected=['N1.1','N2.1'];
 const groups=outcomePickerGroups(data,{selectedIds:selected});
 assert.equal(groups.find(g=>g.id==='N1').indeterminate,true);
 assert.equal(groups.find(g=>g.id==='N1').checked,false);
 assert.deepEqual(ids(outcomePickerGroups(data,{filter:'gaps',gapIds:['N1.2'],selectedIds:selected})),['N1.2']);
 assert.deepEqual(ids(outcomePickerGroups(data,{filter:'selected',selectedIds:selected})),selected);
 assert.deepEqual(selected,['N1.1','N2.1']);
 const narrowed=outcomePickerGroups(data,{query:'N1.1',selectedIds:selected})[0];
 assert.equal(narrowed.checked,true);assert.equal(narrowed.indeterminate,false);
 const needIds=groups.find(g=>g.id==='N1').rows.map(r=>r.id);
 assert.equal(outcomePickerGroups(data,{selectedIds:needIds}).find(g=>g.id==='N1').checked,true);
});
