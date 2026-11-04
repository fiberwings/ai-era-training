import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const root = process.cwd();
const runtime = process.env.ARTIFACT_NODE_MODULES || '/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES ||= runtime;
const require = createRequire(path.join(runtime, '_resolver.cjs'));
const { PresentationFile, FileBlob } = require('@oai/artifact-tool');
const { GlobalFonts } = require('@napi-rs/canvas');
const skill = '/Users/cyberk/.codex/plugins/cache/openai-primary-runtime/presentations/26.1026.10807/skills/presentations';
const build = path.join(root, '.work/presentations/framework-training-decisions-20261104');
const final = path.join(root, 'presentations/AI-Era_Framework_Training-Decisions.pptx');
const reference = path.join(root, 'presentations/Agentic-Era_Workforce_Capability_Model_Briefing.pptx');
const font = 'IBM Plex Sans';
const C = { navy:'#13202E', paper:'#F6F4EF', orange:'#A24F19', bright:'#E8914F', grey:'#4A5563', muted:'#5E6773', rule:'#D8D1C4', pale:'#EBE6DC', steel:'#7E98AD', darkMuted:'#B7C3CE', darkRule:'#465361' };

await fs.mkdir(path.join(build, 'previews'), { recursive:true });
for (const weight of ['Regular','Bold']) GlobalFonts.registerFromPath(path.join(root, `presentations/source/capability-model-20261018/assets/IBMPlexSans-${weight}.ttf`));

// Adapt the actual seven source slides. Preserve their canvas, theme, master,
// title and footer objects, and the component/row/level geometry where useful.
const p = await PresentationFile.importPptx(await FileBlob.load(reference));
await fs.writeFile(path.join(build, 'reference-slide-3.png'), new Uint8Array(await (await p.export({slide:p.slides.items[2], format:'png', scale:1})).arrayBuffer()));
const imported = await p.inspect({select:'$.slides[*]', include:['id','index','layout','elements.id','elements.name','elements.position','elements.text']});
await fs.writeFile(path.join(build, 'reference-inspection.ndjson'), imported.ndjson);
p.slides.keep(imported.records.slice(0,7).map(r => r.id));
const records = imported.records.slice(0,7);
const sources = records.map(r => new Map(r.elements.map(e => [e.name, e])));
const slides = p.slides.items;

function old(i, name) { const r=sources[i].get(name); if (!r) throw new Error(`Missing source ${i+1}/${name}`); return p.resolve(r.id); }
function style(shape, size=26, color=C.navy, bold=false, align='left') {
  shape.text.style={typeface:font,fontSize:size,color,bold,insets:0,autoFit:'none',wrap:'square',verticalAlignment:'top',alignment:align};
  return shape;
}
function edit(i,name,value,x,y,w,h,size=26,color=C.navy,bold=false,align='left') {
  const a=old(i,name); if(value!==null) a.text=value;
  a.position={left:x,top:y,width:w,height:h};
  if(value!==null) style(a,size,color,bold,align);
  return a;
}
function keep(i, names) {
  const retained=new Set(['title','subtitle','page-number','draft-for-discussion',...names]);
  p.delete(records[i].elements.filter(e=>!retained.has(e.name)).map(e=>e.id));
}
function text(s,name,value,x,y,w,h,size=26,color=C.navy,bold=false,align='left') {
  const a=s.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  a.text=value; return style(a,size,color,bold,align);
}
function line(s,name,x,y,w,color=C.rule,weight=1,h=0) {
  return s.shapes.add({geometry:'line',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:color,width:weight,style:'solid'}});
}
function arrow(s,name,x,y,w,h=0,color=C.orange) {
  return s.shapes.add({geometry:'connector',kind:'straight',name,position:{left:x,top:y,width:w,height:h},line:{fill:color,width:2},tail:{type:'triangle',width:'sm',length:'sm'}});
}
function header(i,title,subtitle,dark=false) {
  edit(i,'title',title,72,60,1136,70,44,dark?C.paper:C.navy,true);
  if (subtitle) edit(i,'subtitle',subtitle,72,143,1136,65,26,dark?C.darkMuted:C.grey);
}
function notes(s,body) {
  s.speakerNotes.text=body+'\n\nAuthoritative source: capability-framework/Agentic-Era_Workforce_Capability_Model.md, model 2 revision 3, current catalogue v17 snapshot 8bffc898c371360e. The model and its outcome applicability are unchanged. Detailed labels and mappings cross-checked against training-planner/public/capability-model.js and model-explanation.js.\nDesign and reused slide objects: presentations/Agentic-Era_Workforce_Capability_Model_Briefing.pptx, slides 1–7. Content follows the user-reviewed seven-slide skeleton, 4 November 2026.';
}

