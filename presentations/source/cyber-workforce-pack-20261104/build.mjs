import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

// Preparing our cyber workforce for the agentic era — four-section pack.
const root = process.cwd();
const runtime = process.env.ARTIFACT_NODE_MODULES || '/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES ||= runtime;
const require = createRequire(path.join(runtime, '_resolver.cjs'));
const { PresentationFile, FileBlob } = require('@oai/artifact-tool');
const { GlobalFonts } = require('@napi-rs/canvas');
const skill = '/Users/cyberk/.codex/plugins/cache/openai-primary-runtime/presentations/26.1026.10807/skills/presentations';
const here = path.join(root, 'presentations/source/cyber-workforce-pack-20261104');
const build = path.join(root, '.work/presentations/cyber-workforce-pack-20261104');
const final = path.join(root, 'presentations/AI-Era_Cyber-Workforce_Preparation.pptx');
const reference = path.join(root, 'presentations/Agentic-Era_Workforce_Capability_Model_Briefing.pptx');
const font = 'IBM Plex Sans';
const C = { navy:'#13202E', paper:'#F6F4EF', orange:'#A24F19', bright:'#E8914F', grey:'#4A5563', muted:'#5E6773', rule:'#D8D1C4', pale:'#EBE6DC', steel:'#7E98AD', darkMuted:'#B7C3CE', darkRule:'#465361', blue:'#2E5A8C', draftLight:'#C62828', draftDark:'#FF6B6B' };

// Final order. Source keys come from the briefing; the rest are new slides.
const ORDER = ['cover','intro','div1','goal','f2','f3','f4','f5','f6','f7','f8','div2','catalogue','div3','app','cycle','div4','baseline','secai','usecase','next'];
const SLIDES = ORDER.length;
const pageOf = key => ORDER.indexOf(key)+1;
const SOURCE_KEYS = ['cover','f2','f3','f4','f5','f6','f7','f8','catalogue'];
const SOURCE_INDEXES = [0,1,2,3,4,5,6,7,10];
const DARK = new Set(['cover','div1','div2','div3','div4','f6']);

await fs.mkdir(path.join(build, 'previews'), { recursive:true });
for (const weight of ['Regular','Bold']) GlobalFonts.registerFromPath(path.join(root, `presentations/source/capability-model-20261018/assets/IBMPlexSans-${weight}.ttf`));

const p = await PresentationFile.importPptx(await FileBlob.load(reference));
const imported = await p.inspect({select:'$.slides[*]', include:['id','index','layout','elements.id','elements.name','elements.position','elements.text']});
const all = imported.records.filter(r => r.index !== undefined);
const records = SOURCE_INDEXES.map(i => all[i]);
p.slides.keep(records.map(r => r.id));
const sources = records.map(r => new Map(r.elements.map(e => [e.name, e])));
const slides = p.slides.items;

function old(i, name) { const r=sources[i].get(name); if (!r) throw new Error(`Missing source ${i+1}/${name}`); return p.resolve(r.id); }
function style(shape, size=26, color=C.navy, bold=false, align='left', anchor='top') {
  shape.text.style={typeface:font,fontSize:size,color,bold,insets:0,autoFit:'none',wrap:'square',verticalAlignment:anchor,alignment:align};
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
function text(s,name,value,x,y,w,h,size=26,color=C.navy,bold=false,align='left',anchor='top') {
  const a=s.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  a.text=value; return style(a,size,color,bold,align,anchor);
}
function rect(s,name,x,y,w,h,fill=C.pale) {
  return s.shapes.add({geometry:'rect',name,position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});
}
function frame(s,name,x,y,w,h,color=C.rule) {
  return s.shapes.add({geometry:'rect',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:color,width:1,style:'solid'}});
}
function line(s,name,x,y,w,color=C.rule,weight=1,h=0) {
  return s.shapes.add({geometry:'line',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:color,width:weight,style:'solid'}});
}
function arrow(s,name,x,y,w,h=0,color=C.orange) {
  return s.shapes.add({geometry:'connector',kind:'straight',name,position:{left:x,top:y,width:w,height:h},line:{fill:color,width:2},tail:{type:'triangle',width:'sm',length:'sm'}});
}
function header(i,title,subtitle,dark=false) {
  edit(i,'title',title,72,60,1136,70,44,dark?C.paper:C.navy,true);
  if (subtitle) edit(i,'subtitle',subtitle,72,143,1136,40,26,dark?C.darkMuted:C.grey);
}
const SOURCE_NOTE='\n\nDesign: slide objects adapted from presentations/Agentic-Era_Workforce_Capability_Model_Briefing.pptx and the CISO next-steps walkthrough; content follows the user-reviewed pack skeleton, 4 November 2026 (pathway-builder slide removed at the user\'s request).';
function notes(s,body) {
  s.speakerNotes.text=body+'\n\nAuthoritative source: capability-framework/Agentic-Era_Workforce_Capability_Model.md, model 2 revision 3; catalogue v17 snapshot 8bffc898c371360e. The deck summarises the model and changes no outcome, applicability, selection or ownership.'+SOURCE_NOTE;
}
function plainNotes(s,body) { s.speakerNotes.text=body+SOURCE_NOTE; }

// New slides share the briefing's chrome: draft label, page number, background.
const created=[];
function newSlide(key) {
  const dark=DARK.has(key);
  const s=p.slides.add({layout:'Blank',background:{fill:dark?C.navy:C.paper}});
  created.push(key);
  text(s,'draft-for-discussion','DRAFT FOR DISCUSSION',960,8,280,21,16,dark?C.draftDark:C.draftLight,true,'right');
  text(s,'page-number',String(pageOf(key)),1172,673,36,23,15,dark?C.darkMuted:C.muted,false,'right');
  return s;
}
function title(s,value,subtitle) {
  text(s,'title',value,72,60,1136,70,44,C.navy,true);
  if (subtitle) text(s,'subtitle',subtitle,72,143,1136,40,26,C.grey);
}

