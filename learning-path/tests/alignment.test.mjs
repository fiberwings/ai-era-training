import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newLearner, requirementsFor, centralIds, setStatus, recommendations, coverage, displayTracks, searchCourses, validateBackup, validateCentralScenario, FEEDBACK_FIELDS} from '../src/core.js';
import {pathLayers, migrateLearner, startingPoint, setWorkTarget, syncRoleProfile, validatePathChoices, needsRoleReview, applicableActivities, centralStep} from '../src/layers.js';
import {TOOL_AUDIENCES, TOOL_USES, toolAudience, toolUseMatch} from '../src/tool-audiences.js';
import {captureCentralScope, scopeDifference, applyScopeChoice} from '../src/central-scope.js';
import {cumulativeScope, syncNeeds} from '../../training-planner/public/cohorts.js';
import {profileRequirements} from '../../training-planner/public/capability-model.js';
const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const bundle={catalogue:load('../../training-planner/public/data/catalogue.json'),scenario:load('../../training-planner/public/data/default-scenario.json'),scenarioVersion:'test',config:{}};
const ids=rows=>new Set(rows.map(r=>r.id));
function learner(level=1){const l=newLearner(bundle);Object.assign(l.profile,{level,levelGoal:level,roles:[8],roleResponsibilities:{8:['identity-operations']},tools:['Microsoft 365 Copilot'],toolUses:{'Microsoft 365 Copilot':['use']},activityAnswers:{'automated-judges':false}});syncRoleProfile(l.profile);return l;}
function customBundle(){const b=structuredClone(bundle),g=b.scenario.cohorts.find(g=>g.id==='iam');g.removedRequirements=['R9.1.7'];g.addedRequirements=['N13.2'];syncNeeds(b.catalogue,b.scenario);return b;}
function personalRecords(l){setStatus(bundle,l,'TR-096','completed');Object.assign(l.items['TR-096'],{notes:'Keep these notes',dueDate:'2026-12-21',actualHours:2,order:7});l.feedback=[{id:'feedback-1',courseId:'TR-096',courseTitle:l.items['TR-096'].title,groupId:'original-group',groupName:'Original group',catalogueVersion:bundle.catalogue.version,completedOn:l.items['TR-096'].completedOn,usefulness:4,difficulty:'About right',actualHours:2,comment:'Keep the original context',delivery:'saved'}];l.history=[{event:'Original history',date:'2026-10-30'}];l.formsTemplate='https://forms.office.com/Pages/ResponsePage.aspx?'+FEEDBACK_FIELDS.map((f,i)=>`r${i}=${encodeURIComponent('{{'+f+'}}')}`).join('&');return structuredClone({items:l.items,feedback:l.feedback,history:l.history,formsTemplate:l.formsTemplate});}
function records(l){return {items:l.items,feedback:l.feedback,history:l.history,formsTemplate:l.formsTemplate};}

