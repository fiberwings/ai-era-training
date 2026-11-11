import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prepareCentralScenario} from '../src/published-pathways.js';
import {newLearner,centralIds,internalItems,centralReviewStatus,centralReference,hoursFor,displayTracks,coverage,requirementsFor,setStatus,validateBackup,validateCentralScenario,updateDifference,recommendations} from '../src/core.js';
import {pathLayers,migrateLearner,quickPathProfile} from '../src/layers.js';
import {pathMetrics} from '../../training-planner/public/components.js';
const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
const source=load('../../recommended-pathways/Recommended-Training-Pathways.json');
const catalogue=load('../../training-planner/public/data/catalogue.json');
// A pre-retirement catalogue: the live one plus TR-229 restored as an active course.
const retired229=catalogue.retiredCourses.find(c=>c.id==='TR-229');
const preRetirement={...catalogue,version:'pre-retirement',courses:[...catalogue.courses,{...catalogue.courses[0],id:'TR-229',title:retired229.title}],retiredCourses:catalogue.retiredCourses.filter(c=>c.id!=='TR-229')};
const bundle={catalogue,scenario:prepareCentralScenario(source,catalogue),scenarioVersion:'pathways-v'+source.publication.version,config:{}};
const sorted=xs=>[...xs].sort();
function audienceLearner(a){
 const l=newLearner(bundle),roles=source.publication.roles.filter(r=>r.audiences.includes(a.id)).map(r=>r.id);
 l.profile=quickPathProfile(l.profile,{level:Math.max(1,a.level),roles:roles.length?roles:[7],tools:['OpenAI ChatGPT'],codingReady:true});
 l.profile.groupId=a.id;
 l.profile.roleResponsibilities=Object.fromEntries(l.profile.roles.map(id=>[id,[...a.specialisms]]));
 l.profile.specialisms=[...a.specialisms];l.profile.activityAnswers=Object.fromEntries(a.activities.map(id=>[id,true]));
 l.profile.activities=[...a.activities];l.profile.learningRoute=a.id.includes('coached')?'coached':'standard';
 return l;
}