// Section dividers with a four-part navigation row.
const SECTIONS=[
  ['The framework','A reference model to support decisions\nand discussion on staff training.'],
  ['Training catalogue','AI training found online and internally,\nassessed against the framework.'],
  ['Learning app','Helping staff navigate learning,\nwith our recommendations over time.'],
  ['Baseline for all staff','A proposed first training for everyone:\nFoundation + L1.']
];
function divider(n) {
  const s=newSlide(`div${n}`), [name,message]=SECTIONS[n-1];
  text(s,'section-number',String(n).padStart(2,'0'),72,196,400,96,80,C.bright,true);
  text(s,'title',name,72,306,1136,70,52,C.paper,true);
  text(s,'section-message',message,72,392,1136,90,28,C.darkMuted);
  line(s,'section-nav-rule',72,585,1136,C.darkRule,1);
  SECTIONS.forEach(([label],k)=>{
    const x=[72,366,660,954][k], current=k===n-1;
    if(current) line(s,`section-nav-current`,x,584,250,C.bright,4);
    text(s,`section-nav-${k}`,`${String(k+1).padStart(2,'0')}  ${label}`,x,603,250,30,17,current?C.bright:C.darkMuted,current);
  });
  return s;
}

// ---- Opening ----

// 1. Cover: the question this pack starts to answer.
{
  const s=slides[0]; keep(0,['transformation-premise','comparison-rule','today-label','today-work','operating-model-transition','future-label','future-work','human-work','purpose-rule','mission','prepared-by','version-date']);
  edit(0,'title','Preparing our cyber workforce\nfor the agentic era',72,64,1136,133,50,C.paper,true);
  edit(0,'transformation-premise','A first step: what has been prepared,\nand how it fits together.',72,216,1136,82,28,C.darkMuted);
  old(0,'version-date').text='4 November 2026';
  notes(s,'This pack is a first step in answering an important and difficult question: how do we prepare our cyber workforce for a time when agents perform most of the work currently done manually? People will increasingly use, supervise and build AI. The pack sets out four connected pieces prepared so far: the capability framework, the training catalogue, the learning app for staff and a proposed baseline for all staff. Everything here is draft for discussion.');
}

// 2. What has been prepared.
{
  const s=newSlide('intro');
  title(s,'What has been prepared','Four connected pieces. A first step, not the final answer.');
  const tiles=[
    ['01','The\nframework','A reference model to\ndiscuss and decide\nstaff training.','4 components + needs'],
    ['02','Training\ncatalogue','Training found online\nand internally, assessed\nagainst the framework.','516 resources'],
    ['03','Learning\napp','Helps staff find learning\nand receive our\nrecommendations.','No install needed'],
    ['04','Baseline for\nall staff','Proposed first training\nfor everyone:\nFoundation + L1.','10h 41m']
  ];
  const xs=[72,366,660,954], ws=[250,250,250,254];
  tiles.forEach(([n,head,body,fact],k)=>{
    const x=xs[k], w=ws[k];
    text(s,`piece-number-${k}`,n,x,214,w,52,40,C.orange,true);
    line(s,`piece-rule-${k}`,x,274,w,C.steel,2);
    text(s,`piece-title-${k}`,head,x,292,w,74,27,C.navy,true);
    text(s,`piece-body-${k}`,body,x,378,w,96,19,C.grey);
    rect(s,`piece-fact-${k}`,x,494,w,40);
    text(s,`piece-fact-text-${k}`,fact,x,494,w,40,17,C.orange,true,'center','middle');
    if(k<3) arrow(s,`piece-flow-${k}`,x+w+8,318,28);
  });
  line(s,'intro-footer-rule',72,580,1136,C.rule);
  text(s,'intro-footer','Designed to evolve as tools, roles and our experience change.',72,600,1136,32,22,C.navy,true);
  plainNotes(s,'Four connected pieces. 1 The framework: a reference model for decisions and discussion about staff training (Foundation, agentic levels L1–L3, role specialisms and tool training, each mapped to learning needs and outcomes). 2 The training catalogue: AI training found on the internet and internally, assessed against the framework’s outcomes (catalogue v17, 516 active resources). 3 The learning app: a simple browser app for staff to navigate learning content and receive central recommendations over time (release 1.6.3). 4 A proposed baseline for all staff covering Foundation and L1 (10h 41m). Each piece builds on the one before: the framework defines the needs, the catalogue supplies training against them, the app delivers recommendations, and the baseline is the first recommendation for everyone. This is a first step and is expected to evolve.');
}

// ---- Section 1: the framework ----
plainNotes(divider(1),'Section 1: the capability framework, a reference model to support decision making and internal discussion on staff training.');

// Goal of the framework (light version of the former opening slide).
{
  const s=newSlide('goal');
  title(s,'A reference for training decisions','A common reference to discuss and decide staff training.');
  const cols=[
    [72,'Who needs\nwhat','Match learning to the\nwork people will do.'],
    [466,'Which training\nfits','Compare courses against\ndefined needs.'],
    [860,'What we need\nto build','Find gaps and develop\ninternal learning.']
  ];
  cols.forEach(([x,head,body],i)=>{
    line(s,`decision-rule-${i}`,x,256,346,C.steel,2);
    text(s,`decision-title-${i}`,head,x,280,346,91,34,C.navy,true);
    text(s,`decision-body-${i}`,body,x,393,346,86,26,C.grey);
  });
  line(s,'goal-footer-rule',72,560,1136,C.rule);
  text(s,'goal-footer','It supports human decisions on audience, priorities and delivery.\nIt is not a training allocation or an operational authorisation.',72,580,1136,64,21,C.grey);
  notes(s,'Goal: the framework is a reference model that supports discussions and decisions about which training staff receive. It gives one shared way to describe what people need to learn, compare existing training against those needs and identify internal learning to build. It supports human decisions on audience, priorities and delivery; it is not itself a mandatory allocation or an operational authorisation. Existing cybersecurity expertise remains essential.');
}


