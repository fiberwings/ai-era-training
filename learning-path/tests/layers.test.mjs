import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newLearner, requirementsFor, centralIds, centralReason, setStatus, sourceFor, recommendations, coverage, progress, validateBackup, searchCourses, CHECKS} from '../src/core.js';
import {pathLayers, migrateLearner, recommendLevel, validatePathChoices, matchesTool, LEARNING_ROLES, syncRoleProfile, flattenLayers} from '../src/layers.js';
import {SPECIALISMS, sharedLevel} from '../../training-planner/public/capability-model.js';
import {measure} from '../../training-planner/public/scoring.js';
const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const bundle={catalogue:load('../../training-planner/public/data/catalogue.json'),scenario:load('../../training-planner/public/data/default-scenario.json'),scenarioVersion:'test',config:{}};
function learner(level=2){const l=newLearner(bundle);Object.assign(l.profile,{level,levelGoal:level,roles:[1,6],roleResponsibilities:{1:['incident-response'],6:['ai-governance']},activityAnswers:{'automated-judges':false,'ai-assisted-assurance':false},tools:['OpenAI ChatGPT','Microsoft 365 Copilot'],toolUses:{'OpenAI ChatGPT':['use'],'Microsoft 365 Copilot':['use']}});syncRoleProfile(l.profile);return l;}