test('publishing retains the component source and rebuilds compatibility views on import',()=>{
 const snapshot=JSON.stringify(source);assert.equal(bundle.scenario.schema,3);
 assert.deepEqual(bundle.scenario.components,source.components);assert.deepEqual(bundle.scenario.audiences,source.audiences);
 const reimport=structuredClone(bundle.scenario);reimport.cohorts[0].selected=['TR-229'];
 assert.deepEqual(prepareCentralScenario(reimport,catalogue),bundle.scenario);
 assert.equal(JSON.stringify(source),snapshot);
 const invalid=structuredClone(source);invalid.components[0].selected.push('missing');assert.throws(()=>validateCentralScenario(invalid,bundle),/unresolved/);
 assert.throws(()=>validateCentralScenario({...source,catalogueVersion:'stale'},bundle),/Review/);
});
test('standard L1-L3 audience paths match planner selections, internal activities, scope and assessed coverage',()=>{
 for(const a of source.audiences.filter(a=>a.level>0&&!a.id.includes('coached'))){
  const l=audienceLearner(a),expected=pathMetrics(catalogue,source,a);
  assert.deepEqual(sorted(centralIds(bundle,l)),sorted(expected.ids),a.id+' courses');
  assert.deepEqual(sorted(internalItems(bundle,l).map(i=>i.originalId)),sorted(expected.items.map(i=>i.id)),a.id+' practice');
  assert.deepEqual(sorted(requirementsFor(bundle,l).map(r=>r.id)),sorted(expected.requirements.map(r=>r.id)),a.id+' scope');
  assert.ok(Math.abs(coverage(bundle,l,'central').total.coverage-expected.coverage)<1e-12,a.id+' assessed coverage');
 }
});
test('Foundation/L1 carries the reviewed bundle once and keeps internal training Proposed',()=>{
 const l=audienceLearner(source.audiences.find(a=>a.id==='l1-path'));
 assert.deepEqual(centralIds(bundle,l),['TR-281','TR-145']);
 const internal=internalItems(bundle,l);assert.equal(internal.length,1);assert.equal(internal[0].title,'AI use cases');assert.equal(internal[0].status,'Proposed');assert.equal(internal[0].hours,1);
 for(const id of [...centralIds(bundle,l),internal[0].id])assert.equal(centralReviewStatus(bundle,l,id),'Reviewed');
 assert.throws(()=>setStatus(bundle,l,internal[0].id,'completed'),/not ready/);
 assert.equal(pathLayers(bundle,l).find(l=>l.kind==='level').reviewStatus,'Reviewed');
});
test('broad roles select combined specialist branches without adding alternative exercises',()=>{
 const examples=[[5,['IH-ARCH','IH-INFRA'],['IH-SEC']],[6,['IH-BISO'],['IH-GRC']],[8,['IH-IAM','IH-IAM-D'],[]],[3,['IH-RED'],['IH-TEST']]];
 for(const [role,expected,absent] of examples){const l=newLearner(bundle);l.profile=quickPathProfile(l.profile,{level:3,roles:[role],tools:['OpenAI ChatGPT']});const ids=internalItems(bundle,l).map(i=>i.originalId);for(const id of expected)assert.ok(ids.includes(id));for(const id of absent)assert.ok(!ids.includes(id));assert.equal(ids.length,new Set(ids).size);}
});
test('legacy coached preference remains backup-compatible without changing standard recommendations or commitments',()=>{
 const l=audienceLearner(source.audiences.find(a=>a.id==='l3-path'));
 setStatus(bundle,l,'TR-198','planned');const before=structuredClone(l.items);l.profile.learningRoute='coached';
 const ids=centralIds(bundle,l);assert.ok(ids.includes('TR-198'));assert.ok(ids.includes('TR-100'));assert.ok(!internalItems(bundle,l).some(i=>i.originalId==='COACH-L3'));
 assert.deepEqual(l.items,before);assert.equal(validateBackup(l).profile.learningRoute,'coached');
 l.profile.learningRoute='invented';assert.throws(()=>validateBackup(l),/learning route/);
});
test('new central publication preserves old completions, feedback, notes and saved scope',()=>{
 const old={...bundle,catalogue:preRetirement,scenario:load('../../training-planner/tests/fixtures/default-before-v16-retirements.json'),scenarioVersion:'old'};
 const l=newLearner(old);l.profile=quickPathProfile(l.profile,{level:3,roles:[5],tools:['OpenAI ChatGPT']});
 setStatus(old,l,'TR-229','completed');l.items['TR-229'].notes='Keep these notes';l.formsDisabled=true;
 l.profile.centralScope={scenarioId:old.scenario.id,groupId:'architecture',groupName:'Architecture',added:[],removed:['N12.1']};
 l.feedback=[{courseId:'TR-229',originalContext:'retained'}];
 const before=structuredClone(l);migrateLearner(bundle,l);assert.deepEqual(l,before);
 assert.ok(updateDifference(bundle,l).changed);assert.ok(updateDifference(bundle,l).removed.includes('TR-229'));
 assert.ok(!centralIds(bundle,l).includes('TR-229'));
 assert.ok(recommendations(bundle,l,100).every(r=>!['TR-229','TR-127'].includes(r.course.id)));
});
test('distributed HTML embeds the maintained recommendation with review and delivery statuses',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const data=JSON.parse(html.match(/id="learning-data">([\s\S]*?)<\/script>/)[1]);
 assert.equal(data.scenario.id,source.id);assert.deepEqual(data.scenario.components,source.components);assert.equal(data.scenario.schema,3);
 assert.equal(data.config.appVersion,load('../config.json').appVersion);assert.ok(data.scenario.components.every(c=>!c.selected.includes('TR-229')));
});