// 2. The framework in one page: four components plus the needs layer beneath.
{
  const s=slides[1];
  header(1,'The framework in one page','Everyone shares a Foundation. Everything else follows the person’s work.');
  edit(1,'common-label','SHARED',72,212,250,27,17,C.orange,true);
  edit(1,'selected-label','SELECTED FOR THE PERSON',366,212,842,27,17,C.orange,true);
  edit(1,'common-rule',null,72,246,250,0);
  edit(1,'selected-rule',null,366,246,842,0);
  const xs=[72,366,660,954], widths=[250,250,250,254];
  const titles=['Foundation','Agentic level\nL1 / L2 / L3','Role\nspecialisms','Tool\ntraining'];
  const meanings=['What everyone\nshould understand','How they work\nwith AI and agents','What their\nresponsibilities require','How they use\ntheir approved tools'];
  const needs=['N1–N5','N6–N11','N12–N14 + role needs','Product practice'];
  xs.forEach((x,i)=>{
    edit(1,`component-${i+1}`,titles[i],x,262,widths[i],76,28,C.navy,true);
    edit(1,`component-meaning-${i+1}`,meanings[i],x,344,widths[i],58,20,C.grey);
    rect(s,`needs-chip-${i+1}`,x,416,widths[i],40);
    text(s,`needs-chip-text-${i+1}`,needs[i],x,416,widths[i],40,18,C.orange,true,'center','middle');
    edit(1,`component-link-${i+1}`,null,x+widths[i]/2,456,0,20);
  });
  [332,626,920].forEach((x,i)=>edit(1,`plus-${i+1}`,'+',x,281,28,45,33,C.orange,false,'center'));
  p.delete([sources[1].get('profile-join').id]);
  edit(1,'profile-band',null,72,476,1136,62);
  edit(1,'profile-result','Learning needs and outcomes',100,476,700,62,28,C.paper,true);
  old(1,'profile-result').text.style={verticalAlignment:'middle'};
  text(s,'needs-count','23 needs · 140 outcomes',800,476,380,62,21,C.darkMuted,false,'right','middle');
  edit(1,'profile-link',null,640,538,0,1);
  arrow(s,'needs-to-training',640,540,0,26);
  text(s,'training','Training and practice',72,574,1136,40,28,C.navy,true,'center');
  text(s,'training-detail','Selected or built to meet the needs',72,614,1136,30,20,C.grey,false,'center');
  edit(1,'core-craft','Existing cybersecurity expertise remains essential',72,662,1000,26,17,C.grey);
  notes(s,'Target capability profile = Foundation + Agentic level + Relevant role specialisms + Tool training. Foundation is shared by everyone and is not a fourth level. The agentic level follows the person’s target work; role specialisms and tool training can apply at any level.\nLearning needs sit beneath the four components: each component maps to defined needs, and each need contains detailed learning outcomes. Needs are the layer that translates a profile into training requirements, not a fifth additive capability component.\nMapping: Foundation N1–N5 (excluding N4.7 and N5.7). L1 N6; L2 N7–N9 and N4.7; L3 N10 and N11 except N10.3, N10.6 and N10.7. Role specialisms: N12–N14, the R-coded role needs, N10.3/N10.6/N10.7 for agent infrastructure in Security architecture & engineering, and N5.7 for Threat intelligence & detection. Tool training: product-specific practice linked to the relevant shared or specialist outcomes. 23 needs and 140 active outcomes; 11 generic and 12 cyber-specific needs. Existing cybersecurity expertise (N0) remains a prerequisite.');
}

// 3. Foundation: five shared needs.
{
  const s=slides[2];
  header(2,'Foundation','Common understanding for everyone in cyber. Not a fourth level.');
  const rows=[
    ['N1','AI in cyber','What AI can do in our work, today and next.'],
    ['N2','AI systems and agents','How models and agents work, use tools and act.'],
    ['N3','AI limitations','Recognise errors and overconfidence. Know when to check.'],
    ['N4','Responsible AI use','Protect information and apply the bank’s rules.'],
    ['N5','AI security risks\nand threats','How attackers use and target AI, and how to respond.']
  ];
  rows.forEach(([code,title,body],i)=>{
    const y=215+i*82;
    edit(2,`foundation-rule-${i}`,null,72,y,1136,0);
    text(s,`foundation-code-${i}`,code,72,y+18,64,40,24,C.orange,true);
    edit(2,`foundation-topic-${i}`,title,140,y+18,330,62,24,C.navy,true);
    edit(2,`foundation-purpose-${i}`,body,500,y+18,708,40,24,C.grey);
  });
  line(s,'foundation-rule-end',72,625,1136,C.rule,1);
  notes(s,'Foundation is shared by everyone in the cyber workforce. It contains the shared outcomes in N1–N5: N1 AI in cyber (current and emerging uses, how work changes); N2 AI systems and agents (models, modalities, agent anatomy, connections, safety components, hosting); N3 AI limitations (hallucination, sycophancy, context loss, non-determinism, prompt injection, automation bias, checking habits); N4 Responsible AI use (information handling, intellectual property, supply chain, regulation and bank rules); N5 AI security risks and threats (risk overview, attacks on the bank’s AI, AI-enabled threats including deepfake impersonation).\nN4.7 third-party vetting is selected at L2; N5.7 threat tracking and control adjustment is selected for Threat intelligence & detection. Foundation depth is recognition and the appropriate precaution or escalation, not specialist control design.');
}