// 1. The reference model supports concrete training decisions.
{
  const s=slides[0]; keep(0,[]);
  edit(0,'title','The framework\nA reference for training decisions',72,64,1136,139,50,C.paper,true);
  text(s,'purpose','A common reference for discussing what staff need to learn\nand choosing or building the training to support it.',72,225,1136,87,28,C.darkMuted);
  const cols=[
    [72,'Who learns\nwhat','Match capabilities to\nthe work people will do.'],
    [466,'Which training\nfits','Compare learning options\nagainst defined needs.'],
    [860,'What we need\nto build','Identify internal learning\nand practice to develop.']
  ];
  cols.forEach(([x,title,body],i)=>{
    line(s,`decision-rule-${i}`,x,354,346,C.darkRule,2);
    text(s,`decision-title-${i}`,title,x,380,346,91,34,C.paper,true);
    text(s,`decision-body-${i}`,body,x,493,346,86,26,C.darkMuted);
  });
  text(s,'date','4 November 2026',72,675,700,24,16,C.darkMuted);
  notes(s,'The framework is a reference model for discussions and decisions about staff training. It provides a shared way to describe target capabilities, identify the relevant learning requirements, compare existing resources and decide what internal learning to develop. It supports human decisions about audience, priorities, constraints and delivery. It is not itself a mandatory training allocation or an operational authorisation. Existing cybersecurity expertise remains essential.');
}

// 2. Reuse and condense the original four-component overview.
{
  const s=slides[1];
  header(1,'The framework in one page','Everyone shares a Foundation. Additional learning follows their work.');
  edit(1,'common-label','SHARED',72,220,250,27,17,C.orange,true);
  edit(1,'selected-label','SELECTED FOR THE PERSON',366,220,842,27,17,C.orange,true);
  edit(1,'common-rule',null,72,255,250,0);
  edit(1,'selected-rule',null,366,255,842,0);
  const xs=[72,366,660,954], widths=[250,250,250,254];
  const titles=['Foundation','Agentic level\nL1 / L2 / L3','Relevant role\nspecialisms','Tool\ntraining'];
  const meanings=['What everyone\nshould understand','How they work\nwith AI and agents','What their\nresponsibilities require','How they use\ntheir approved tools'];
  xs.forEach((x,i)=>{
    edit(1,`component-${i+1}`,titles[i],x,279,widths[i],80,29,C.navy,true);
    edit(1,`component-meaning-${i+1}`,meanings[i],x,370,widths[i],64,24,C.grey);
    edit(1,`component-link-${i+1}`,null,x+widths[i]/2,431,0,18);
  });
  [332,626,920].forEach((x,i)=>edit(1,`plus-${i+1}`,'+',x,300,28,45,33,C.orange,false,'center'));
  edit(1,'profile-join',null,72,449,1136,0);
  edit(1,'profile-link',null,640,449,0,15);
  edit(1,'profile-band',null,72,464,1136,58);
  edit(1,'profile-result','Target capability profile',105,477,1070,44,30,C.paper,true,'center');
  arrow(s,'profile-to-needs',340,523,0,27);
  text(s,'needs','Detailed needs and outcomes',72,565,640,38,30,C.navy,true);
  text(s,'needs-definition','What the person must know or do',72,608,650,33,23,C.grey);
  arrow(s,'needs-to-training',728,585,76);
  text(s,'training','Training and practice',850,565,358,38,30,C.navy,true);
  edit(1,'core-craft','Existing cybersecurity expertise remains essential',72,656,1090,30,19,C.grey);
  notes(s,'Target capability profile = Foundation + Agentic level + Relevant role specialisms + Tool training. Foundation is shared by everyone and is not a fourth level. Choose the agentic level according to target work, and select relevant role specialisms and tool training at any level. Learning needs and their detailed outcomes translate this profile into requirements for training and practice; they are not a fifth additive capability component. A need can contain outcomes with different applicability. Generic and cyber-specific classify content rather than audience. Existing cybersecurity expertise (N0) remains a prerequisite.');
}

