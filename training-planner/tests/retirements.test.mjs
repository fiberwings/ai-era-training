import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateScenario,serialize,deserialize} from '../public/storage.js';
import {catalogueReview} from '../public/catalogue-identity.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const current=read('../public/data/catalogue.json');
test('retired records carry metadata only and never collide with active courses',()=>{
 const active=new Set(current.courses.map(c=>c.id));
 for(const c of current.retiredCourses){assert.ok(!active.has(c.id),c.id);assert.ok(c.title&&c.reason&&c.retiredOn,c.id);assert.ok(!c.scores&&!c.unassessed,c.id);}
});
test('retired exclusions remain valid, but selected and pinned retirements warn without destroying saved plans',()=>{
 for(const file of ['../public/data/component-starter.json','../public/data/default-scenario.json']){
  const s=read(file),group=(s.components||s.cohorts)[0];
  group.excluded.push('TR-259');assert.deepEqual(validateScenario(s,current),[]);
  assert.ok(!catalogueReview(s,current).missingCourses.includes('TR-259'));
  for(const field of ['selected','pinned']){
   group.excluded=group.excluded.filter(id=>id!=='TR-259');
   if(field==='pinned')group.selected.push('TR-259');
   group[field].push('TR-259');const parsed=deserialize(serialize(s),current);
   assert.deepEqual(parsed.scenario,s);assert.ok(parsed.warnings.some(w=>w.includes('retired course TR-259')));
   assert.ok(catalogueReview(s,current).missingCourses.includes('TR-259'));
   group[field].pop();
   if(field==='pinned')group.selected.pop();
  }
 }
});
