import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesToolPathway,toolBudgetFit} from '../public/tool-pathways.js';

test('tool discovery requires both product and recorded intended-task fit',()=>{
 const tool={tool:' Claude ',tasks:['use']},course={id:'TR-151',tool:'Anthropic Claude (assistant and Cowork)',scores:{}};
 assert.equal(matchesToolPathway(course,tool),true);
 assert.equal(matchesToolPathway({...course,tool:'OpenAI ChatGPT'},tool),false);
 assert.equal(matchesToolPathway(course,{...tool,tasks:['administer']}),false);
 assert.equal(matchesToolPathway({...course,id:'unknown'},tool),false);
 assert.equal(matchesToolPathway(course,{...tool,tool:''}),false);
 assert.deepEqual(course.scores,{});
});
test('tool budget checks count full-course hours and explicit overrides',()=>{
 const course={id:'test',duration:'2–4 hours'};
 assert.equal(toolBudgetFit(course,{hours:1,unknown:0},5),'Fits remaining component budget');
 assert.equal(toolBudgetFit(course,{hours:2,unknown:0},5),'Outside remaining component budget');
 assert.equal(toolBudgetFit(course,{hours:2,unknown:0},5,{test:3}),'Fits remaining component budget');
 assert.equal(toolBudgetFit(course,{hours:0,unknown:0},null),'Course budget unset');
});
test('unknown resource or existing-selection hours never claim tool budget fit',()=>{
 assert.match(toolBudgetFit({id:'test',duration:'Unknown'},{hours:0,unknown:0},8),/unresolved/);
 assert.match(toolBudgetFit({id:'test',duration:'1h'},{hours:0,unknown:1},8),/unresolved/);
});
