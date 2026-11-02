import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateScenario,serialize,deserialize} from '../public/storage.js';
import {catalogueReview} from '../public/catalogue-identity.js';
import {pathMetrics} from '../public/components.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const current=read('../public/data/catalogue.json'),prior=read('../catalogue-history/ff6d5a46d0450171.json');
const approved=read('../../analysis/catalogue-freshness-review/inputs/review.json').retire.map(c=>c.id).sort();
const retired=new Set(approved);
test('approved retirements alone leave active records, evidence, outcomes and maximum coverage intact',()=>{
 assert.deepEqual(current.retiredCourses.map(c=>c.id).sort(),approved);
 assert.equal(current.courses.length,516);
 const kept=prior.courses.filter(c=>!retired.has(c.id));
 assert.deepEqual(current.courses.map(c=>c.id),kept.map(c=>c.id));
 for(const [i,c] of current.courses.entries())assert.deepEqual(c,kept[i],c.id);
 for(const key of ['requirements','needs','thresholds','buildItems','proposedTraining'])assert.deepEqual(current[key],prior[key]);
 for(const r of current.requirements){
  const max=d=>Math.max(...d.courses.map(c=>c.scores[r.id]?.score||0));
  assert.equal(max(current),max(prior),r.id);
 }
 assert.ok(current.retiredCourses.every(c=>!c.scores&&!c.unassessed&&c.reason&&c.retiredOn==='2026-11-02'));
});
test('retired exclusions remain valid, but selected and pinned retirements warn without destroying saved plans',()=>{
 for(const file of ['../public/data/component-starter.json','../public/data/default-scenario.json']){
  const s=read(file),group=(s.components||s.cohorts)[0];
  group.excluded.push('TR-259');assert.deepEqual(validateScenario(s,current),[]);
  assert.ok(!catalogueReview(s,current,prior).missingCourses.includes('TR-259'));
  for(const field of ['selected','pinned']){
   group.excluded=group.excluded.filter(id=>id!=='TR-259');
   if(field==='pinned')group.selected.push('TR-259');
   group[field].push('TR-259');const parsed=deserialize(serialize(s),current);
   assert.deepEqual(parsed.scenario,s);assert.ok(parsed.warnings.some(w=>w.includes('retired course TR-259')));
   assert.ok(catalogueReview(s,current,prior).missingCourses.includes('TR-259'));
   group[field].pop();
   if(field==='pinned')group.selected.pop();
  }
 }
});
test('archived v16 compatibility publication retains the v0.1 components, audiences, reviews and coverage',()=>{
 const s=read('../../archive/recommended-pathways/v0.2/Recommended-Training-Pathways.json');
 const snapshot=read('../catalogue-history/9ed4551ae565417e.json');
 const old=read('../../archive/recommended-pathways/v0.1/Recommended-Training-Pathways.json');
 assert.deepEqual(s.components,old.components);assert.deepEqual(s.audiences,old.audiences);
 assert.deepEqual(validateScenario(s,snapshot),[]);
 for(const [key,groups] of Object.entries({components:s.components,audiences:s.audiences}))for(const g of groups){
  const a=pathMetrics(snapshot,s,g),b=pathMetrics(prior,old,old[key].find(x=>x.id===g.id));
  for(const field of ['rows','coverage','total','planned'])assert.deepEqual(a[field],b[field],g.id+' '+field);
 }
});
