import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {duration} from '../public/duration.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const current=read('../public/data/catalogue.json');
const prior=read('../catalogue-history/ba0634eb6d9be98d.json');
const added=['TR-281','TR-282','TR-283','TR-284','TR-285'];
test('Udemy SecAI additions preserve all existing evidence and the framework',()=>{
 assert.deepEqual(current.courses.filter(c=>!added.includes(c.id)),prior.courses);
 for(const key of ['requirements','needs','thresholds','buildItems'])assert.deepEqual(current[key],prior[key]);
 assert.equal(current.courses.filter(c=>c.url.includes('comptia-secai-certification-2025-complete-exam-prep')).length,1);
 assert.equal(current.courses.some(c=>c.url.includes('comptia-secai-fundamentals-ai-cybersecurity-basics-cy0-001')),false);
});
test('new courses retain complete assessments and full course times without inferred practical credit',()=>{
 const minutes=[371,1530,660,461,345];
 for(const [i,id] of added.entries()){
  const c=current.courses.find(c=>c.id===id);assert.ok(c,id);
  assert.ok(Math.abs(duration(c).hours-minutes[i]/60)<1e-10);
  assert.equal(Object.keys(c.scores).length,140);
  assert.ok(Object.values(c.scores).every(s=>s.score>=0&&s.score<=2&&s.date==='2026-11-01'));
  assert.ok(c.sources.includes(c.url));
  assert.match(c.limitations,/Subscription inclusion unverified/);
 }
});
