import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prepareCentralScenario} from '../src/published-pathways.js';
import {newLearner,centralIds,internalItems,centralReviewStatus,coverage,requirementsFor,setStatus,validateBackup,validateCentralScenario,updateDifference,recommendations} from '../src/core.js';
import {pathLayers,migrateLearner,quickPathProfile} from '../src/layers.js';
import {pathMetrics} from '../../training-planner/public/components.js';
const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
const catalogue=load('../../training-planner/public/data/catalogue.json');
const source=load('../../recommended-pathways/Recommended-Training-Pathways.json');
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
 const old={...bundle,catalogue:load('../../training-planner/catalogue-history/ff6d5a46d0450171.json'),scenario:load('../../training-planner/scenario-history/default-before-v16-retirements.json'),scenarioVersion:'old'};
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
