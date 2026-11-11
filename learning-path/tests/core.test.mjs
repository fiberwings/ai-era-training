import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {newLearner,requirementsFor,centralIds,internalItems,courseMap,sourceFor,setStatus,coverage,recommendations,progress,searchCourses,validateBackup,validateCentralScenario,updateDifference,FEEDBACK_FIELDS,feedbackUrl,validateFormsTemplate,parseCSV,feedbackFromRows,summariseFeedback,reviewedSummary,exportPlan,assessment,CHECKS,displayTracks,hoursFor,requiresCoding} from '../src/core.js';
import {cumulativeScope,selectedIds} from '../../training-planner/public/cohorts.js';
import {measure} from '../../training-planner/public/scoring.js';
const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const bundle={catalogue:load('../../training-planner/public/data/catalogue.json'),scenario:load('../../training-planner/public/data/default-scenario.json'),scenarioVersion:'test',config:{}};
function learner(group='entry'){const l=newLearner(bundle);delete l.profile.pathVersion;delete l.profile.level;delete l.profile.levelGoal;l.profile.groupId=group;return l;}
function sampleFeedback(overrides={}){return {id:'response-1',courseId:'TR-001',courseTitle:'An AI course',groupId:'entry',groupName:'AI-assisted work',catalogueVersion:bundle.catalogue.version,completedOn:'2026-10-30',usefulness:4,difficulty:'About right',actualHours:1.5,comment:'Useful & practical: café + testing / "notes"',...overrides};}
function template(){const u=new URL('https://forms.office.com/Pages/ResponsePage.aspx?id=example');FEEDBACK_FIELDS.forEach((k,i)=>u.searchParams.set(`r${i}`,`{{${k}}}`));return u.href;}