// 4. Agentic levels as a staircase.
{
  const s=slides[3]; keep(3,[]);
  header(3,'Agentic levels','How a person works with AI. The level follows the work, not seniority.');
  const steps=[
    {x:72,top:330,level:'L1',heading:'Work with\nAI assistance',needs:'N6  Working with AI',detail:'Provide context, check outputs\nand own the result.'},
    {x:466,top:280,level:'L2',heading:'Supervise\nagents',needs:'N7  Supervising agents\nN8  Reusable instructions\nN9  Testing your AI tasks',detail:'Delegate, monitor, verify\nand intervene.'},
    {x:860,top:230,level:'L3',heading:'Build and\nevaluate agents',needs:'N10  Building agents\nN11  Evaluating agents',detail:'Design, test and improve.\nIncludes no-code/low-code.'}
  ];
  steps.forEach((st,i)=>{
    rect(s,`step-${i}`,st.x,st.top,346,600-st.top);
    text(s,`level-${i}`,st.level,st.x+24,st.top+16,298,56,46,C.orange,true);
    text(s,`level-heading-${i}`,st.heading,st.x+24,st.top+78,298,70,26,C.navy,true);
    const lines=st.needs.split('\n').length;
    text(s,`level-needs-${i}`,st.needs,st.x+24,st.top+160,298,lines*28,20,C.navy,true);
    text(s,`level-detail-${i}`,st.detail,st.x+24,st.top+170+lines*28,298,54,19,C.grey);
  });
  text(s,'progression','Each level builds on the one below. Not everyone needs L3.',72,622,1136,32,20,C.grey);
  notes(s,'Formal levels: L1 Entry (work with AI assistance), L2 Practitioner (supervise agents), L3 Expert (build and evaluate agents, including no-code/low-code builders). Levels describe target agentic capability, independent of seniority, professional expertise and operational authority. A senior leader can be L1; a GRC specialist can be L3. Higher levels inherit earlier shared capabilities; demonstrated capabilities need not be retaught.\nL1 adds N6. L2 adds N7–N9 and N4.7 (vetting third-party Skills and connectors), shown on the slide as the three main needs. L3 adds N10 and N11, except N10.3, N10.6 and N10.7, which belong to agent infrastructure within Security architecture & engineering.\nBoundary: L2 operates and adapts an existing approved agent workflow and runs task checks; L3 designs agent behaviour and its evaluation approach. Writing a reusable instruction within an approved workflow does not alone make someone L3.');
}

// 5. Nine role specialisms with their main specialist needs.
{
  const s=slides[4];
  const retained=[];
  for(let i=0;i<9;i++) retained.push(`role-rule-${i}`,`role-number-${i}`,`role-${i}`);
  keep(4,[...retained,'multiple-specialisms']);
  header(4,'Role specialisms','Added for actual responsibilities, at any level.');
  const roles=[
    ['Security operations\n& response','Agent incidents · forensics'],
    ['Threat intelligence\n& detection','AI threat tracking'],
    ['Offensive security\n& testing','Agent red-teaming'],
    ['Vulnerability &\nexposure management','Exposure · AI code analysis'],
    ['Security architecture\n& engineering','Securing AI · agent controls'],
    ['Governance, risk,\ncompliance & assurance','AI governance · assurance'],
    ['Security awareness\n& culture','Shared needs and tools'],
    ['Identity & access\nmanagement','Agent identities'],
    ['Leadership','AI adoption · accountability']
  ];
  // Provisional ownership from the 2 November walkthrough, slide 2.
  const domains=['DOM2','DOM2','DOM3 · DOM7','DOM2','DOM1','DOM4','DOM10','DOM5','EXCO'];
  roles.forEach(([name,needs],i)=>{
    const x=[72,466,860][Math.floor(i/3)], y=212+(i%3)*134;
    edit(4,`role-rule-${i}`,null,x,y,346,0);
    edit(4,`role-number-${i}`,String(i+1).padStart(2,'0'),x,y+18,42,35,22,C.orange,true);
    edit(4,`role-${i}`,name,x+56,y+16,290,64,23,C.navy,true);
    text(s,`role-needs-${i}`,needs,x+56,y+86,290,28,18,C.orange);
    const domain=domains[i], w=domain.length*10+24;
    rect(s,`role-domain-${i}`,x+346-w,y-13,w,26,C.navy);
    text(s,`role-domain-text-${i}`,domain,x+346-w,y-13,w,26,14,C.paper,true,'center','middle');
  });
  edit(4,'multiple-specialisms','One person may need several specialisms. Roles adapted from ENISA’s ECSF profiles.',72,616,1136,30,20,C.grey);
  text(s,'domain-note','Domain tags: provisional ownership. DOM3: red team; DOM7: secure coding.',72,650,1000,24,16,C.grey);
  notes(s,'Role specialisms add capabilities for the responsibilities of the nine roles defined in the model. They can apply at any agentic level; one person can need several. Select the outcomes relevant to the actual responsibilities rather than whole packages for everyone in a function.\nMain specialist needs: 1 Operations R1.1 agent incident response, R1.2 agent forensics and evidence. 2 Threat intelligence N5.7 AI threat tracking. 3 Offensive security R3.1 agent red-teaming, R3.2 testing-agent containment. 4 Vulnerability & exposure R4.1 agent exposure management, R4.2 AI code-analysis engineering. 5 Architecture N12 securing AI, R5.1 agent security architecture, N10.3/N10.6/N10.7 agent infrastructure. 6 GRC & assurance N13 AI governance and risk, R6.1 agent assurance, N11.4/N11.6 vendor evaluation. 7 Awareness reuses shared needs and tool training; no separate package. 8 IAM R9.1 agent identity lifecycle. 9 Leadership N14 transforming work and leading adoption, N13.3 autonomy policy.\nThe nine roles are the project’s grouping aligned with ENISA’s European Cybersecurity Skills Framework (ECSF) profiles, adapted for the organisation; ECSF does not define these same nine roles.\nDomain tags show provisional ownership from presentations/AI-Era_2027_Next-Steps_Group-CISO_Walkthrough.pptx, slide 2 (2 November 2026): DOM1 Security architecture & engineering (DOM1 also owns Foundation and L1–L3); DOM2 Security operations & response, Threat intelligence & detection, and Vulnerability & exposure management; DOM3 Offensive security & testing — red team; DOM7 Offensive security & testing — secure coding; DOM4 GRC & assurance; DOM10 Security awareness & culture; DOM5 IAM; EXCO Leadership; DOM6 tooling. Ownership is not approved. Open boundary: the model keeps R4.2 AI code-analysis engineering within Vulnerability & exposure management (DOM2), while DOM7 secure coding is proposed under Offensive security & testing. Reconcile before finalising ownership or changing the framework; this deck does not move outcomes between roles.');
}

// 6. Tool training follows access and intended work.
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
  notes(s,'Tool training teaches the specific product, platform or in-house tool the person is approved to use. Its audience follows tool distribution, access and intended tasks: it can apply to everyone if a tool is deployed to everyone, span functions, or cover only a specialist group. The same product can require different training for users, supervisors and builders. No named product or deployment is assumed.\nProduct practice supplements the relevant shared and specialist outcomes. Familiarity with a tool does not itself provide assessed coverage, demonstrate competence or grant operational permission. Different tools do not create new capability levels.');
}

