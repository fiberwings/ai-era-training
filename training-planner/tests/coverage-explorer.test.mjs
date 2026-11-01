import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {measurePlan} from '../public/scoring.js';
import {coverageRecords,coverageCounts,coveragePriority,coverageNeeds,filterCoverage,sortCoverage,createCoverageState} from '../public/coverage-explorer.js';
import {pathMetrics} from '../public/components.js';

const requirements=[
 {id:'N1.1',need:'N1',title:'Core at zero',core:true},
 {id:'N1.2',need:'N1',title:'Core partial',core:true},
 {id:'N1.3',need:'N1',title:'Other gap',core:false},
 {id:'N2.1',need:'N2',title:'Internal commitment',core:true},
 {id:'N2.2',need:'N2',title:'Course complete',core:true},
 {id:'N2.3',need:'N2',title:'Internal plus complete course',core:false}
];
const selected=[{id:'selected',scores:{'N1.2':{score:2},'N1.3':{score:1},'N2.2':{score:3},'N2.3':{score:3}}}];
const items=[{id:'internal',title:'Local workshop',owner:'Alice',outcomes:'Hands-on assurance',status:'Proposed',requirements:['N2.1','N2.3']}];
const catalogue=[...selected,{id:'other',scores:{'N1.1':{score:3},'N1.2':{score:3}}}];
const m=measurePlan(requirements,selected,items);
const rows=coverageRecords(m,items,catalogue,{'N2.1':['Foundation','Specialisms']});

test('coverage buckets reconcile without treating internal commitments as assessed evidence',()=>{
 assert.deepEqual(coverageCounts(rows),{zero:1,partial:2,internal:1,covered:2,must:1,essential:2,limited:1});
 assert.equal(rows[3].score,0);assert.equal(rows[3].plannedScore,3);
 assert.equal(rows[5].status,'covered'); // A linked item must not hide full course evidence.
 assert.equal(m.planned.coverage,measurePlan(requirements,selected,items).planned.coverage);
 const dup=coverageRecords({...m,rows:[...m.rows,m.rows[0]]},items,catalogue);
 assert.equal(dup.length,6);
});

test('priority ranks essential zero, essential partial, other gaps, internal, then covered',()=>{
 const sorted=sortCoverage([...rows].reverse());
 assert.deepEqual(sorted.map(r=>r.id),requirements.map(r=>r.id));
 assert.deepEqual(sorted.map(coveragePriority),[0,1,2,3,4,4]);
 assert.deepEqual(coverageNeeds(rows).map(n=>n.id),['N1','N2']);
 assert.deepEqual(sortCoverage(rows,'id').map(r=>r.id),requirements.map(r=>r.id));
 assert.deepEqual(sortCoverage(rows,'coverage').map(r=>r.plannedScore),[0,1,2,3,3,3]);
});

test('filters distinguish partial must-haves, absent evidence, internal delivery and catalogue limits',()=>{
 const ids=status=>filterCoverage(rows,{status}).map(r=>r.id);
 assert.deepEqual(ids('must'),['N1.1']);assert.deepEqual(ids('essential'),['N1.1','N1.2']);
 assert.deepEqual(ids('incomplete'),['N1.1','N1.2','N1.3']);
 assert.deepEqual(ids('internal'),['N2.1']);assert.deepEqual(ids('covered'),['N2.2','N2.3']);
 assert.deepEqual(ids('limited'),['N1.3']);assert.deepEqual(ids('unlinked'),ids('incomplete'));
 assert.deepEqual(filterCoverage(rows,{category:'Specialisms',query:' ALICE   workshop ',importance:'must'}).map(r=>r.id),['N2.1']);
 assert.equal(filterCoverage(rows,{query:'nonexistent'}).length,0);
 assert.equal(filterCoverage(rows,{query:'core partial',importance:'other'}).length,0);
});

test('empty scope is empty and reset state has independent expansion tracking',()=>{
 assert.deepEqual(coverageNeeds([]),[]);assert.deepEqual(filterCoverage([],{}),[]);
 const a=createCoverageState(),b=createCoverageState();a.expanded.add('N1.1');assert.equal(b.expanded.size,0);
});

test('real audience coverage remains unique, complete and equal to existing scoring',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/data/catalogue.json',import.meta.url)));
 const scenario=JSON.parse(readFileSync(new URL('../public/data/component-starter.json',import.meta.url)));
 for(const target of [...scenario.components,...scenario.audiences]){
  const metrics=pathMetrics(data,scenario,target),records=coverageRecords(metrics,metrics.items,data.courses),c=coverageCounts(records);
  assert.equal(records.length,metrics.rows.length,target.id);
  assert.equal(c.zero+c.partial+c.internal+c.covered,metrics.rows.length,target.id);
  assert.equal(c.must,metrics.planned.critical,target.id);
  assert.equal(c.zero+c.partial,metrics.planned.rows.filter(r=>r.score<3).length,target.id);
  assert.deepEqual(new Set(coverageNeeds(records).flatMap(n=>n.rows.map(r=>r.id))),new Set(metrics.rows.map(r=>r.id)));
 }
});
