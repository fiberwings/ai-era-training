import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newLearner, validateBackup, requirementsFor, setStatus, recommendations} from '../src/core.js';
import {quickPathProfile, startingPoint, needsRoleReview, pathLayers, LEARNING_ROLES, syncRoleProfile} from '../src/layers.js';
import {toolUseMatch} from '../src/tool-audiences.js';
const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const bundle={catalogue:load('../../training-planner/public/data/catalogue.json'),scenario:load('../../training-planner/public/data/default-scenario.json'),scenarioVersion:'test',config:{}};
const choices={level:3,roles:[6,9],tools:['Microsoft 365 Copilot']};

test('quick setup completes at every level with broad responsibilities and no optional answers',()=>{
  for(const level of [1,2,3]){
    const l=newLearner(bundle);l.profile=quickPathProfile(l.profile,{...choices,level});
    assert.equal(l.profile.level,level);assert.equal(startingPoint(l.profile).level,level);
    assert.equal(l.profile.codingReady,false);assert.deepEqual(l.profile.answers,{});
    assert.deepEqual(l.profile.activityAnswers,{});assert.deepEqual(l.profile.toolUses,{});
    assert.equal(needsRoleReview(l.profile),false);
    assert.deepEqual(l.profile.roleResponsibilities[6],LEARNING_ROLES.find(r=>r.id===6).packages);
    const requirements=requirementsFor(bundle,l);
    assert.equal(requirements.length,new Set(requirements.map(r=>r.id)).size);
    for(const id of ['N11.3','R6.1.2'])if(requirements.some(r=>r.id===id))assert.equal(requirements.find(r=>r.id===id).core,false);
    assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(l))),l);
  }
});
test('quick setup requires just a valid level, responsibility area and tool',()=>{
  const p=newLearner(bundle).profile;
  assert.throws(()=>quickPathProfile(p,{...choices,level:0}),/level/);
  assert.throws(()=>quickPathProfile(p,{...choices,roles:[]}),/responsibility/);
  assert.throws(()=>quickPathProfile(p,{...choices,roles:[99]}),/responsibility/);
  assert.throws(()=>quickPathProfile(p,{...choices,tools:[]}),/tool/);
  const awareness=quickPathProfile(p,{...choices,roles:[7],codingReady:true});
  assert.deepEqual(awareness.specialisms,[]);assert.equal(awareness.codingReady,true);
});
test('quick setup preserves existing detailed preferences, assigned scope, and learning records',()=>{
  const l=newLearner(bundle);
  Object.assign(l.profile,{roles:[6],roleResponsibilities:{6:['ai-governance']},tools:choices.tools,toolUses:{[choices.tools[0]]:['administer']},activityAnswers:{'automated-judges':true},answers:{verify:0},name:'Alex',weeklyHours:4,experience:'regular',priorLearning:'Keep this',centralScope:{scenarioId:bundle.scenario.id,groupId:'iam',groupName:'IAM',added:['N13.2'],removed:['R9.1.7']}});
  syncRoleProfile(l.profile);setStatus(bundle,l,'TR-096','completed');l.items['TR-096'].notes='Keep my notes';
  const before=structuredClone(l);
  l.profile=quickPathProfile(l.profile,choices);
  assert.deepEqual(l.profile.roleResponsibilities[6],['ai-governance']);
  for(const key of ['toolUses','activityAnswers','answers','name','weeklyHours','experience','priorLearning','centralScope'])assert.deepEqual(l.profile[key],before.profile[key]);
  for(const key of ['items','feedback','history','formsTemplate'])assert.deepEqual(l[key],before[key]);
  assert.equal(startingPoint(l.profile).level,1);assert.equal(l.profile.level,3);
  assert.deepEqual(validateBackup(l),l);
});
test('unplaced legacy responsibilities survive quick setup without forcing extra questions',()=>{
  const p=newLearner(bundle).profile;p.pendingSpecialisms=['vendor-evaluation'];syncRoleProfile(p);
  const next=quickPathProfile(p,{...choices,roles:[8]});
  assert.deepEqual(next.pendingSpecialisms,['vendor-evaluation']);assert(next.specialisms.includes('vendor-evaluation'));
  assert.equal(needsRoleReview(next),false);
});
test('tool suggestions use level as a fallback, never infer administration, and respect explicit tasks',()=>{
  const l=newLearner(bundle),tool=choices.tools[0],course=id=>bundle.catalogue.courses.find(c=>c.id===id);
  l.profile=quickPathProfile(l.profile,{...choices,level:1});
  assert(toolUseMatch(course('TR-096'),l.profile,tool));
  assert(!toolUseMatch(course('TR-147'),l.profile,tool));
  assert(!toolUseMatch(course('TR-169'),l.profile,tool));
  l.profile.level=3;assert(toolUseMatch(course('TR-147'),l.profile,tool));
  assert(!toolUseMatch({id:'unreviewed'},l.profile,tool));
  const layer=pathLayers(bundle,l).find(x=>x.tool===tool),suggestions=recommendations(bundle,l,100,layer);
  assert(suggestions.length);assert(suggestions.every(s=>s.reason.includes('selected L3 level')));
  assert.deepEqual(l.profile.toolUses,{});
  l.profile.toolUses[tool]=['administer'];
  assert(toolUseMatch(course('TR-169'),l.profile,tool));assert(!toolUseMatch(course('TR-147'),l.profile,tool));
});