// 7. Learning needs: the common language behind every component.
{
  const s=slides[6]; keep(6,[]);
  header(6,'Learning needs: the common language','Needs and outcomes make the framework concrete and traceable.');
  const xs=[72,374,676,978];
  const stages=[
    ['Component','Foundation, level,\nspecialism or tool','L2\nSupervise agents'],
    ['Learning need','A topic\nto learn','N7\nSupervising agents'],
    ['Outcomes','What to know\nor demonstrate','N7.3  Verify outputs\nN7.4  Stop or take over'],
    ['Training','Courses and\npractice','Assessed course\n+ tool exercise']
  ];
  stages.forEach(([title,def,example],i)=>{
    const x=xs[i];
    line(s,`stage-rule-${i}`,x,226,230,C.steel,2);
    text(s,`stage-${i}`,title,x,244,230,40,26,C.navy,true);
    text(s,`stage-definition-${i}`,def,x,290,230,56,20,C.grey);
    rect(s,`example-${i}`,x,394,230,84);
    text(s,`example-text-${i}`,example,x+16,394,198,84,19,C.navy,i===0||i===1,'left','middle');
    if(i<3){ arrow(s,`stage-flow-${i}`,x+244,264,44); arrow(s,`example-flow-${i}`,x+244,436,44); }
  });
  text(s,'example-label','EXAMPLE',72,364,300,24,16,C.orange,true);
  rect(s,'stats-band',72,512,1136,76,C.navy);
  const stats=[['23','needs'],['140','outcomes'],['11 + 12','generic + cyber-specific']];
  stats.forEach(([n,label],i)=>{
    const x=[100,478,856][i];
    text(s,`stat-number-${i}`,n,x,512,140,76,30,C.paper,true,'left','middle');
    text(s,`stat-label-${i}`,label,x+[50,72,118][i],512,240,76,20,C.darkMuted,false,'left','middle');
  });
  text(s,'assessment','Courses are scored against each outcome. Coverage is not competence.',72,620,1136,32,20,C.grey);
  notes(s,'Learning needs are the topics a person needs to learn (for example N7 Supervising agents or R9.1 Agent identity lifecycle). Each need contains learning outcomes: specific statements of what someone must know or do (for example N7.3 verifying outputs and tracing evidence, N7.4 stopping or taking over a task). Outcome IDs keep learning traceable to catalogue evidence.\nThe framework has 23 assessed needs (N1–N14 plus nine R-coded role needs) and 140 active outcomes. 11 needs are generic (transfer across functions) and 12 are cyber-specific; this classifies content, not audience.\nEach catalogue resource is scored 0–3 against each outcome; coverage uses each outcome’s best score with equally weighted needs. Course coverage is syllabus evidence, not demonstrated competence or operational permission. Without a baseline assessment, describe results as target learning needs, not measured skill gaps.');
}

// 8. From framework to training: select, build, assemble.
{
  const s=slides[7]; keep(7,[]);
  header(7,'From framework to training','A person’s profile becomes a pathway we select and build.');
  const col=(x,ruleY,title,body,name)=>{
    line(s,`${name}-rule`,x,ruleY,230,C.steel,2);
    text(s,`${name}-title`,title,x,ruleY+16,230,70,26,C.navy,true);
    text(s,`${name}-detail`,body,x,ruleY+92,230,56,20,C.grey);
  };
  col(72,330,'Profile','Foundation + level\n+ specialisms + tools','profile');
  col(374,330,'Needs and\noutcomes','What this person\nmust learn','needs');
  col(676,220,'Select existing\ntraining','Catalogue courses\nscored against outcomes','select');
  col(676,400,'Build internal\nlearning','Local use cases and\npractice for gaps','build');
  col(978,330,'Pathway','Sequenced within time\nand tool access','pathway');
  line(s,'options-bracket',662,220,0,C.steel,2,328);
  arrow(s,'profile-to-needs',318,384,40);
  arrow(s,'needs-to-options',620,384,34);
  arrow(s,'options-to-pathway',922,384,40);
  line(s,'selection-footer-rule',72,584,1136,C.rule);
  text(s,'deduplicate','Shared learning counts once',72,602,1136,37,25,C.orange,true);
  text(s,'coverage-boundary','The training catalogue and the learning app support each step.',72,644,1080,30,20,C.grey);
  notes(s,'1 Profile: describe the target work and choose the agentic level, relevant role specialisms and approved tools on top of the shared Foundation. 2 Needs and outcomes: select the applicable outcomes; where evidence of current capability exists, do not reteach demonstrated outcomes. 3 Select existing training using catalogue evidence (outcome scores, suitability, prerequisites, full-course duration), and build internal learning, local use cases and realistic exercises for requirements existing courses do not cover. Planned internal learning needs an owner and earns no assessed coverage until evaluated. 4 Assemble the pathway: sequence learning within learner time, delivery capacity and tool availability; group people with shared needs into cohorts, including across functions.\nShared courses, outcomes and internal learner time are counted once. Supporting tools: the training catalogue (v17) and the staff learning and feedback app; Recommended Training Pathways v0.3 is the current published recommendation. Selection review, delivery readiness and learner competence remain separate decisions.');
}


// ---- Section 2: training catalogue ----
plainNotes(divider(2),'Section 2: the training catalogue — AI training found on the internet and internally, assessed against the framework’s learning outcomes.');