test('approved core resources retain a separate review from the pending component',()=>{
 const l=audienceLearner(source.audiences.find(a=>a.id==='security'));
 for(const id of ['TR-109','TR-110','TR-117'])assert.equal(centralReviewStatus(bundle,l,id),'Reviewed',id);
 assert.equal(centralReviewStatus(bundle,l,'INT-194'),'AI recommendation - to be reviewed');
 assert.equal(centralReviewStatus(bundle,l,'TR-100'),'AI recommendation - to be reviewed');
 assert.equal(pathLayers(bundle,l).find(l=>l.kind==='level').reviewStatus,'AI recommendation - to be reviewed');
 assert.match(centralReference(bundle,l,'TR-117').evidenceNote,/v2026.10/);
 for(const id of ['TR-109','TR-117'])assert.deepEqual(displayTracks(bundle,l,catalogue.courses.find(c=>c.id===id)),['Specialist'],'do not label specialist assignments as Foundation because of incidental evidence');
 const imported=structuredClone(source);for(const c of imported.components)delete c.courseReviews;
 const custom={...bundle,scenario:prepareCentralScenario(imported,catalogue)};
 assert.equal(centralReviewStatus(custom,l,'TR-117'),'AI recommendation - to be reviewed');
 assert.equal(centralReference(custom,l,'TR-117'),null);
});
test('core knowledge follows responsibilities at L1 and does not pull in L2 learning',()=>{
 for(const [audience,expected] of [['threat-intelligence',['TR-117']],['testing',['TR-109','TR-110','TR-117']],['architecture',['TR-109','TR-110','TR-117']],['governance',['TR-118']],['idp',['TR-118']],['iam',['TR-110']]]){
  const l=audienceLearner(source.audiences.find(a=>a.id===audience));l.profile.level=1;
  const ids=centralIds(bundle,l);for(const id of expected){assert.ok(ids.includes(id),audience+' '+id);assert.equal(centralReviewStatus(bundle,l,id),'Reviewed');}
  assert.ok(!ids.includes('TR-100'));assert.ok(!ids.includes('TR-198'));assert.equal(ids.length,new Set(ids).size);
 }
 const foundation=audienceLearner(source.audiences.find(a=>a.id==='l1-path'));
 assert.equal(centralReference(bundle,foundation,'TR-109'),null);
});
test('ATLAS and NIST remain unknown time and shared resources are counted once',()=>{
 for(const id of ['TR-117','TR-118'])assert.equal(hoursFor(bundle,catalogue.courses.find(c=>c.id===id)),null);
 const a=source.audiences.find(a=>a.id==='architecture'),m=pathMetrics(catalogue,source,a);
 assert.equal(m.ids.filter(id=>id==='TR-110').length,1);assert.equal(m.total.unknown,1);
 assert.equal(catalogue.courses.find(c=>c.id==='TR-117').scores['N5.7'].score,0,'authoritative reading does not invent threat-intelligence assessment credit');
 const guide=fs.readFileSync(new URL('../../recommended-pathways/Recommended-Training-Pathways.md',import.meta.url),'utf8');
 assert.match(guide,/time to confirm \(1 resource\)/);
});
test('a new central publication adds options without changing saved completions, notes, feedback or scope',()=>{
 // The earlier publication: the current one without two core references.
 const previous=structuredClone(source),dropped=['TR-109','TR-117'];
 for(const c of previous.components){c.selected=c.selected.filter(id=>!dropped.includes(id));if(c.courseReviews)for(const id of dropped)delete c.courseReviews[id];}
 previous.publication.coreReferences=previous.publication.coreReferences.filter(r=>!dropped.includes(r.courseId));
 const old={...bundle,scenario:prepareCentralScenario(previous,catalogue),scenarioVersion:'previous'};
 const l=audienceLearner(source.audiences.find(a=>a.id==='security'));
 l.acknowledged=`${old.catalogue.version}:${old.scenario.id}:${old.scenarioVersion}`;
 setStatus(old,l,'INT-194','completed');l.items['INT-194'].notes='Retain notes';l.feedback=[{courseId:'INT-194',originalContext:'retained'}];
 const before=structuredClone(l);migrateLearner(bundle,l);assert.deepEqual(l,before);
 const delta=updateDifference(bundle,l);assert.ok(delta.changed);assert.ok(delta.added.includes('TR-109'));assert.ok(delta.added.includes('TR-117'));
 assert.deepEqual(l.items,before.items);assert.deepEqual(l.feedback,before.feedback);
});