// 3. Paired needs/outcomes, visually connected to the shared Foundation.
{
  const s=slides[2];
  header(2,'Foundation and its learning needs','Everyone shares the Foundation and its detailed learning requirements.');
  text(s,'needs-heading','LEARNING NEEDS',366,223,338,27,17,C.orange,true);
  text(s,'outcomes-heading','EXAMPLES OF DETAILED OUTCOMES',746,223,462,27,17,C.orange,true);
  text(s,'foundation-hub','Foundation',72,375,220,46,31,C.navy,true);
  text(s,'foundation-audience','Common to all',72,423,220,42,24,C.grey);
  line(s,'foundation-to-needs',251,415,63,C.orange,2);
  line(s,'foundation-branch',314,283,0,C.orange,2,296);
  const rows=[
    ['N1  AI in cyber','Identify uses in cyber and\nhow your work could change.'],
    ['N2  AI systems and agents','Explain how agents use tools\nand take action.'],
    ['N3  AI limitations','Recognise unreliable outputs\nand apply checking habits.'],
    ['N4  Responsible AI use','Protect information and\napply the bank’s rules.'],
    ['N5  AI security risks\n       and threats','Recognise attacks involving AI\nand know how to respond.']
  ];
  rows.forEach(([title,body],i)=>{
    const y=261+i*74;
    edit(2,`foundation-rule-${i}`,null,352,y-9,856,0);
    edit(2,`foundation-topic-${i}`,title,366,y+3,354,66,25,C.navy,true);
    edit(2,`foundation-purpose-${i}`,body,746,y,462,66,24,C.grey);
    arrow(s,`foundation-need-link-${i}`,314,y+22,30);
  });
  notes(s,'The five rows pair Foundation with its relevant needs and selected examples of detailed outcomes. These are concise paraphrases, not replacement outcome definitions. Foundation contains the shared outcomes in N1–N5 and excludes N4.7 (third-party vetting, selected at L2) and N5.7 (threat tracking and control adjustment, selected for Threat intelligence & detection).\nN1: N1.1 current cyber uses, N1.2 emerging uses, N1.3 how work changes. N2: N2.1 models, N2.2 modalities, N2.3 ways of using AI, N2.4 agent anatomy, N2.5 connections and extensions, N2.6 safety components, N2.7 hosting. N3: N3.1 hallucination, N3.2 sycophancy, N3.3 context loss, N3.4 non-determinism, N3.5 prompt injection, N3.6 automation bias, N3.7 counter-habits. N4: N4.1–N4.6 information handling, intellectual property, supply chain, regulation and bank rules. N5: active shared outcomes N5.1, N5.3–N5.6 and N5.8. N5.2 is retired and deepfake impersonation sits within N5.1. The risk overview and attacks on the bank’s AI remain included. Awareness requires recognition and an appropriate precaution or escalation, rather than specialist control design.');
}