test('a composed path always has Foundation and exactly one selected AI level',()=>{
  for(const level of [1,2,3]){const l=learner(level),layers=pathLayers(bundle,l);assert.equal(layers.filter(x=>x.kind==='foundation').length,1);assert.equal(layers.filter(x=>x.kind==='level').length,1);assert(layers.find(x=>x.kind==='level').name.startsWith(`L${level}`));assert.equal(layers.filter(x=>x.kind==='specialist').length,2);assert.equal(layers.filter(x=>x.kind==='tool').length,2);assert(layers[0].requirements.length>0);assert(layers[0].centralIds.length>0);assert(layers[1].requirements.every(r=>sharedLevel(r)>0&&sharedLevel(r)<=level));}
});
test('earlier-level practice stays inside the selected level layer and Foundation is separate',()=>{
  const layers=pathLayers(bundle,learner(3)),level=layers.find(l=>l.kind==='level');assert.deepEqual(new Set(level.requirements.map(sharedLevel)),new Set([1,2,3]));assert(level.groups.every(g=>g.profile.level>0));assert(!level.centralIds.some(id=>layers[0].centralIds.includes(id)));
});
test('the level recommendation uses the work goal and checks, with a safe starting point',()=>{
  const p=learner(3).profile;p.answers=Object.fromEntries(CHECKS.map(q=>[q.id,q.correct]));assert.equal(recommendLevel(p).level,3);p.answers.build=0;assert.equal(recommendLevel(p).level,2);p.answers.agent=1;assert.equal(recommendLevel(p).level,1);p.answers={};assert.equal(recommendLevel(p).level,1);p.levelGoal=1;p.answers=Object.fromEntries(CHECKS.map(q=>[q.id,q.correct]));assert.equal(recommendLevel(p).level,1);
});
test('assessment does not silently change the confirmed level or learner commitments',()=>{
  const l=learner(3),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'completed');const snapshot=structuredClone(l);recommendLevel(l.profile);assert.deepEqual(l,snapshot);assert.equal(l.profile.level,3);
});
test('level, at least one specialisation, and at least one tool are required for a complete path',()=>{
  const p=learner().profile;assert.doesNotThrow(()=>validatePathChoices(p));assert.throws(()=>validatePathChoices({...p,level:0}),/one level/);assert.throws(()=>validatePathChoices({...p,roles:[]}),/role/);assert.throws(()=>validatePathChoices({...p,tools:[]}),/tool/);
});
test('all nine authoritative roles map every stable package and preserve ordering',()=>{
  assert.deepEqual(LEARNING_ROLES.map(r=>r.id),[1,2,3,4,5,6,7,8,9]);assert.match(LEARNING_ROLES[7].name,/Identity/);assert.equal(LEARNING_ROLES[8].name,'Leadership');
  assert.deepEqual(new Set(LEARNING_ROLES.flatMap(r=>r.packages)),new Set(SPECIALISMS.map(s=>s.id)));
});
test('specialist central options span levels, retain provenance, and never import unrelated shared curriculum',()=>{
  for(const level of [1,2,3]){const l=learner(level);l.profile.roles=LEARNING_ROLES.map(r=>r.id);l.profile.roleResponsibilities=Object.fromEntries(LEARNING_ROLES.map(r=>[r.id,r.packages]));syncRoleProfile(l.profile);
    for(const layer of flattenLayers(pathLayers(bundle,l)).filter(l=>l.packageId)){
      assert(layer.groups.length);for(const id of layer.centralIds){const c=bundle.catalogue.courses.find(c=>c.id===id);assert(layer.groups.some(g=>g.selected.includes(id)));assert(layer.requirements.some(r=>(c.scores[r.id]?.score||0)>=2));assert.match(centralReason(bundle,l,c),/Central (selection|role option)/);}
      for(const id of layer.roleOptionIds)assert(!layer.groups.filter(g=>g.profile.level===level).some(g=>g.selected.includes(id)||g.internal.some(i=>'internal:'+i.id===id)));
    }
    const shared=pathLayers(bundle,l).filter(x=>['foundation','level'].includes(x.kind));assert(shared.every(x=>x.groups.every(g=>g.profile.level<=level&&!g.profile.specialisms.length)));
  }
});
test('IAM, forensics, governance and infrastructure central options remain available at every level',()=>{
  for(const level of [1,2,3]){const l=learner(level);Object.assign(l.profile,{roles:[1,5,6,8],roleResponsibilities:{1:['agent-forensics'],5:['agent-engineering'],6:['ai-governance'],8:['identity-operations','identity-integration']}});syncRoleProfile(l.profile);
    const layers=flattenLayers(pathLayers(bundle,l));for(const id of l.profile.specialisms){const layer=layers.find(x=>x.packageId===id);assert(layer.centralIds.length+layer.internalIds.length>0,`${id} L${level}`);assert(layer.requirements.length);}
  }
  const l=learner(3);Object.assign(l.profile,{roles:[8],roleResponsibilities:{8:['identity-operations']}});syncRoleProfile(l.profile);const layer=pathLayers(bundle,l).find(x=>x.roleId===8);assert(layer.roleOptionIds.length);const id=layer.roleOptionIds.find(id=>!id.startsWith('internal:'));assert.equal(sourceFor(bundle,l,id),'central-role');setStatus(bundle,l,id,'saved');assert.equal(validateBackup(l).items[id].source,'central-role');assert.match(centralReason(bundle,l,bundle.catalogue.courses.find(c=>c.id===id)),/L1/);
});
test('security awareness is a complete path with reused risk learning and no specialist package',()=>{
  const l=learner(1);Object.assign(l.profile,{roles:[7],roleResponsibilities:{7:[]}});syncRoleProfile(l.profile);assert.doesNotThrow(()=>validatePathChoices(l.profile));assert.deepEqual(l.profile.specialisms,[]);
  const layers=pathLayers(bundle,l),role=layers.find(x=>x.roleId===7);assert(role.reused);assert(role.requirements.length);assert(role.requirements.every(r=>r.need==='N5'&&sharedLevel(r)===0));assert(role.centralIds.every(id=>layers[0].centralIds.includes(id)));
  assert.equal(coverage(bundle,l).rows.find(x=>x.id==='role:7').reused,true);
});
test('a selected role never silently assigns all responsibilities',()=>{
  const p=learner().profile;p.roleResponsibilities[1]=[];syncRoleProfile(p);assert(!p.specialisms.includes('incident-response'));assert.throws(()=>validatePathChoices(p),/responsibility/);
});
test('conditional essentials follow explicit activity answers, independent of source plan flags',()=>{
  const l=learner(3);Object.assign(l.profile,{roles:[6],roleResponsibilities:{6:['agent-assurance']},activityAnswers:{}});syncRoleProfile(l.profile);assert.throws(()=>validatePathChoices(l.profile),/activity question/);
  for(const yes of [false,true]){l.profile.activityAnswers={'automated-judges':yes,'ai-assisted-assurance':yes};syncRoleProfile(l.profile);const reqs=requirementsFor(bundle,l);for(const id of ['N11.3','R6.1.2'])assert.equal(reqs.find(r=>r.id===id).core,yes);assert.doesNotThrow(()=>validatePathChoices(l.profile));}
});
test('shared packages, outcomes and courses count once even when selected under two roles',()=>{
  const l=learner(3);Object.assign(l.profile,{roles:[6,9],roleResponsibilities:{6:['ai-governance','vendor-evaluation'],9:['ai-governance','vendor-evaluation']}});syncRoleProfile(l.profile);assert.equal(l.profile.specialisms.length,2);
  const reqs=requirementsFor(bundle,l),ids=centralIds(bundle,l);assert.equal(reqs.length,new Set(reqs.map(r=>r.id)).size);assert.equal(ids.length,new Set(ids).size);
  const id=ids[0];setStatus(bundle,l,id,'planned');setStatus(bundle,l,id,'planned');assert.equal(progress(bundle,l).total,1);
});
test('each tool layer recommends only its selected product and remains unassessed',()=>{
  const l=learner();for(const layer of pathLayers(bundle,l).filter(l=>l.kind==='tool')){const rs=recommendations(bundle,l,4,layer);assert(rs.length);assert(rs.every(x=>x.course.track==='tool'&&matchesTool(x.course,[layer.tool])));assert.equal(layer.requirements.length,0);}
});
test('layer search filters by the chosen specialisation or tool rather than the entire profile',()=>{
  const l=learner();for(const layer of pathLayers(bundle,l)){const rs=searchCourses(bundle,l,'',{layer:layer.id});assert(rs.length);assert(rs.every(c=>layer.centralIds.includes(c.id)||(layer.kind==='tool'?c.track==='tool'&&matchesTool(c,[layer.tool]):layer.requirements.some(r=>(c.scores[r.id]?.score||0)>=2))));}
});
test('old profiles migrate all 23 presets without changing saved course data or feedback',()=>{
  for(const g of bundle.scenario.cohorts){const l=learner();delete l.profile.pathVersion;delete l.profile.level;delete l.profile.levelGoal;l.profile.groupId=g.id;l.profile.specialisms=['agent-forensics'];const id=centralIds(bundle,l)[0];if(id){setStatus(bundle,l,id,'completed');l.items[id].notes='Keep my notes';l.items[id].dueDate='2026-12-20';}const before=structuredClone(l);migrateLearner(bundle,l);assert.equal(l.profile.level,Math.max(1,g.profile.level));assert(g.profile.specialisms.every(id=>l.profile.specialisms.includes(id)));assert(l.profile.specialisms.includes('agent-forensics'));assert.deepEqual(l.items,before.items);assert.deepEqual(l.feedback,before.feedback);assert.deepEqual(l.history,before.history);assert.doesNotThrow(()=>validateBackup(l));const again=structuredClone(l);migrateLearner(bundle,l);assert.deepEqual(l,again);}
});
test('changing layers preserves completion provenance and does not duplicate shared courses',()=>{
  const l=learner(),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'completed');const before=structuredClone(l.items[id]);l.profile.level=3;l.profile.roles=[5];l.profile.roleResponsibilities={5:['agent-architecture']};syncRoleProfile(l.profile);l.profile.tools=['Microsoft 365 Copilot'];l.profile.toolUses={'Microsoft 365 Copilot':['use']};assert.deepEqual(l.items[id],before);setStatus(bundle,l,id,'completed');assert.equal(progress(bundle,l).total,1);assert.deepEqual(l.items[id].completionContext,before.completionContext);assert.equal(new Set(centralIds(bundle,l)).size,centralIds(bundle,l).length);
});
test('composed coverage uses the original scorer with deduplicated applicable outcomes',()=>{
  const l=learner(3),rs=requirementsFor(bundle,l),ids=centralIds(bundle,l),courses=bundle.catalogue.courses.filter(c=>ids.includes(c.id));assert.equal(new Set(rs.map(r=>r.id)).size,rs.length);assert.equal(coverage(bundle,l,'central').total.coverage,measure(rs,courses,bundle.catalogue.thresholds).coverage);
});
test('backups reject unsupported layered profiles but accept an incomplete setup',()=>{
  const l=learner();assert.deepEqual(validateBackup(l),l);assert.throws(()=>validateBackup({...l,profile:{...l.profile,level:0}}),/level/);assert.doesNotThrow(()=>validateBackup(newLearner(bundle)));
});

