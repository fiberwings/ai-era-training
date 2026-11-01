import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {duration} from '../public/duration.js';
import {measure} from '../public/scoring.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const data=read('../public/data/catalogue.json'),prior=read('../catalogue-history/6f245643cc5bf083.json');
test('Anthropic review preserves all other courses, rubric and thresholds',()=>{
 assert.deepEqual(data.requirements,prior.requirements);
 assert.deepEqual(data.needs,prior.needs);
 assert.deepEqual(data.thresholds,prior.thresholds);
 const changed=new Set(['TR-145','TR-089']);
 assert.deepEqual(data.courses.filter(c=>!changed.has(c.id)),prior.courses.filter(c=>!changed.has(c.id)));
});
test('TR-089 credits explicit 4D exercises without requiring graded labs',()=>{
 const c=data.courses.find(c=>c.id==='TR-089');
 assert.equal(duration(c).hours,4);assert.equal(c.level,'Entry');
 for(const id of ['N6.1','N6.2','N6.3','N6.4'])assert.equal(c.scores[id].score,3);
 assert.equal(c.scores['N6.7'].score,0);
 const n6=measure(data.requirements.filter(r=>r.need==='N6'),[c],data.thresholds);
 assert.ok(Math.abs(n6.coverage-16/24)<1e-10);assert.equal(n6.needs[0].band,'Partial');
 for(const s of Object.values(c.scores))assert.equal(s.date,'2026-10-31');
});
test('TR-145 uses published time and retains the essential prompt-injection gap',()=>{
 const c=data.courses.find(c=>c.id==='TR-145');
 assert.equal(duration(c).hours,3.5);
 assert.equal(c.level,'Base');assert.equal(c.track,'general');
 assert.equal(c.url,'https://academy.claude.com/courses/ai-capabilities-and-limitations');
 const n3=measure(data.requirements.filter(r=>r.need==='N3'),[c],data.thresholds);
 assert.ok(Math.abs(n3.coverage-16/21)<1e-10);
 assert.equal(n3.needs[0].band,'Partial');assert.equal(n3.critical,1);
 assert.equal(c.scores['N3.5'].score,0);
 const n6=measure(data.requirements.filter(r=>r.need==='N6'),[c],data.thresholds);
 assert.ok(Math.abs(n6.coverage-13/24)<1e-10);
 assert.equal(n6.needs[0].band,'Partial');
 for(const s of Object.values(c.scores))assert.equal(s.date,'2026-10-31');
});