// 4. Each level is explicitly paired with its needs.
{
  const s=slides[3];
  const retained=['progression'];
  for(let i=0;i<3;i++) retained.push(`level-${i}`,`level-heading-${i}`,`level-rule-${i}`);
  keep(3,retained);
  header(3,'Agentic levels and their learning needs','Each level has defined needs for the work it involves.');
  const xs=[72,466,860];
  const levels=['L1','L2','L3'];
  const titles=['Work with\nAI assistance','Supervise\nagents','Build and\nevaluate agents'];
  xs.forEach((x,i)=>{
    edit(3,`level-${i}`,levels[i],x,216,346,67,52,C.orange,true);
    edit(3,`level-heading-${i}`,titles[i],x,286,346,88,32,C.navy,true);
    arrow(s,`level-needs-link-${i}`,x+18,376,0,25);
    edit(3,`level-rule-${i}`,null,x,415,346,0);
  });
  text(s,'l1-needs','N6  Working with AI',72,433,346,40,26,C.navy,true);
  text(s,'l1-outcomes','Provide context, check outputs\nand own the result.',72,487,346,85,24,C.grey);
  text(s,'l2-needs','N7  Supervising agents\nN8  Reusable instructions\n       and connectors\nN9  Testing your AI tasks\nN4.7  Third-party vetting',466,433,346,160,24,C.navy);
  text(s,'l3-needs','N10  Building agents\nN11  Evaluating agents',860,433,346,75,26,C.navy,true);
  text(s,'l3-outcomes','Design behaviour and evaluations.\nIncludes no-code/low-code.',860,519,346,75,23,C.grey);
  edit(3,'progression','Levels are independent of seniority. Higher levels build on earlier shared capabilities.\nNot everyone needs L3.',72,617,1136,56,22,C.grey);
  notes(s,'The formal levels are L1 Entry, L2 Practitioner and L3 Expert. Levels describe target capabilities, independent of seniority, professional expertise and operational authority. Higher levels inherit earlier shared capabilities. Demonstrated capabilities need not be retaught. L3 includes no-code/low-code builders.\nL1 adds N6.1–N6.8 (working with AI). L2 adds N7.1–N7.5 (delegate, monitor, verify, intervene, account), N8.1–N8.5 (reusable instructions and connectors), N9.1–N9.5 (task testing) and N4.7 (vetting third-party Skills/connectors). L3 adds shared outcomes N10.1, N10.2, N10.4, N10.5, N10.8 and N11.1–N11.6. N10.3, N10.6 and N10.7 belong to the Security architecture & engineering infrastructure specialism, rather than the common L3 package. N11.3 is essential when automated judges are used. Vendor-evaluation outcomes N11.4 and N11.6 can also apply to relevant specialists without an L3 building responsibility.\nBoundary: L2 operates and adapts an existing approved agent workflow and runs task checks. L3 designs agent behaviour and the evaluation approach. Writing a reusable instruction within an approved workflow does not alone make someone L3.');
}

// 5. An editable mapping keeps role, domain and needs together.
{
  const s=slides[4]; keep(4,[]);
  header(4,'Specialisms, domains and learning needs','Roles aligned with ENISA’s European Cybersecurity Skills Framework.');
  edit(4,'subtitle','Roles aligned with ENISA’s European Cybersecurity Skills Framework, adapted for our organisation.',72,140,1136,56,23,C.grey);
  const values=[
    ['DOMAIN','FRAMEWORK ROLE','RELEVANT NEEDS AT ANY LEVEL'],
    ['DOM1','Security architecture & engineering','AI security, controls, infrastructure'],
    ['DOM2','Security operations & response','Agent incident response and forensics'],
    ['DOM2','Threat intelligence & detection','AI threat tracking and defence updates'],
    ['DOM2','Vulnerability & exposure management','Agent exposures and AI code analysis'],
    ['DOM3/DOM7*','Offensive security & testing','Agent red-teaming and test containment'],
    ['DOM4','Governance, risk, compliance & assurance','AI governance, risk and assurance'],
    ['DOM10','Security awareness & culture','Relevant shared needs and tool practice'],
    ['DOM5','Identity & access management','Agent identity lifecycle'],
    ['EXCO','Leadership','Adoption, accountability and governance']
  ];
  const t=s.tables.add({rows:values.length,columns:3,left:72,top:203,width:1136,height:420,columnWidths:[180,485,471],values});
  t.borders.assign({fill:C.rule,width:0.55,style:'solid'});
  t.cells.block({row:0,column:0,rowCount:values.length,columnCount:3}).assign({margins:{top:6,bottom:4,left:9,right:9},anchor:'center'});
  for(let r=0;r<values.length;r++){
    t.rows[r].height=42;
    for(let c=0;c<3;c++){
      const cell=t.getCell(r,c);cell.fill=C.paper;
      cell.text.style={typeface:font,fontSize:r===0?17:21.5,color:r===0?C.orange:c===2?C.grey:C.navy,bold:r===0||c===0};
    }
  }
  text(s,'domain-note','Provisional domain mapping. *DOM3: red team; DOM7: secure coding.\nDOM7 boundaries need reconciliation with R4.2 code-analysis needs under Vulnerability & exposure management.',72,636,1136,44,17,C.grey);
  notes(s,'The nine roles are the project’s grouping aligned to ENISA’s European Cybersecurity Skills Framework (ECSF), adapted for the organisation. They are not a claim that ENISA defines these same nine roles. ECSF lists 12 typical professional profiles. Source verified 4 November 2026: https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles (19 September 2022).\nRole alignment: Security operations & response uses Incident Responder / Digital Forensics Investigator; Threat intelligence & detection uses Threat Intelligence Specialist; Offensive security & testing uses Penetration Tester / Cybersecurity Researcher; Vulnerability & exposure management has no direct ECSF profile, with Implementer / Risk Manager closest; Security architecture & engineering uses Architect / Implementer; GRC & assurance uses Legal, Policy & Compliance Officer / Risk Manager / Auditor; Security awareness & culture uses Educator; IAM has no direct profile, with Implementer / Architect closest; Leadership uses CISO.\nDetailed needs: Architecture: N12 and R5.1, plus N10.3, N10.6, N10.7 for infrastructure responsibilities. Operations: R1.1 and R1.2. Threat intelligence: N5.7. Exposure management: R4.1 and R4.2. Offensive security: R3.1 and R3.2. GRC/assurance: N13, R6.1 and relevant vendor-evaluation outcomes N11.4/N11.6. Awareness: relevant shared capabilities and tools, without inventing an additional specialist outcome set. IAM: R9.1, selecting identity operations or integration/design outcomes by responsibility. Leadership: N14, N13.3 and other relevant governance and vendor-evaluation outcomes. One person can need several specialisms at any level. Need titles summarise selected applicable outcomes rather than assigning whole groups to everyone.\nDomain mapping source: presentations/AI-Era_2027_Next-Steps_Group-CISO_Walkthrough.pptx, slide 2, 2 November 2026. Ownership remains provisional. DOM3 is proposed for red team and DOM7 for secure coding under Offensive security & testing. The model retains R4.2 code-analysis engineering within Vulnerability & exposure management. Reconcile that boundary before finalising ownership or changing the framework. This deck preserves the discrepancy explicitly and does not move outcomes between roles.');
}