// Catalogue: briefing slide 11 updated from v10 to v17.
{
  const i=8, s=slides[i];
  edit(i,'subtitle','AI-assisted research and internal review, mapped to the framework’s learning outcomes.',72,143,1136,40,26,C.grey);
  edit(i,'catalogue-version','CATALOGUE v17  /  2 NOVEMBER 2026',720,223,488,27,17,C.orange,true);
  edit(i,'catalogue-size','516',720,257,200,90,72,C.navy,true);
  edit(i,'resources-label','active resources\nfrom 160 providers',900,280,308,56,21,C.grey);
  p.delete([sources[i].get('Chart').id]);
  const total=488, learn=Math.round(total*403/516);
  rect(s,'mix-learning',720,360,learn,62,C.blue);
  text(s,'mix-learning-count','403',720,360,learn,62,22,C.paper,true,'center','middle');
  rect(s,'mix-tool',720+learn,360,total-learn,62,C.orange);
  text(s,'mix-tool-count','113',720+learn,360,total-learn,62,22,C.paper,true,'center','middle');
  rect(s,'legend-learning-key',720,440,12,12,C.blue);
  text(s,'legend-learning','Learning entries',740,434,160,24,15,C.grey);
  rect(s,'legend-tool-key',900,440,12,12,C.orange);
  text(s,'legend-tool','Tool training',920,434,160,24,15,C.grey);
  edit(i,'udemy-total','240 available through internal Udemy',720,501,488,38,22,C.navy,true);
  edit(i,'udemy-composition','168 learning entries and 72 tool-training entries',720,542,488,31,18,C.grey);
  edit(i,'rubric-size','23 needs and 140 learning outcomes',720,601,488,36,22,C.navy,true);
  edit(i,'assessment-count','401 learning entries scored against all 140 outcomes. 2 learning entries and\n113 tool-training entries remain unscored. 18 retired resources are excluded.',72,642,1070,46,16,C.grey);
  notes(s,'Catalogue v17 (released 2 November 2026; assessment evidence dated 1 November): 516 active resources, 403 learning entries (Offers) and 113 tool-training entries (Tool track), from 160 providers. 240 are available through the internal Udemy Business catalogue: 168 learning entries and 72 tool-training entries. 401 learning entries are scored 0–3 against every one of the 140 outcomes; 2 learning entries are explicitly unassessed, and tool-track descriptions do not supply rubric scores. 18 resources were retired by user decision on 2 November and are excluded; their records are preserved for history.\nResearch status: external training (AI-assisted research of courses and syllabuses), the internal Udemy catalogue and tool-specific training are done. Other internal training (mylearnings and bank programmes) remains awaiting information.\nThe catalogue records syllabus evidence. Coverage is not demonstrated competence or operational permission. Source: catalogue/AI_Era_Cyber_Training_Catalogue_v17.xlsx and training-planner/public/data/catalogue.json.');
}

// ---- Section 3: learning app ----
plainNotes(divider(3),'Section 3: the learning app — a simple helper app that supports staff to navigate the learning content and receives central recommendations over time.');

// The app for staff.
{
  const s=newSlide('app');
  title(s,'A simple learning app for staff','Where to start, what we recommend and personal progress.');
  const steps=[
    ['Quick setup','Level, responsibility areas\nand planned tools.'],
    ['For you','Central recommendations and\noptional matches, by layer.'],
    ['Explore','Search all 516 resources by\nneed, topic, provider or tool.'],
    ['My learning','Plan, track progress\nand give feedback.']
  ];
  steps.forEach(([head,body],k)=>{
    const y=212+k*98;
    line(s,`app-step-rule-${k}`,72,y,380,C.rule);
    text(s,`app-step-number-${k}`,String(k+1).padStart(2,'0'),72,y+14,40,28,20,C.orange,true);
    text(s,`app-step-title-${k}`,head,120,y+12,332,32,23,C.navy,true);
    text(s,`app-step-body-${k}`,body,120,y+46,332,48,17,C.grey);
  });
  text(s,'app-footnote','One HTML file. No accounts or installation.\nProgress stays in the learner’s browser.',72,612,400,48,16,C.grey);
  s.images.add({blob:new Uint8Array(await fs.readFile(path.join(here,'assets/learning-app-for-you.png'))),contentType:'image/png',alt:'Learning app For you page showing four layers: Foundation, L1, specialisation and tools',fit:'cover',position:{left:496,top:212,width:712,height:445}});
  frame(s,'app-screenshot-frame',496,212,712,445);
  plainNotes(s,'AI Cybersecurity Learning, release 1.6.3 (learning-path/index.html). Staff complete one quick-setup form: L1/L2/L3, broad responsibility areas from the nine model roles, planned tools and optional Python/Git comfort. For you then shows four layers (Foundation, level, specialisation, tools). Each layer separates Central recommendations, from the published plan with its review labels, from optional Suggested for you matches. Explore training searches and filters the full catalogue; My learning holds personal commitments, target dates, notes, progress and feedback, with CSV export.\nIt is one HTML file with no accounts, installation, server, external AI calls or automatic syncing. Progress and feedback are stored in the learner’s browser; staff should keep a backup. Completion is self-reported and does not demonstrate competence. Microsoft Forms feedback is configurable but not yet connected.\nScreenshot: For you after quick setup as L1, Security operations & response, Microsoft 365 Copilot, captured 4 November 2026 with presentations/source/cyber-workforce-pack-20261104/capture_learning_app.cjs.');
}

