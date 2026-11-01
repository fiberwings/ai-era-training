import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {courseDetailModel,renderCourseEvidence,renderCourseDetailBody} from '../public/course-details.js';
import {componentScope,componentTime,pathMetrics} from '../public/components.js';
import {measure} from '../public/scoring.js';

const data=JSON.parse(readFileSync(new URL('../public/data/catalogue.json',import.meta.url)));
const starter=JSON.parse(readFileSync(new URL('../public/data/component-starter.json',import.meta.url)));
const course=data.courses.find(c=>c.id==='TR-145');
function context(s=starter,c=s.components[0]){
 return {name:c.name,requirements:componentScope(data,c,c.activities||[]),courses:pathMetrics(data,s,c).courses,
  spent:componentTime(data,s,c),budget:c.budget,overrides:s.overrides};
}

test('current scope retains explicit zeros and evidence; all outcomes retain every assessment',()=>{
 const ctx=context(),m=courseDetailModel(data,course,ctx),html=renderCourseEvidence(data,m);
 assert.equal(m.rows.length,140);
 assert.equal(m.rows.find(r=>r.id==='N3.5').score,0);
 assert.match(html,/N3.5 · Prompt injection/);
 assert.match(html,/0\/3 · Not covered/);
 assert.ok(html.includes(course.scores['N3.5'].evidence));
 assert.match(html,/Previous score: 1\/3/);
 assert.match(html,/Must-have in current scope/);
 assert.doesNotMatch(html,/N6.1 ·/);
 const all=renderCourseEvidence(data,m,'all');
 assert.match(all,/N6.1 ·/);
 assert.equal((all.match(/<tr><th scope="row">/g)||[]).length,140);
 assert.equal((html.match(/<tr><th scope="row">/g)||[]).length,ctx.requirements.length);
 assert.equal(m.rows.find(r=>r.id==='N6.1').core,false);
});

test('unassessed records are never presented as assessed zero and empty tooling scope is explicit',()=>{
 const unassessed=data.courses.find(c=>!Object.keys(c.scores).length&&Object.keys(c.unassessed||{}).length);
 const m=courseDetailModel(data,unassessed,context()),html=renderCourseEvidence(data,m);
 assert.ok(m.rows.every(r=>r.score===null));
 assert.match(html,/Not assessed/);assert.doesNotMatch(html,/0\/3/);
 assert.match(renderCourseDetailBody(data,unassessed,context()),/Missing evidence does not mean no teaching/);
 assert.match(renderCourseEvidence(data,courseDetailModel(data,unassessed,{...context(),requirements:[],budget:null})),/No assessed outcome scope/);
});

test('detail coverage and budget use existing scoring, overrides and inherited deduplication',()=>{
 const s=structuredClone(starter),foundation=s.components[0],l1=s.components.find(c=>c.id==='l1');
 const ctx=context(s),m=courseDetailModel(data,course,ctx);
 assert.equal(m.gain,measure(ctx.requirements,[course],data.thresholds).coverage);
 assert.equal(m.total,3.5);assert.equal(m.budgetText,'1.5h over course budget');
 foundation.selected=[course.id];
 const inherited=courseDetailModel(data,course,context(s,l1));
 assert.equal(inherited.selected,true);assert.equal(inherited.extra,0);assert.equal(inherited.gain,0);assert.equal(inherited.total,0);
 s.overrides[course.id]=1.5;
 const selected=courseDetailModel(data,course,context(s));
 assert.equal(selected.total,1.5);assert.equal(selected.budgetText,'Fits course budget');
 assert.match(renderCourseDetailBody(data,course,context(s)),/Planner override/);
});

test('unknown learning time, unresolved existing time, and unset budget are distinct',()=>{
 const unknown={...course,duration:'3 days'};
 assert.equal(courseDetailModel(data,unknown,context()).budgetText,'Budget fit unresolved');
 assert.equal(courseDetailModel(data,course,{...context(),spent:{hours:0,unknown:1}}).budgetText,'Budget fit unresolved');
 assert.equal(courseDetailModel(data,course,{...context(),budget:null}).budgetText,'Course budget not set');
});

test('details preserve current provenance, all supporting links and labelled historical audit',()=>{
 const html=renderCourseDetailBody(data,course,context());
 assert.match(html,/Free/);assert.match(html,/Public lessons and exercises/);
 assert.match(html,/Latest recorded outcome assessment: <strong>2026-10-31/);
 assert.match(html,/Historical source review/);assert.match(html,/Later outcome assessments above take precedence/);
 for(const url of course.sources)assert.ok(html.includes(url));
 assert.match(html,/Supporting sources \(8\)/);
});

test('catalogue text is escaped and unsafe links are not rendered',()=>{
 const unsafe={...course,description:'<img src=x onerror=alert(1)>',url:'javascript:alert(1)',sources:['javascript:alert(1)'],audit:{note:'<script>alert(1)</script>'}};
 const html=renderCourseDetailBody(data,unsafe,{...context(),name:'<b>Foundation</b>'});
 assert.doesNotMatch(html,/<img|<script|href="javascript:/);
 assert.match(html,/&lt;img/);assert.match(html,/&lt;b&gt;Foundation/);
});