// 6. Access and work determine product-specific learning.
{
  const s=slides[5]; keep(5,['timing-message']);
  edit(5,'title','Tool training follows access\nand intended work',72,57,1136,125,44,C.paper,true);
  edit(5,'timing-message','Training should arrive with access',72,204,1136,45,28,C.bright,true);
  const cols=[
    [72,'Approved tool','Who has access?\nWhen is it available?'],
    [466,'Intended tasks','What will people do?\nWhich checks must they run?'],
    [860,'Hands-on training','Practise tasks, review results\nand recover from errors.']
  ];
  cols.forEach(([x,title,body],i)=>{
    line(s,`tool-rule-${i}`,x,290,346,C.darkRule,2);
    text(s,`tool-stage-${i}`,title,x,313,346,52,32,C.paper,true);
    text(s,`tool-detail-${i}`,body,x,380,346,80,25,C.darkMuted);
  });
  arrow(s,'access-to-work',427,340,25,0,C.bright);
  arrow(s,'work-to-learning',821,340,25,0,C.bright);
  line(s,'tool-audience-rule',72,481,1136,C.darkRule);
  text(s,'same-tool','The same product can require different learning',72,505,1136,42,27,C.paper,true);
  const audiences=[['User','Perform tasks and\nreview outputs.'],['Supervisor','Monitor actions and\ntake over when needed.'],['Builder','Configure or code agents\nand test reliability.']];
  audiences.forEach(([title,body],i)=>{
    const x=cols[i][0];
    text(s,`tool-audience-${i}`,title,x,565,346,37,24,C.bright,true);
    text(s,`tool-practice-${i}`,body,x,607,346,65,23,C.darkMuted);
  });
  notes(s,'Tool training teaches the specific product, platform or in-house tool that the person is approved to use. Audience follows tool distribution, access and intended tasks. It can span functions or apply to everyone when a tool is available to everyone. The same product can require different training for users, supervisors and builders. No named product or deployment is assumed here. Product practice supplements the relevant shared and specialist outcomes; familiarity with a tool does not itself provide assessed capability coverage, demonstrate competence or grant operational authority. Tool training should arrive with access, including safe practice, review of results and recovery or takeover. The provisional coordination mapping assigns tooling to DOM6, separately from the role table.');
}