// Recommendations improve over time.
{
  const s=newSlide('cycle');
  title(s,'Recommendations improve over time','Published centrally through the app, refined with staff feedback.');
  const steps=[
    ['Framework','Defines what people\nneed to learn'],
    ['Catalogue','Supplies assessed\ntraining options'],
    ['Recommended\npathways','Selected and\nreviewed centrally'],
    ['Learning app','Staff choose and\ntrack learning'],
    ['Feedback','Shows what works\nand what is missing']
  ];
  steps.forEach(([head,body],k)=>{
    const x=72+k*235;
    line(s,`cycle-rule-${k}`,x,214,196,C.steel,2);
    text(s,`cycle-number-${k}`,String(k+1).padStart(2,'0'),x,228,60,24,16,C.orange,true);
    text(s,`cycle-title-${k}`,head,x,254,196,62,22,C.navy,true);
    text(s,`cycle-body-${k}`,body,x,322,196,52,18,C.grey);
    if(k<4) arrow(s,`cycle-flow-${k}`,x+201,268,30);
  });
  rect(s,'repeat-band',542,392,666,52);
  text(s,'repeat-text','Repeat as tools, roles and feedback change',542,392,666,52,20,C.navy,true,'center','middle');
  line(s,'status-rule',72,476,1136,C.rule);
  text(s,'status-label','WHERE WE ARE',72,492,400,22,15,C.orange,true);
  const status=[['v0.3','Recommended pathways\npublished in the app'],['Reviewed','Foundation and L1\nselections'],['To be reviewed','L2, L3 and specialist\nrecommendations']];
  status.forEach(([head,body],k)=>{
    const x=[72,466,860][k];
    text(s,`status-title-${k}`,head,x,524,346,34,26,C.navy,true);
    text(s,`status-body-${k}`,body,x,562,346,52,18,C.grey);
  });
  text(s,'cycle-footnote','The app’s feedback form is not yet connected.',72,636,1000,26,16,C.grey);
  plainNotes(s,'The loop: the framework defines needs and outcomes; the catalogue supplies assessed options; the central team selects and reviews Recommended Training Pathways; the app publishes them to staff as Central recommendations; staff learning and feedback show what works and what is missing, informing the next revision. Tools, roles and the catalogue will change, so recommendations are expected to be refreshed over time.\nCurrent status: Recommended Training Pathways v0.3 is published in learner app 1.6.3. Foundation/L1 selections are Reviewed (1 November 2026), as are the core reference placements for TR-109, TR-110, TR-117 and TR-118 (2 November). L2, L3, specialist and coached recommendations remain AI recommendation - to be reviewed. Publication does not imply selection review, delivery readiness or learner competence.\nFeedback: progress and feedback are browser-local. Microsoft Forms is configurable but not connected, so there is no central receipt or automatic syncing yet. Source: recommended-pathways/Recommended-Training-Pathways.md; learning-path/README.md.');
}

// ---- Section 4: baseline for all staff ----
plainNotes(divider(4),'Section 4: a proposal for the first training of all staff, establishing a common baseline that covers Foundation and L1.');

// The proposed baseline (CISO walkthrough slide 4, adapted).
{
  const s=newSlide('baseline');
  title(s,'One proposed baseline for everyone','Foundation + L1: the first training proposed for all staff.');
  const rows=[
    ['CompTIA SecAI+ by CertMike','Udemy (internal) · 6h 11m','Build the shared AI and\ncybersecurity baseline.'],
    ['AI Capabilities and Limitations','Anthropic Academy · 3h 30m','Understand limitations and\nwhen to check outputs.'],
    ['Our AI use cases','Internal session · 1h · to be built','Show what is possible in\nour cybersecurity work.']
  ];
  rows.forEach(([name,meta,why],k)=>{
    const y=212+k*100;
    line(s,`baseline-rule-${k}`,72,y,1136,C.rule);
    text(s,`baseline-name-${k}`,name,72,y+18,560,34,25,C.navy,true);
    text(s,`baseline-meta-${k}`,meta,72,y+56,560,28,19,C.orange);
    text(s,`baseline-why-${k}`,why,680,y+18,528,66,22,C.grey);
  });
  line(s,'baseline-rule-end',72,512,1136,C.rule);
  text(s,'baseline-total','10h 41m total planned learning',72,536,1136,44,32,C.orange,true);
  text(s,'baseline-coverage','Assessed coverage: Foundation 61%, L1 63%. The use-case session is planned, not yet assessed.',72,594,1136,30,20,C.grey);
  plainNotes(s,'Proposed first training for all staff, establishing a common baseline across Foundation and L1. This is the reviewed Foundation/L1 bundle in Recommended Training Pathways v0.3 (reviewed 1 November 2026): TR-281 CompTIA SecAI+ (CY0-001) Complete Course from CertMike (Udemy, 6h 11m), TR-145 AI Capabilities and Limitations (Anthropic Academy, 3h 30m) and the internal AI use cases session (1h; delivery status Proposed, owner Unassigned, linked to N1.1–N1.3). Courses are assigned once in Foundation and inherited by L1. Combined commitment 10h 41m.\nAssessed coverage from catalogue evidence: Foundation pathway 61.0%, L1 pathway 62.6%. Planned coverage including the internal session is 72.1% and 71.9%; planned internal teaching earns no assessed coverage until evaluated. Coverage is syllabus evidence, not demonstrated competence.\nThe Group CISO walkthrough (2 November) framed this as mandatory 2027 learning; here it is presented as a proposal pending formal approval. Source: recommended-pathways/Recommended-Training-Pathways.md; presentations/AI-Era_2027_Next-Steps_Group-CISO_Walkthrough.pptx, slide 4.');
}

// What SecAI+ covers (walkthrough slide 5).
{
  const s=newSlide('secai');
  title(s,'What the SecAI+ course covers','CertMike on Udemy · Mike Chapple and Fred Nwanganga · 6h 11m');
  const rows=[
    ['AI concepts','AI models, prompting and retrieval-augmented generation;\ndata security and the AI lifecycle.'],
    ['Securing AI systems','Threat modelling, access and data controls;\nmonitoring, auditing and responses to AI attacks.'],
    ['AI-assisted security','Using AI for security tasks and automation;\nunderstanding how AI also enhances attacks.'],
    ['Governance, risk\nand compliance','Organisational governance, AI risks and the impact\nof compliance on AI use and development.']
  ];
  rows.forEach(([topic,body],k)=>{
    const y=212+k*92;
    line(s,`secai-rule-${k}`,72,y,1136,C.rule);
    text(s,`secai-topic-${k}`,topic,72,y+16,360,62,24,C.navy,true);
    text(s,`secai-body-${k}`,body,460,y+16,748,62,21,C.grey);
  });
  line(s,'secai-rule-end',72,580,1136,C.rule);
  text(s,'secai-format','Self-paced videos and knowledge checks',72,600,1136,30,21,C.orange,true);
  plainNotes(s,'TR-281: CompTIA SecAI+ (CY0-001) Complete Course from CertMike, by Mike Chapple and Fred Nwanganga on Udemy, available through the internal Udemy Business catalogue. 6h 11m of self-paced video with knowledge checks. Content summary from the course syllabus as recorded in catalogue v14 evidence and the 2 November walkthrough, slide 5. Exam vouchers are not part of the proposal.');
}