test('all 23 group targets and central selections agree with the existing builder',()=>{
  assert.equal(bundle.scenario.cohorts.length,23);
  for(const group of bundle.scenario.cohorts){const l=learner(group.id),expected=cumulativeScope(bundle.catalogue,bundle.scenario,group);assert.deepEqual(requirementsFor(bundle,l).map(r=>[r.id,r.core]).sort(),expected.map(r=>[r.id,r.core]).sort(),group.id);assert.deepEqual(centralIds(bundle,l),selectedIds(bundle.scenario,group));}
});
test('central coverage agrees exactly with the source scoring for every group',()=>{
  for(const group of bundle.scenario.cohorts){const l=learner(group.id),ids=selectedIds(bundle.scenario,group);const expected=measure(cumulativeScope(bundle.catalogue,bundle.scenario,group),bundle.catalogue.courses.filter(c=>ids.includes(c.id)),bundle.catalogue.thresholds);const actual=coverage(bundle,l,'central').total;assert.equal(actual.coverage,expected.coverage,group.id);assert.equal(actual.critical,expected.critical,group.id);}
});
test('coverage is conditional on the target group and source activities',()=>{
  const iam=coverage(bundle,learner('iam'),'central');assert.equal(iam.rows.find(x=>x.name==='L3').applicable,false);assert(iam.rows.some(x=>x.track==='Specialist'));
  const technical=requirementsFor(bundle,learner('technical'));assert.equal(technical.find(r=>r.id==='N11.3').core,true);
  const leadership=requirementsFor(bundle,learner('leadership'));assert(leadership.some(r=>r.id==='N11.4'));assert.equal(coverage(bundle,learner('leadership'),'central').rows.find(x=>x.name==='L3').applicable,false);
});
test('central assignment and personal status stay independent',()=>{
  const l=learner(),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'planned');assert.equal(sourceFor(bundle,l,id),'central');setStatus(bundle,l,id,'completed');assert.equal(sourceFor(bundle,l,id),'central');assert.equal(l.items[id].status,'completed');assert.equal(centralIds(bundle,l).filter(x=>x===id).length,1);
});
test('completion keeps its learning group and catalog provenance when the profile changes',()=>{
  const l=learner('entry'),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'completed');const context=structuredClone(l.items[id].completionContext);l.profile.groupId='technical';setStatus(bundle,l,id,'completed');assert.deepEqual(l.items[id].completionContext,context);assert.equal(context.groupId,'entry');assert.equal(context.catalogueVersion,bundle.catalogue.version);assert.doesNotThrow(()=>validateBackup(l));
});
test('unselected catalog offerings never claim to be added by the learner',()=>{
  const l=learner(),c=bundle.catalogue.courses.find(c=>!centralIds(bundle,l).includes(c.id)&&c.review!=='Needs delivery validation');assert.equal(sourceFor(bundle,l,c.id),'catalog');setStatus(bundle,l,c.id,'planned','catalog');assert.equal(sourceFor(bundle,l,c.id),'personal');assert.doesNotThrow(()=>validateBackup(l));
});
test('central course badges show assigned tracks, not every incidental topic',()=>{
  const l=learner('governance'),g=bundle.scenario.cohorts.find(g=>g.id==='practitioner'),course=bundle.catalogue.courses.find(c=>c.id===g.selected[0]);assert.deepEqual(displayTracks(bundle,l,course),['L2']);
});
test('optional suggestions respect a small weekly budget and diversify tool choices',()=>{
  const l=learner('governance');l.profile.tools=['OpenAI ChatGPT'];l.profile.answers={verify:1,safe:2,agent:1};const rs=recommendations(bundle,l,8);assert(rs.slice(0,4).every(r=>r.course.track==='tool'||hoursFor(bundle,r.course)<=8));assert(rs.filter(x=>x.course.track==='tool'&&x.course.tool==='OpenAI ChatGPT').length<=2);
});
test('recorded coding prerequisites gate optional suggestions, not target level or central plans',()=>{
  const l=learner('technical'),ids=centralIds(bundle,l);assert.equal(l.profile.codingReady,false);assert(recommendations(bundle,l,100).every(r=>!requiresCoding(r.course)));l.profile.codingReady=true;assert.deepEqual(centralIds(bundle,l),ids);assert.equal(coverage(bundle,l).rows.find(r=>r.name==='L3').applicable,true);assert(requiresCoding({description:'Python and Git familiarity recommended.'}));assert(!requiresCoding({description:'No technical background required.'}));
});
test('personal coverage excludes saved and deferred learning; completion is separate',()=>{
  const l=learner(),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'saved');assert.equal(coverage(bundle,l).total.coverage,0);setStatus(bundle,l,id,'planned');const selected=coverage(bundle,l).total.coverage;assert(selected>0);assert.equal(coverage(bundle,l,'completed').total.coverage,0);setStatus(bundle,l,id,'completed');assert.equal(coverage(bundle,l,'completed').total.coverage,selected);setStatus(bundle,l,id,'deferred');assert.equal(coverage(bundle,l).total.coverage,0);
});
test('a brief knowledge check never changes target requirements or central selections',()=>{
  const l=learner('iam'),before=requirementsFor(bundle,l).map(r=>r.id),ids=centralIds(bundle,l);for(const q of CHECKS)l.profile.answers[q.id]=q.correct;assert.equal(assessment(l).correct,CHECKS.length);assert.deepEqual(requirementsFor(bundle,l).map(r=>r.id),before);assert.deepEqual(centralIds(bundle,l),ids);assert.equal(coverage(bundle,l).total.coverage,0);
});
test('new responsibilities extend targets without changing central assignments',()=>{
  const l=learner('entry'),before=centralIds(bundle,l);l.profile.specialisms=['agent-forensics'];assert(requirementsFor(bundle,l).some(r=>r.id==='R1.2.1'));assert.deepEqual(centralIds(bundle,l),before);
});
test('proposed internal sessions cannot be committed and never earn score',()=>{
  const l=learner(),item=internalItems(bundle,l).find(x=>x.status==='Proposed');assert(item);assert.throws(()=>setStatus(bundle,l,item.id,'planned'),/not ready/);setStatus(bundle,l,item.id,'saved');assert.equal(coverage(bundle,l).total.coverage,0);
});
test('unassessed tool training remains selectable without invented coverage',()=>{
  const l=learner(),c=bundle.catalogue.courses.find(c=>c.track==='tool');l.profile.tools=[c.tool];setStatus(bundle,l,c.id,'completed');const cv=coverage(bundle,l,'completed');assert.equal(cv.total.coverage,0);assert.equal(cv.rows.find(r=>r.tool).completed,1);assert.equal(cv.rows.find(r=>r.tool).needs.length,0);
});
test('recommendations are relevant, omit existing commitments and honour exclusions',()=>{
  for(const group of bundle.scenario.cohorts){const l=learner(group.id),suggestions=recommendations(bundle,l,20),central=centralIds(bundle,l);for(const {course} of suggestions){assert(!central.includes(course.id));assert(!group.excluded.includes(course.id));assert.notEqual(course.review,'Needs delivery validation');assert.notEqual(course.review,'Rejected');assert(Object.values(course.scores).some(s=>s.score>=2));}}
  const l=learner(),first=recommendations(bundle,l,1)[0]?.course;if(first){setStatus(bundle,l,first.id,'completed');assert(!recommendations(bundle,l,50).some(r=>r.course.id===first.id));}
});
test('tool recommendations require a selected tool and keep their assessment label',()=>{
  const l=learner();assert(recommendations(bundle,l,100).every(x=>x.course.track!=='tool'));l.profile.tools=['OpenAI ChatGPT'];const suggestions=recommendations(bundle,l,100).filter(x=>x.course.track==='tool');assert(suggestions.length);assert(suggestions.every(x=>x.reason.includes('unassessed')));
});
test('tool metadata cannot bypass automatic exam-only exclusions',()=>{
  const l=learner();l.profile.tools=[...new Set(bundle.catalogue.courses.filter(c=>c.track==='tool').map(c=>c.tool))];for(const {course:c} of recommendations(bundle,l,1000)){assert(!['Certification','Practice tests'].includes(c.type));assert(!/^Exam$/i.test(c.type));assert(!/^Exam$/i.test(c.format));}
});
test('unknown hours stay unresolved and shared courses count once',()=>{
  const l=learner(),c=bundle.catalogue.courses.find(c=>c.track==='tool'&&c.duration==='Not stated');assert(c);setStatus(bundle,l,c.id,'planned');setStatus(bundle,l,c.id,'planned');const p=progress(bundle,l);assert.equal(p.total,1);assert.equal(p.unknown,1);assert.equal(p.known,0);
});
test('search spans course title, ID, tools and provider, with honest short-course filter',()=>{
  const l=learner();assert(searchCourses(bundle,l,'TR-001').some(c=>c.id==='TR-001'));assert(searchCourses(bundle,l,'MCP').length);assert(searchCourses(bundle,l,'OpenAI ChatGPT').some(c=>c.track==='tool'));assert.equal(searchCourses(bundle,l,'nonexistentexactword123').length,0);assert(searchCourses(bundle,l,'',{short:true}).every(c=>c.duration!=='Not stated'));
});
test('backups preserve learning history, dates, notes, source and feedback',()=>{
  const l=learner(),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'completed');l.items[id].notes='My own notes & <examples>';l.items[id].dueDate='2026-11-20';l.feedback=[sampleFeedback()];assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(l))),l);
});
test('unsafe or malformed backup fields are rejected before import',()=>{
  const l=learner(),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'planned');l.items[id].source='" onclick="alert(1)';assert.throws(()=>validateBackup(l),/invalid/);l.items[id].source='central';l.profile.weeklyHours=0;assert.throws(()=>validateBackup(l),/invalid/);assert.throws(()=>validateBackup({}),/supported/);
});
test('new releases flag updates and retain archived course history',()=>{
  const l=learner(),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'completed');const original=structuredClone(l.items);const b={...bundle,scenarioVersion:'new-version',catalogue:{...bundle.catalogue,courses:bundle.catalogue.courses.filter(c=>c.id!==id)}};const diff=updateDifference(b,l);assert(diff.changed);assert(diff.unresolved.includes(id));assert.deepEqual(l.items,original);
});
test('central-plan imports reject obsolete models, unresolved IDs and stale catalog versions',()=>{
  assert.doesNotThrow(()=>validateCentralScenario(bundle.scenario,bundle));assert.throws(()=>validateCentralScenario({...bundle.scenario,schema:1},bundle),/current/);assert.throws(()=>validateCentralScenario({...bundle.scenario,catalogueVersion:'old'},bundle),/Review/);const s=structuredClone(bundle.scenario);s.cohorts[0].selected.push('missing');assert.throws(()=>validateCentralScenario(s,bundle),/unresolved/);
});
test('Microsoft Forms prefills every field and correctly encodes special characters',()=>{
  const f=sampleFeedback(),url=new URL(feedbackUrl(template(),f));assert.equal(url.searchParams.get('r0'),f.courseId);assert.equal(url.searchParams.get('r9'),f.comment);assert.equal(url.searchParams.get('r10'),f.id);assert.equal(url.searchParams.get('r8'),'1.5');assert(!decodeURIComponent(url.href).includes('{{'));assert.equal(url.searchParams.get('id'),'example');
});
test('Forms connections reject other hosts and incomplete prefill templates',()=>{
  assert.throws(()=>validateFormsTemplate('javascript:alert(1)'),/HTTPS/);assert.throws(()=>validateFormsTemplate(template().replace('forms.office.com','forms.office.com.evil.example')),/HTTPS/);assert.throws(()=>validateFormsTemplate('https://forms.office.com/r/example'),/placeholders/);
});
test('CSV parser handles Excel BOM, quoted commas and multiline feedback',()=>{
  const rows=parseCSV('\uFEFFCOURSE_ID,COMMENT\r\nTR-001,"Good, useful\nTwo lines and ""quotes"""\r\n');assert.equal(rows[0].COMMENT,'Good, useful\nTwo lines and "quotes"');assert.throws(()=>parseCSV('A,A\n1,2'),/duplicate/);assert.throws(()=>parseCSV('A\n"bad'),/Unclosed/);
});
test('Forms response columns convert to validated feedback',()=>{
  const f=sampleFeedback(),u=new URL(feedbackUrl(template(),f));const row=Object.fromEntries(FEEDBACK_FIELDS.map((k,i)=>[k,u.searchParams.get(`r${i}`)]));const parsed=feedbackFromRows([row]);assert.equal(parsed[0].usefulness,4);assert.equal(parsed[0].comment,f.comment);
});
test('central review deduplicates repeated response IDs and separates groups and versions',()=>{
  const a=sampleFeedback(),b=sampleFeedback({id:'response-2',groupId:'technical',groupName:'Builders',actualHours:2});const summary=summariseFeedback([a,b,{...a,usefulness:5}],bundle);assert.equal(summary.responses.length,2);assert.equal(summary.groups.length,2);assert.equal(summary.groups.find(g=>g.groupId==='entry').usefulness,5);
});
test('published feedback strips free text and identities',()=>{
  const summary=reviewedSummary([sampleFeedback()],bundle);assert(summary.reviewed);assert.equal(summary.courses[0].count,1);assert(!JSON.stringify(summary).includes('response-1'));assert(!JSON.stringify(summary).includes('café'));assert(!JSON.stringify(summary).includes('groupName'));
});
test('plan CSV protects spreadsheet formulas in learner notes',()=>{
  const l=learner(),id=centralIds(bundle,l)[0];setStatus(bundle,l,id,'planned');l.items[id].notes='=HYPERLINK("bad")';const csv=exportPlan(bundle,l);assert(csv.includes("'=HYPERLINK"));assert(csv.includes('Learning group'));
});
test('standalone embeds all offers, exact scores and evidence with no runtime imports',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const data=JSON.parse(html.match(/id="learning-data">([\s\S]*?)<\/script>/)[1]);assert.equal(data.catalogue.courses.length,bundle.catalogue.courses.length);assert.equal(data.catalogue.version,bundle.catalogue.version);for(const original of bundle.catalogue.courses){const c=data.catalogue.courses.find(x=>x.id===original.id);assert(c);for(const [id,s] of Object.entries(original.scores)){assert.equal(c.scores[id][0],s.score);assert.equal(data.notes[c.scores[id][1]],s.evidence||'');}}
  assert(!/<script[^>]+src=/.test(html));assert(!/<link[^>]+(?:stylesheet|font)/.test(html));assert(!/^import\s/m.test(html));assert(html.includes('Learning coverage'));
});
