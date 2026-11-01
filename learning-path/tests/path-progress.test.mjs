import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newLearner, setStatus, recommendations, validateBackup} from '../src/core.js';
import {pathLayers, quickPathProfile, flattenLayers} from '../src/layers.js';
import {prepareCentralScenario} from '../src/published-pathways.js';
import {pathwayProgress} from '../src/path-progress.js';

const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
const catalogue=load('../../training-planner/public/data/catalogue.json');
const scenario=prepareCentralScenario(load('../../recommended-pathways/Recommended-Training-Pathways.json'),catalogue);
const bundle={catalogue,scenario,scenarioVersion:'progress-test'};
function learner(level=1,roles=[7]){
  const l=newLearner(bundle);
  l.profile=quickPathProfile(l.profile,{level,roles,tools:['Microsoft 365 Copilot']});
  return l;
}
function withSuggestions(l){
  const layers=pathLayers(bundle,l);
  for(const layer of flattenLayers(layers))layer.suggestions=layer.responsibilities?.length?[]:recommendations(bundle,l,4,layer);
  return layers;
}

test('Foundation and L1 share completion credit; proposed internal training stays separate',()=>{
  const l=learner(),before=JSON.stringify(l),initial=pathwayProgress(bundle,l);
  assert.equal(JSON.stringify(l),before);
  assert.equal(initial.foundation.total,2);assert.equal(initial.foundation.completed,0);
  assert.equal(initial.foundation.upcomingIds.length,1);
  assert.equal(initial.level.total,2);assert.equal(initial.level.shared,2);
  setStatus(bundle,l,'TR-281','completed');
  const halfway=pathwayProgress(bundle,l);
  for(const kind of ['foundation','level']){
    assert.equal(halfway[kind].completed,1);assert.equal(halfway[kind].total,2);assert.equal(halfway[kind].percent,50);
  }
  setStatus(bundle,l,'TR-145','completed');
  const done=pathwayProgress(bundle,l);
  for(const kind of ['foundation','level'])assert.equal(done[kind].percent,100);
  assert.equal(Object.keys(l.items).length,2);
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(l))),l);
});

test('completion can be reversed without stale counts or deleting learning records',()=>{
  const l=learner();setStatus(bundle,l,'TR-281','completed');
  l.items['TR-281'].notes='Keep my notes';setStatus(bundle,l,'TR-281','in-progress');
  const p=pathwayProgress(bundle,l).foundation;
  assert.equal(p.completed,0);assert.equal(p.inProgress,1);assert.equal(p.percent,0);assert.equal(p.total,2);
  assert.equal(l.items['TR-281'].notes,'Keep my notes');
});

test('overlapping roles and responsibility packages count each training once',()=>{
  const l=learner(3,[6,9]),layers=pathLayers(bundle,l),specialists=layers.filter(x=>x.kind==='specialist');
  const all= special=>special.flatMap(x=>x.centralIds);
  assert(all(specialists).length>new Set(all(specialists)).size,'fixture has shared role training');
  const p=pathwayProgress(bundle,l,layers).specialist;
  assert.equal(p.total,new Set(all(specialists)).size);
  assert.equal(p.trainingIds.length,new Set(p.trainingIds).size);
  const shared=specialists[0].centralIds.find(id=>specialists[1].centralIds.includes(id));
  setStatus(bundle,l,shared,'completed');
  assert.equal(pathwayProgress(bundle,l).specialist.completed,1);
});

test('optional suggestions can refresh while earned completion remains stable',()=>{
  const l=learner(),initial=pathwayProgress(bundle,l,withSuggestions(l)).tool;
  assert.equal(initial.total,0);assert.equal(initial.percent,0);assert(initial.optionIds.length>0);
  const chosen=initial.optionIds[0];
  setStatus(bundle,l,chosen,'planned');
  let p=pathwayProgress(bundle,l,withSuggestions(l)).tool;
  assert.equal(p.total,1);assert.equal(p.completed,0);assert(!p.optionIds.includes(chosen));
  setStatus(bundle,l,chosen,'completed');
  p=pathwayProgress(bundle,l,withSuggestions(l)).tool;
  assert.equal(p.total,1);assert.equal(p.completed,1);assert.equal(p.percent,100);
  assert(p.optionIds.length>0,'more optional training is available after completion');
});

test('saved and deferred personal choices are optional; central recommendations remain in the total',()=>{
  const l=learner(),id=pathwayProgress(bundle,l,withSuggestions(l)).tool.optionIds[0];
  for(const status of ['saved','deferred']){
    setStatus(bundle,l,id,status);assert.equal(pathwayProgress(bundle,l).tool.total,0);
    setStatus(bundle,l,'TR-281',status);assert.equal(pathwayProgress(bundle,l).foundation.total,2);
  }
});

test('unconfigured layers never appear complete and unrelated history earns no credit',()=>{
  const l=newLearner(bundle);l.items['no-longer-in-catalogue']={status:'completed'};
  const p=pathwayProgress(bundle,l);
  for(const kind of ['specialist','tool']){
    assert.equal(p[kind].configured,false);assert.equal(p[kind].total,0);assert.equal(p[kind].percent,0);
  }
  assert.equal(p.foundation.completed,0);
});

test('route changes recompute training while retaining shared completion and all personal history',()=>{
  const l=learner(3,[5]);setStatus(bundle,l,'TR-281','completed');
  const before=pathwayProgress(bundle,l).level,items=JSON.stringify(l.items);
  l.profile.learningRoute='coached';
  const after=pathwayProgress(bundle,l).level;
  assert(before.trainingIds.includes('TR-198'));assert(!after.trainingIds.includes('TR-198'));
  assert.equal(after.completed,1);assert(after.upcomingIds.length>before.upcomingIds.length);
  assert.equal(JSON.stringify(l.items),items);
});

test('earlier completions retain credit when a course later awaits availability review',()=>{
  const l=learner();setStatus(bundle,l,'TR-281','completed');
  const changed={...bundle,catalogue:{...catalogue,courses:catalogue.courses.map(c=>c.id==='TR-281'?{...c,review:'Needs delivery validation'}:c)}};
  const p=pathwayProgress(changed,l).foundation;
  assert.equal(p.total,2);assert.equal(p.completed,1);assert.equal(p.upcomingIds.length,1);
});