// Build the use-case session (walkthrough slide 6, as a flow).
{
  const s=newSlide('usecase');
  title(s,'Build the use-case session from our work','BISOs and domain owners contribute the examples that make it relevant.');
  const steps=[['Collect','Ask every BISO and\ndomain owner for\nuse cases.'],['Describe','Capture the task,\nbenefit, tool and\nhuman checks.'],['Select','Cover a range of\ncybersecurity\nresponsibilities.'],['Build','A one-hour session:\ndemonstrations,\npossibilities, limits.']];
  steps.forEach(([head,body],k)=>{
    const x=[72,374,676,978][k];
    text(s,`usecase-number-${k}`,String(k+1).padStart(2,'0'),x,222,80,40,30,C.orange,true);
    line(s,`usecase-rule-${k}`,x,272,230,C.steel,2);
    text(s,`usecase-title-${k}`,head,x,290,230,44,30,C.navy,true);
    text(s,`usecase-body-${k}`,body,x,348,230,96,21,C.grey);
    if(k<3) arrow(s,`usecase-flow-${k}`,x+244,310,44);
  });
  line(s,'usecase-footer-rule',72,520,1136,C.rule);
  text(s,'usecase-coordination','Proposed coordination: DOM1 for learning; DOM6 for tool availability.',72,540,1136,30,21,C.orange,true);
  plainNotes(s,'The AI use cases session is the one internal element of the baseline (1h, linked to N1.1–N1.3: AI in cyber today, what is emerging, how our work changes). It is Proposed and not yet built; its owner is unassigned. Collect use cases from every BISO and domain owner; describe the task, the benefit, the tool and the human checks; select a range across cybersecurity responsibilities; build a one-hour session with demonstrations, possibilities and limitations. Coordination proposal from the 2 November walkthrough, slide 6: DOM1 for learning, DOM6 for tool availability. Ownership is provisional.');
}

// Next steps.
{
  const s=newSlide('next');
  title(s,'Next steps','From a first step to a launch for all staff.');
  const steps=[['Discuss and\nrefine','Use this pack to shape\nthe proposal.'],['Validate with\nowners','Confirm needs and\nrecommend training.'],['Formal\napproval','Agree the baseline,\nowners and dates.'],['Prepare\ndelivery','Use-case session, access\nand feedback channel.'],['Launch','Announce the offer\nto all staff.']];
  steps.forEach(([head,body],k)=>{
    const x=72+k*235;
    text(s,`next-number-${k}`,String(k+1).padStart(2,'0'),x,222,80,40,30,C.orange,true);
    line(s,`next-rule-${k}`,x,272,196,C.steel,2);
    text(s,`next-title-${k}`,head,x,290,196,70,26,C.navy,true);
    text(s,`next-body-${k}`,body,x,372,196,56,18,C.grey);
    if(k<4) arrow(s,`next-flow-${k}`,x+201,308,30);
  });
  line(s,'next-footer-rule',72,520,1136,C.rule);
  text(s,'next-footer','The framework, catalogue and app will evolve with our experience.',72,540,1136,34,24,C.orange,true);
  plainNotes(s,'Proposed route, adapted from the 2 November walkthrough, slide 9: discuss and refine this pack; validate needs with component owners, who recommend training; hold the formal approval session (baseline, responsibilities and dates); prepare delivery (build the AI use-case session, confirm course and tool access, connect the app’s feedback channel); launch the staff offer (the walkthrough proposed CISO Connect). Ownership, the baseline and dates remain proposals until approved. Review of L2, L3 and specialist recommendations continues alongside.');
}

// ---- Order, export and finalize ----
const current=(await p.inspect({select:'$.slides[*]',include:['id']})).records;
const keyed=new Map([...SOURCE_KEYS,...created].map((k,j)=>[k,current[j].id]));
if(keyed.size!==SLIDES) throw new Error(`Expected ${SLIDES} slides, have ${keyed.size}`);
SOURCE_KEYS.forEach((k,i)=>edit(i,'page-number',String(pageOf(k)),1172,673,36,23,15,DARK.has(k)?C.darkMuted:C.muted,false,'right'));
p.slides.reorder(ORDER.map(k=>keyed.get(k)));

const candidate=path.join(build,'candidate.pptx');
await (await PresentationFile.exportPptx(p)).save(candidate);
await fs.writeFile(path.join(build,'content.ndjson'),(await p.inspect({select:'$.slides[*]',include:['id','index','title','elements.name','elements.kind','elements.text','notes.text']})).ndjson);
const ordered=p.slides.items;
for(let i=0;i<ordered.length;i++){
  await fs.writeFile(path.join(build,'previews',`slide-${i+1}.png`),new Uint8Array(await (await p.export({slide:ordered[i],format:'png',scale:1})).arrayBuffer()));
  await fs.writeFile(path.join(build,'previews',`slide-${i+1}.layout.json`),new Uint8Array(await (await ordered[i].export({format:'layout'})).arrayBuffer()));
}
console.log(JSON.stringify({candidate,slides:ordered.length,previews:path.join(build,'previews')}));

if(process.argv.includes('--finalize')){
  const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
  const result=await finalizePresentation({
    workspaceDir:root,candidatePath:candidate,finalPath:final,explicitTotalSlideCount:SLIDES,
    requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
    pythonExecutable:'/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
    integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
    layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
    layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
    fontPolicy:{basis:'reference',families:[font],referencePath:reference,referenceSha256:createHash('sha256').update(await fs.readFile(reference)).digest('hex')},
    verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')
  });
  console.log(JSON.stringify(result));
  const saved=await PresentationFile.importPptx(await FileBlob.load(final));
  await fs.mkdir(path.join(build,'final-previews'),{recursive:true});
  for(let i=0;i<saved.slides.items.length;i++) await fs.writeFile(path.join(build,'final-previews',`slide-${i+1}.png`),new Uint8Array(await (await saved.export({slide:saved.slides.items[i],format:'png',scale:1})).arrayBuffer()));
  await fs.copyFile(path.join(build,'validation.json'),path.join(here,'validation.json'));
  console.log(`Rendered all ${SLIDES} final slides.`);
}