// 7. The mapped requirements drive course selection and internal development.
{
  const s=slides[6]; keep(6,[]);
  header(6,'Selecting and building training','Detailed needs guide the training selected for each audience.');
  text(s,'requirements-input','Relevant needs and outcomes',72,231,1136,48,31,C.navy,true);
  line(s,'requirements-rule',72,291,1136,C.steel,2);
  const cols=[
    [72,'Select existing\ntraining','Use catalogue evidence.\nCheck time and prerequisites.'],
    [466,'Build internal\nlearning','Add local use cases and\npractice for uncovered needs.'],
    [860,'Assemble\nthe pathway','Sequence learning within\navailable time and tool access.']
  ];
  cols.forEach(([x,title,body],i)=>{
    text(s,`selection-step-${i}`,title,x,335,346,91,32,C.navy,true);
    text(s,`selection-detail-${i}`,body,x,455,346,93,25,C.grey);
  });
  arrow(s,'select-to-build',426,377,27);
  arrow(s,'build-to-pathway',820,377,27);
  line(s,'selection-footer-rule',72,580,1136,C.rule);
  text(s,'deduplicate','Shared learning counts once',72,602,1136,37,25,C.orange,true);
  text(s,'coverage-boundary','Training coverage and demonstrated competence are separate.',72,649,1136,32,22,C.grey);
  notes(s,'The framework provides the reference requirements for training decisions. Define target work and the capability profile; use the applicable detailed outcomes to compare resources and design learning. Where evidence of existing capability is available, avoid reteaching demonstrated outcomes. Without baseline assessment, describe target learning needs rather than measured skill gaps.\nUse the current catalogue’s recorded syllabus/outcome evidence, suitability, prerequisites and full-course duration to compare existing learning. Keep unknown duration and unassessed records explicit. One resource can address several needs and one need can require several resources. Develop internal sessions, local use cases and realistic exercises for relevant requirements that existing courses do not address. Planned internal teaching needs an owner and delivery preparation and does not earn assessed course coverage until evaluated.\nAssemble pathways and cohorts around shared needs, including across functions. Account for priorities, learner time, delivery capacity and tool availability. Deduplicate shared outcomes, courses and internal learner time. Review recommendations and delivery readiness separately. Following learning, assess what people can demonstrate. Syllabus coverage, learner competence and operational permission remain separate decisions.\nThe steps describe a planning process, not approval of particular courses, mandatory requirements or changes to published pathways.');
}

const candidate=path.join(build,'candidate.pptx');
await (await PresentationFile.exportPptx(p)).save(candidate);
await fs.writeFile(path.join(build,'content.ndjson'),(await p.inspect({select:'$.slides[*]',include:['id','index','title','elements.name','elements.kind','elements.text','notes.text']})).ndjson);
for(let i=0;i<slides.length;i++){
  await fs.writeFile(path.join(build,'previews',`slide-${i+1}.png`),new Uint8Array(await (await p.export({slide:slides[i],format:'png',scale:1})).arrayBuffer()));
  await fs.writeFile(path.join(build,'previews',`slide-${i+1}.layout.json`),new Uint8Array(await (await slides[i].export({format:'layout'})).arrayBuffer()));
}
console.log(JSON.stringify({candidate,slides:slides.length,previews:path.join(build,'previews')}));

if(process.argv.includes('--finalize')){
  const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
  const result=await finalizePresentation({
    workspaceDir:root,candidatePath:candidate,finalPath:final,explicitTotalSlideCount:7,
    requiredNativeTableOwnerSlides:[5],requiredNativeChartOwnerSlides:[],
    pythonExecutable:'/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
    integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
    layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
    layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','5'],
    fontPolicy:{basis:'reference',families:[font],referencePath:reference,referenceSha256:createHash('sha256').update(await fs.readFile(reference)).digest('hex')},
    verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')
  });
  console.log(JSON.stringify(result));
  const saved=await PresentationFile.importPptx(await FileBlob.load(final));
  await fs.mkdir(path.join(build,'final-previews'),{recursive:true});
  for(let i=0;i<saved.slides.items.length;i++) await fs.writeFile(path.join(build,'final-previews',`slide-${i+1}.png`),new Uint8Array(await (await saved.export({slide:saved.slides.items[i],format:'png',scale:1})).arrayBuffer()));
  await fs.copyFile(path.join(build,'validation.json'),path.join(root,'presentations/source/framework-training-decisions-20261104/validation.json'));
  console.log('Rendered all seven final slides.');
}