test('a novice targeting L3 starts at L1 while retaining every L3 target outcome and central course',()=>{
  const l=learner();l.profile=setWorkTarget(l.profile,3);l.profile.answers={verify:0,safe:0,agent:1,build:0};
  const before=structuredClone(l),reqs=ids(requirementsFor(bundle,l));assert.equal(startingPoint(l.profile).level,1);assert.equal(l.profile.level,3);
  for(const r of profileRequirements(bundle.catalogue,{level:3,specialisms:[]}))assert(reqs.has(r.id));
  const lower=ids(requirementsFor(bundle,learner(1)));assert.equal([...reqs].filter(id=>!lower.has(id)).length,27);
  const technical=bundle.scenario.cohorts.find(g=>g.id==='technical');assert(technical.selected.every(id=>centralIds(bundle,l).includes(id)));assert.deepEqual(l,before);
});
test('work target changes preserve personal records and the quiz never overrides it',()=>{
  const l=learner(),before=personalRecords(l);l.profile=setWorkTarget({...l.profile,answers:{}},3);startingPoint(l.profile);assert.deepEqual(records(l),before);assert.equal(l.profile.levelGoal,3);assert.equal(l.profile.targetReview,null);
});
test('earlier central practice keeps its own step label inside an L3 target path',()=>{
  const l=learner(3),layer=pathLayers(bundle,l).find(l=>l.kind==='level'),entry=bundle.scenario.cohorts.find(g=>g.id==='entry');
  for(const id of entry.selected)assert.equal(centralStep(layer,{id}),1);
  assert.equal(centralStep(layer,{id:'not-a-central-course'}),null);
  for(const i of entry.internal)assert.equal(centralStep(layer,{id:`internal:${i.id}`}),1);
});
test('tool task metadata references real tool offerings and does not invent assessed scores',()=>{
  for(const [id,entry] of Object.entries(TOOL_AUDIENCES)){const c=bundle.catalogue.courses.find(c=>c.id===id);assert(c,id);assert.equal(c.track,'tool');assert(entry.uses.every(use=>TOOL_USES.some(t=>t.id===use)));assert.deepEqual(c.scores,{});}
  assert.deepEqual(toolAudience({id:'unreviewed'}),[]);
});
test('same product offers different training for use, building and administration, independently of level',()=>{
  const l=learner(),course=id=>bundle.catalogue.courses.find(c=>c.id===id),tool='Microsoft 365 Copilot';
  assert(!toolUseMatch(course('TR-169'),l.profile,tool));assert(!toolUseMatch(course('TR-147'),l.profile,tool));
  const options=()=>recommendations(bundle,l,100,pathLayers(bundle,l).find(x=>x.tool===tool)).map(r=>r.course.id);
  assert(!options().includes('TR-169'));l.profile.toolUses[tool]=['administer'];assert(options().includes('TR-169'));assert(!options().includes('TR-147'));
  l.profile.toolUses[tool]=['build'];assert(options().includes('TR-147'));assert(!options().includes('TR-169'));
  l.profile.toolUses[tool]=['build','administer'];assert(toolUseMatch(course('TR-169'),l.profile,tool));assert(toolUseMatch(course('TR-147'),l.profile,tool));assert.equal(l.profile.level,1);
});
test('AWS use does not suggest agent building, while all offerings remain searchable',()=>{
  const l=learner(),tool='AWS (Bedrock, AgentCore)';l.profile.tools=[tool];l.profile.toolUses={[tool]:['use']};const options=()=>recommendations(bundle,l,100,pathLayers(bundle,l).find(x=>x.tool===tool)).map(r=>r.course.id);
  assert(!options().includes('TR-076'));assert(searchCourses(bundle,l,'TR-076').some(c=>c.id==='TR-076'));l.profile.toolUses[tool]=['build'];assert(options().includes('TR-076'));
});
test('unknown tool task fit and unanswered tasks never become tailored recommendations',()=>{
  const l=learner();l.profile.toolUses={};assert(needsRoleReview(l.profile));assert.throws(()=>validatePathChoices(l.profile),/what you do/);
  const layer=pathLayers(bundle,l).find(x=>x.kind==='tool');assert.deepEqual(recommendations(bundle,l,20,layer),[]);
  const b=structuredClone(bundle),c=b.catalogue.courses.find(c=>c.id==='TR-147');c.id='NEW-TOOL';l.profile.toolUses={'Microsoft 365 Copilot':['build']};assert(!recommendations(b,l,100,pathLayers(b,l).find(x=>x.kind==='tool')).some(r=>r.course.id==='NEW-TOOL'));assert(searchCourses(b,l,'NEW-TOOL').length);
});
test('legacy custom central scope migrates exactly, preserving all learning and feedback history',()=>{
  const b=customBundle();assert.doesNotThrow(()=>validateCentralScenario(b.scenario,b));const l=learner();delete l.profile.pathVersion;l.profile.groupId='iam';const before=personalRecords(l);migrateLearner(b,l);
  assert.deepEqual(l.profile.centralScope.added,['N13.2']);assert.deepEqual(l.profile.centralScope.removed,['R9.1.7']);
  assert.deepEqual(ids(requirementsFor(b,l)),ids(cumulativeScope(b.catalogue,b.scenario,b.scenario.cohorts.find(g=>g.id==='iam'))));assert.deepEqual(records(l),before);assert.deepEqual(validateBackup(l),l);const once=structuredClone(l);migrateLearner(b,l);assert.deepEqual(l,once);
});
test('1.2 migration retains confirmed level, flags a different old work goal and asks tool tasks',()=>{
  const l=learner();l.profile.pathVersion=3;l.profile.levelGoal=3;const before=personalRecords(l);migrateLearner(bundle,l);assert.equal(l.profile.level,1);assert.deepEqual(l.profile.targetReview,{previousGoal:3,confirmedLevel:1});assert.deepEqual(l.profile.toolUses,{});assert(needsRoleReview(l.profile));assert.deepEqual(records(l),before);assert.doesNotThrow(()=>validateBackup(l));
  const noGoal=learner();noGoal.profile.pathVersion=3;delete noGoal.profile.levelGoal;migrateLearner(bundle,noGoal);assert.equal(noGoal.profile.targetReview,null);assert.doesNotThrow(()=>validateBackup(noGoal));
});
test('central scope snapshot includes ancestor customization and does not import unrelated profile scope',()=>{
  const b=customBundle(),entry=b.scenario.cohorts.find(g=>g.id==='entry');entry.addedRequirements=['N13.3'];syncNeeds(b.catalogue,b.scenario);
  assert.deepEqual(captureCentralScope(b,'iam').added,['N13.2','N13.3']);const l=learner();assert(!ids(requirementsFor(b,l)).has('N13.2'));assert(!ids(requirementsFor(b,l)).has('N13.3'));
  l.profile=applyScopeChoice(b,l.profile,'iam');assert(ids(requirementsFor(b,l)).has('N13.2'));assert(!ids(requirementsFor(b,l)).has('R9.1.7'));
});
test('central revisions and missing sources preserve saved scope until explicitly accepted',()=>{
  const b=customBundle(),l=learner();l.profile=applyScopeChoice(b,l.profile,'iam');const before=personalRecords(l),saved=structuredClone(l.profile.centralScope);
  const g=b.scenario.cohorts.find(g=>g.id==='iam');g.addedRequirements=['N13.3'];g.removedRequirements=[];syncNeeds(b.catalogue,b.scenario);const diff=scopeDifference(b,l.profile);assert(diff);assert.deepEqual(diff.current.added,['N13.3']);
  l.profile=applyScopeChoice(b,l.profile,'iam');assert.deepEqual(l.profile.centralScope,saved);assert(ids(requirementsFor(b,l)).has('N13.2'));assert(!ids(requirementsFor(b,l)).has('R9.1.7'));assert.deepEqual(records(l),before);
  const changed=structuredClone(b);changed.scenario.id='replacement-scenario';assert(scopeDifference(changed,l.profile).missing);assert(scopeDifference(changed,l.profile).current);changed.scenario.cohorts=changed.scenario.cohorts.filter(g=>g.id!=='iam');assert.equal(scopeDifference(changed,l.profile).current,null);assert(ids(requirementsFor(changed,l)).has('N13.2'));
  l.profile.centralScope=diff.current;assert(!ids(requirementsFor(b,l)).has('N13.2'));assert(ids(requirementsFor(b,l)).has('N13.3'));assert(ids(requirementsFor(b,l)).has('R9.1.7'));assert.equal(scopeDifference(b,l.profile),null);assert.deepEqual(records(l),before);
});
test('explicit scope additions and removals drive applicable activity questions',()=>{
  const l=learner();l.profile.centralScope={...captureCentralScope(bundle,'iam'),added:['N11.3','R6.1.2']};assert.deepEqual(new Set(applicableActivities(l.profile).map(a=>a.id)),new Set(['automated-judges','ai-assisted-assurance']));
  l.profile=setWorkTarget(l.profile,3);l.profile.centralScope={...l.profile.centralScope,added:[],removed:['N11.3']};assert.equal(applicableActivities(l.profile).length,0);
});
test('v4 backups validate purposes and saved scope while accepting unfinished migration',()=>{
  const l=learner();assert.doesNotThrow(()=>validateBackup(l));for(const toolUses of [[],{'Unselected tool':['use']},{'Microsoft 365 Copilot':['invalid']},{'Microsoft 365 Copilot':['use','use']}])assert.throws(()=>validateBackup({...l,profile:{...l.profile,toolUses}}),/tool purpose/);
  const scope=captureCentralScope(bundle,'iam');for(const centralScope of [{...scope,added:['N999']},{...scope,added:['N13.2'],removed:['N13.2']},{...scope,removed:['R9.1.7','R9.1.7']}])assert.throws(()=>validateBackup({...l,profile:{...l.profile,centralScope}}),/central outcome scope/);
  l.profile.toolUses={};assert.doesNotThrow(()=>validateBackup(l));
});
test('L1 vendor evaluation labels and filters use specialist context rather than L3',()=>{
  const l=learner();Object.assign(l.profile,{roles:[9],roleResponsibilities:{9:['vendor-evaluation']}});syncRoleProfile(l.profile);
  for(const id of ['TR-108','TR-182']){const c=bundle.catalogue.courses.find(c=>c.id===id),labels=displayTracks(bundle,l,c);assert.equal(labels[0],'Specialist');assert(!labels.includes('L3'));assert(searchCourses(bundle,l,id,{track:'Specialist'}).some(c=>c.id===id));assert.equal(searchCourses(bundle,l,id,{track:'L3'}).length,0);}
  const row=coverage(bundle,l).rows.find(r=>r.id==='level-3');assert.equal(row.applicable,false);assert.equal(row.requirements.length,0);assert(ids(coverage(bundle,l).rows.find(r=>r.id==='role:9').requirements).has('N11.4'));
});