test('1.1 profiles retain ambiguous scope and all history until roles are confirmed',()=>{
  const l=learner(3),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'completed');l.items[id].notes='Retain this';l.items[id].dueDate='2026-12-01';l.history=[{event:'previous'}];
  l.feedback=[{id:'test',courseId:id,courseTitle:l.items[id].title,groupId:'original',groupName:'Original learning group',catalogueVersion:bundle.catalogue.version,completedOn:'2026-10-29',usefulness:4,difficulty:'About right',actualHours:2,comment:'Keep context'}];
  Object.assign(l.profile,{pathVersion:2,specialisms:['ai-governance','vendor-evaluation','identity-operations']});const before=structuredClone(l);migrateLearner(bundle,l);
  assert.deepEqual(l.profile.roles,[8]);assert.deepEqual(l.profile.pendingSpecialisms,['ai-governance','vendor-evaluation']);assert.deepEqual(new Set(l.profile.specialisms),new Set(before.profile.specialisms));assert(pathLayers(bundle,l).some(x=>x.pending));
  for(const key of ['items','feedback','history','formsTemplate'])assert.deepEqual(l[key],before[key]);assert.doesNotThrow(()=>validateBackup(l));assert.throws(()=>validatePathChoices(l.profile),/Place each previous/);
  l.profile.roles.push(9);l.profile.roleResponsibilities[9]=l.profile.pendingSpecialisms;l.profile.pendingSpecialisms=[];l.profile.activityAnswers={'automated-judges':false};l.profile.toolUses={'OpenAI ChatGPT':['use'],'Microsoft 365 Copilot':['use']};syncRoleProfile(l.profile);assert.doesNotThrow(()=>validatePathChoices(l.profile));assert.deepEqual(l.items,before.items);assert.deepEqual(l.feedback,before.feedback);
});
test('backup validation rejects mismatched role scope, invalid parents and unconfirmed activity flags',()=>{
  const l=learner();assert.throws(()=>validateBackup({...l,profile:{...l.profile,specialisms:[]}}),/scope/);assert.throws(()=>validateBackup({...l,profile:{...l.profile,roleResponsibilities:{1:['ai-governance']}}}),/responsibility/);assert.throws(()=>validateBackup({...l,profile:{...l.profile,activities:['automated-judges']}}),/Activities/);
});
