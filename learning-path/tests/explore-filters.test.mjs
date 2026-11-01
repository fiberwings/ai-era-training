import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newLearner,searchCourses} from '../src/core.js';
import {prepareCentralScenario} from '../src/published-pathways.js';

const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const catalogue=load('../../training-planner/public/data/catalogue.json');
const bundle={catalogue,scenario:prepareCentralScenario(load('../../recommended-pathways/Recommended-Training-Pathways.json'),catalogue),scenarioVersion:'test',config:{}};
const ids=courses=>courses.map(c=>c.id).sort();

test('specialisation searches outside the profile, combines role responsibilities and requires teaching evidence',()=>{
  const learner=newLearner(bundle),before=structuredClone(learner);
  const course=(id,scores)=>({...catalogue.courses[0],id,scores:Object.fromEntries(Object.entries(scores).map(([key,score])=>[key,{score}]))});
  const fixture={...bundle,catalogue:{...catalogue,courses:[
    course('incident',{'R1.1.1':2}),course('forensics',{'R1.2.1':3}),
    course('mention-only',{'R1.1.1':1}),course('unassessed',{'R1.1.1':null}),
    course('general-risk',{'N5.1':2}),course('threat-tracking',{'N5.7':2}),
    course('unrelated',{'N13.1':3})
  ]}};
  const find=specialisation=>ids(searchCourses(fixture,learner,'',{specialisation}));
  assert.deepEqual(find('incident-response'),['incident']);
  assert.deepEqual(find('agent-forensics'),['forensics']);
  assert.deepEqual(find('role:1'),['forensics','incident']);
  assert.deepEqual(find('role:7'),['general-risk'],'awareness reuses Foundation risks, not specialist threat tracking');
  assert.deepEqual(find('role:2'),['threat-tracking']);
  assert.deepEqual(learner,before,'browsing does not change the saved profile or learning');
});

test('tool search uses recorded tool metadata and combines filters',()=>{
  const learner=newLearner(bundle),tool='OpenAI ChatGPT';
  const results=searchCourses(bundle,learner,'',{tool});
  assert(results.length>0);
  assert(results.every(c=>/chatgpt/i.test(c.tool)));
  assert(results.some(c=>c.track==='tool'));
  const c=results.find(c=>c.track==='tool');
  assert.deepEqual(ids(searchCourses(bundle,learner,c.id,{tool,provider:c.provider,type:c.type,track:'Tooling'})),[c.id]);
  const specialisation='ai-governance';
  const specialism=searchCourses(bundle,learner,'',{specialisation});
  assert.deepEqual(ids(searchCourses(bundle,learner,'',{specialisation,tool})),ids(specialism.filter(c=>results.some(r=>r.id===c.id))));
  assert.deepEqual(searchCourses(bundle,learner,'',{specialisation:'unknown-specialisation'}),[]);
  assert.deepEqual(searchCourses(bundle,learner,'',{tool:'unknown-tool'}),[]);
  assert.equal(searchCourses(bundle,learner).length,catalogue.courses.length);
});
