import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { GlobalFonts } from '@napi-rs/canvas';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const ROOT='/Users/cyberk/projects/ai-era-training';
const BUILD=path.join(ROOT,'.presentation-build/capability-model-20261018');
const FONT='IBM Plex Sans';
for(const weight of ['Regular','Bold']) GlobalFonts.registerFromPath(path.join(BUILD,`assets/IBMPlexSans-${weight}.ttf`));
const C={navy:'#13202E',paper:'#F6F4EF',orange:'#A24F19',bright:'#E8914F',grey:'#4A5563',muted:'#5E6773',rule:'#D8D1C4',pale:'#EBE6DC',steel:'#7E98AD',darkMuted:'#B7C3CE',darkRule:'#465361',darkPanel:'#223242'};
const pres=Presentation.create({slideSize:{width:1280,height:720}});
pres.theme.defaultFont=FONT;
pres.theme.colorScheme={name:'Cyber capability',themeColors:{accent1:C.orange,accent2:C.bright,accent3:C.steel,accent4:'#1F4D2E',accent5:'#6B3410',accent6:C.grey,bg1:C.paper,bg2:C.navy,tx1:C.navy,tx2:C.grey,dk1:C.navy,dk2:C.grey,lt1:C.paper,lt2:C.pale,hlink:C.orange,folHlink:C.grey}};

function text(s,name,value,x,y,w,h,size=26,color=C.navy,bold=false,align='left'){
 const a=s.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 a.text=value;
 a.text.style={typeface:FONT,fontSize:size,color,bold,insets:0,autoFit:'none',wrap:'square',verticalAlignment:'top',alignment:align};
 return a;
}
function box(s,name,x,y,w,h,fill){return s.shapes.add({geometry:'rect',name,position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});}
function line(s,name,x,y,w,color=C.rule,weight=1,h=0){return s.shapes.add({geometry:'line',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:color,width:weight,style:'solid'}});}
function arrow(s,name,x,y,w,color=C.orange){return s.shapes.add({geometry:'connector',kind:'straight',name,position:{left:x,top:y,width:w,height:0},line:{fill:color,width:2},tail:{type:'triangle',width:'sm',length:'sm'}});}
function slide(title,subtitle,num,dark=false){
 const s=pres.slides.add();s.background.fill=dark?C.navy:C.paper;
 text(s,'title',title,72,60,1136,70,44,dark?C.paper:C.navy,true);
 if(subtitle)text(s,'subtitle',subtitle,72,143,1136,70,26,dark?C.darkMuted:C.grey);
 text(s,'page-number',String(num),1172,673,36,23,15,dark?C.darkMuted:C.muted,false,'right');
 return s;
}
const source='Source: Agentic-Era_Workforce_Capability_Model.md, version 2, updated 18 October 2026. Authoritative local source: /Users/cyberk/projects/ai-era-training/Agentic-Era_Workforce_Capability_Model.md.';
function notes(s,body,section,extra=''){s.speakerNotes.text=`${body}\n\n${source}\nRelevant section: ${section}.\n${extra}`;}

// 1. The transformation premise and the continuing mission.
{
 const s=pres.slides.add();s.background.fill=C.navy;
 text(s,'title','AI will transform the\ncybersecurity organisation',72,64,1136,133,52,C.paper,true);
 text(s,'transformation-premise','We are preparing for agents to perform most of the work\ncurrently done manually.',72,216,1136,82,28,C.darkMuted);
 line(s,'comparison-rule',72,333,1136,C.darkRule);
 text(s,'today-label','TODAY',72,364,420,28,18,C.bright,true);
 text(s,'today-work','People perform\nmost tasks manually',72,410,424,96,34,C.paper,true);
 arrow(s,'operating-model-transition',525,451,65,C.bright);
 text(s,'future-label','FUTURE',660,364,548,28,18,C.bright,true);
 text(s,'future-work','Agents execute work',660,410,548,48,34,C.paper,true);
 text(s,'human-work','People use, supervise and build AI',660,468,548,68,26,C.darkMuted);
 line(s,'purpose-rule',72,567,1136,C.darkRule);
 text(s,'mission','Protect the bank against current and future threats',72,609,1136,54,30,C.paper,true);
 text(s,'page-number','1',1172,673,36,23,15,C.darkMuted,false,'right');
 notes(s,'We are preparing for an operating model in which agents perform most work currently done manually. This is the strategic premise for the programme, not a measured forecast or a target for reducing headcount. Roles will evolve so that people can use AI effectively, supervise its work and build and evaluate agents where their responsibilities require it. The purpose remains protecting the bank against current and future threats. Human judgement, cybersecurity expertise and accountability remain essential. This presentation explains the capabilities needed and the priorities for developing them.','The model in one page; N14','Framing and wording follow the user-approved presentation plan, 18 October 2026.');
}

// 2. Four contributions, not a four-level ladder.
{
 const s=slide('The capability model','Everyone shares a foundation. The rest follows their work.',2);
 const xs=[72,366,660,954], ws=[250,250,250,254];
 const labels=['Foundation','Agentic\nlevel','Relevant role\nspecialisms','Tool\ntraining'];
 const descriptions=['What everyone\nshould understand','How they work\nwith agents','What their\nresponsibilities require','How they use\ntheir deployed tools'];
 text(s,'common-label','SHARED',72,234,250,27,17,C.orange,true);
 text(s,'selected-label','SELECTED FOR THE PERSON',366,234,842,27,17,C.orange,true);
 line(s,'common-rule',72,273,250,C.orange,3);
 line(s,'selected-rule',366,273,842,C.steel,3);
 xs.forEach((x,i)=>{text(s,`component-${i+1}`,labels[i],x,300,ws[i],83,31,C.navy,true);text(s,`component-meaning-${i+1}`,descriptions[i],x,404,ws[i],72,24,C.grey);});
 [332,626,920].forEach((x,i)=>text(s,`plus-${i+1}`,'+',x,322,28,45,33,C.orange,false,'center'));
 line(s,'profile-join',72,496,1136,C.rule,2);
 xs.forEach((x,i)=>line(s,`component-link-${i+1}`,x+ws[i]/2,477,0,C.rule,2,19));
 line(s,'profile-link',640,496,0,C.orange,2,28);
 box(s,'profile-band',72,524,1136,86,C.navy);
 text(s,'profile-result','Target capability profile',105,548,1070,49,33,C.paper,true,'center');
 text(s,'core-craft','Existing cybersecurity expertise remains essential',72,639,1136,33,23,C.grey);
 notes(s,'The model combines four components into a target capability profile. Foundation is shared by everyone in the cyber workforce and is not a fourth agentic level. Choose an agentic level according to how the person will work with agents, then select role specialisms and training on the tools they will use. Role specialisms and tool training can apply at any level. A person may hold several responsibilities. Existing cybersecurity expertise is assumed and must be maintained and enhanced. This diagram describes a capability profile, not a course sequence or an operational permission model.','The model in one page');
}

// 3. Foundation topics with a concise reason to learn each one.
{
 const s=slide('Foundation: possibilities and risks','Common understanding for everyone in cyber',3);
 const rows=[
  ['AI in cyber','Show what AI can do to inspire ideas\nfor changing our work.'],
  ['AI systems and agents','Understand how agents work,\nuse tools and take action.'],
  ['AI limitations','Recognise errors and overconfidence.\nKnow when and how to check.'],
  ['Responsible AI use','Protect information and apply\nthe bank’s rules.'],
  ['AI-enabled threats','Understand how attackers use AI\nand how defence must adapt.']
 ];
 rows.forEach(([label,desc],i)=>{const y=230+i*82;line(s,`foundation-rule-${i}`,72,y-15,1136);text(s,`foundation-topic-${i}`,label,72,y+3,340,65,28,C.navy,true);text(s,`foundation-purpose-${i}`,desc,454,y,754,70,26,C.grey);});
 notes(s,'Foundation builds a common understanding of both the opportunity and the risks. AI in cyber should show real possibilities, for example investigation and enrichment, code analysis, and policy assessment. The aim is to seed imagination about how work could change, rather than teach a particular product. AI systems and agents covers basic components, tools and actions. Limitations includes hallucination, prompt injection, context loss and automation bias, together with checking habits. Responsible use covers information handling and the bank’s approved-use rules. Threat awareness addresses how attackers use AI and how defence must adapt. Foundation uses the shared outcomes in N1–N5. Third-party vetting in N4.7 and specialist threat tracking in N5.7 sit elsewhere in the model.','Foundation; N1–N5');
}

// 4. Three patterns of work, not grades.
{
 const s=slide('Agentic levels: how people work','The target follows the work, not seniority',4);
 const cols=[
  [72,'L1','Work with\nAI assistance','Perform the work.\nProvide context and\ncheck AI outputs.'],
  [466,'L2','Supervise\nagents','Delegate, monitor, verify\nand intervene.\nOwn the result.'],
  [860,'L3','Build and\nevaluate agents','Design behaviour and\nworkflows. Test reliability\nand improve performance.']
 ];
 cols.forEach(([x,level,heading,body],i)=>{text(s,`level-${i}`,level,x,235,346,77,61,C.orange,true);line(s,`level-rule-${i}`,x,328,346,C.rule,2);text(s,`level-heading-${i}`,heading,x,355,346,95,34,C.navy,true);text(s,`level-description-${i}`,body,x,470,346,115,25,C.grey);});
 text(s,'progression','Higher levels build on earlier capabilities. Not everyone needs L3.',72,631,1136,37,24,C.grey);
 notes(s,'The formal labels are L1 Entry, L2 Practitioner and L3 Expert. They describe target agentic capabilities, not seniority or professional expertise. L1 people primarily perform the work themselves and use AI assistance. L2 people supervise agents, adapt task instructions in approved workflows and run task checks. L3 people design agent behaviour, workflows and evaluation approaches. L3 includes no-code and low-code builders. Writing reusable task instructions does not by itself make a person L3. Shared infrastructure and specialist security design belong to the relevant role specialism. Higher levels build on lower shared capabilities, but demonstrated skills need not be retaught. A senior leader can be L1. Capability levels do not grant operational authorisation.','Agentic levels; The L2/L3 boundary; N6–N11');
}

// 5. Nine roles, in source order, with equal visual weight.
{
 const s=slide('Role specialisms','Capabilities follow responsibilities, at any agentic level',5);
 const roles=['Security operations\n& response','Threat intelligence\n& detection','Offensive security\n& testing','Vulnerability &\nexposure management','Security architecture\n& engineering','Governance, risk,\ncompliance & assurance','Security awareness\n& culture','Identity & access\nmanagement','Leadership'];
 roles.forEach((role,i)=>{const col=Math.floor(i/3),row=i%3,x=72+394*col,y=235+119*row;line(s,`role-rule-${i}`,x,y-17,346);text(s,`role-number-${i}`,String(i+1).padStart(2,'0'),x,y+3,42,35,22,C.orange,true);text(s,`role-${i}`,role,x+56,y,292,100,27,C.navy,true);});
 text(s,'multiple-specialisms','One person may need specialisms from several roles',72,631,1136,38,24,C.grey);
 notes(s,'These are the nine roles in the current model, shown in source order down each column. They preserve the project’s grouping of ECSF profiles, including explicit IAM and vulnerability and exposure management roles. They are not a new list of official ECSF profiles or a fixed organisational chart. Select outcomes for actual responsibilities; one person can need specialisms across several roles, at any agentic level. Examples include responding to agent incidents, managing agent identities, assessing AI risk and leading workflow transformation. Specialist depth follows the responsibility. A role does not require a new standalone module when shared learning and tool practice already meet its needs. Current ordering places IAM eighth and Leadership ninth.','Role specialisms — what the job requires');
}

// 6. Tool adoption and training meet at the same deployment milestone.
{
 const s=pres.slides.add();s.background.fill=C.navy;
 text(s,'title','Transformation requires\ntools and training together',72,57,1136,125,48,C.paper,true);
 text(s,'timing-message','Training should arrive with access',72,204,1136,45,29,C.bright,true);
 text(s,'general-label','GENERAL-PURPOSE WORK AND BUILDING',72,279,540,28,17,C.bright,true);
 text(s,'general-tools','Microsoft Copilot Cowork\nAnthropic Claude Cowork and Claude Code',72,319,548,71,24,C.paper);
 text(s,'specialist-label','SPECIALIST CYBER WORK',680,279,528,28,17,C.bright,true);
 text(s,'specialist-tools','Agentic SOC tools, such as Microsoft Sentinel\nwith Security Copilot, or selected alternatives',680,319,528,71,24,C.paper);
 line(s,'tool-timeline-divider',72,419,1136,C.darkRule);
 box(s,'aligned-deployment',970,440,238,210,C.darkPanel);
 text(s,'prepare-heading','PREPARE',279,446,260,25,17,C.darkMuted,true,'center');
 text(s,'pilot-heading','PILOT',637,446,210,25,17,C.darkMuted,true,'center');
 text(s,'deploy-heading','DEPLOY',990,446,198,25,17,C.bright,true,'center');
 text(s,'tools-track','Tools',72,493,158,45,24,C.paper,true);
 text(s,'tool-prepare','Select tools\nand timeline',279,488,260,69,25,C.paper,false,'center');
 text(s,'tool-pilot','Pilot access',637,505,210,40,25,C.paper,false,'center');
 text(s,'tool-deploy','Deployment',990,505,198,40,25,C.paper,true,'center');
 arrow(s,'tools-to-pilot',563,523,43,C.steel);arrow(s,'tools-to-deploy',887,523,53,C.steel);
 text(s,'training-track','Training',72,579,158,45,24,C.paper,true);
 text(s,'training-prepare','Dedicated\ntraining plans',279,574,260,69,25,C.paper,false,'center');
 text(s,'training-pilot','Hands-on\npractice',637,574,210,69,25,C.paper,false,'center');
 text(s,'training-deploy','Training lands\nwith access',990,574,198,69,25,C.paper,true,'center');
 arrow(s,'training-to-pilot',563,608,43,C.bright);arrow(s,'training-to-deploy',887,608,53,C.bright);
 text(s,'tool-example-note','Illustrative tools, subject to selection',72,670,1000,26,17,C.darkMuted);
 text(s,'page-number','6',1172,673,36,23,15,C.darkMuted,false,'right');
 notes(s,'AI transformation depends on people having access to suitable agentic tools. General-purpose options include Microsoft Copilot Cowork, Anthropic Claude Cowork and Claude Code. Specialist tools should serve the work of each function, including an agentic SOC; Microsoft Sentinel with Security Copilot is an illustrative option, not a procurement recommendation. Select the tools and establish the deployment timeline, then create dedicated training plans for the tasks and permissions of each audience. Foundation can start earlier. Provide hands-on access during pilots and align product-specific training with deployment so that learning can be applied immediately. The same product can require different training for users, supervisors and builders. No deployment dates or purchase decisions are assumed.','Tool training; Planning tool training','Product references checked 18 October 2026:\nhttps://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/get-started\nhttps://claude.com/resources/articles/best-practices-for-getting-started-with-claude-cowork\nhttps://learn.microsoft.com/en-us/azure/sentinel/sentinel-security-copilot');
}

// 7. Outcomes provide the bridge between the model and learning resources.
{
 const s=slide('The model defines what people learn','Clear outcomes guide training selection',7);
 const xs=[72,374,676,978], labels=['Capability\nprofile','Learning\nneeds','Observable\noutcomes','Training\nand practice'];
 const defs=['What the person\nneeds to do','Topics they\nneed to learn','What they must know\nor demonstrate','Courses and\npractical exercises'];
 xs.forEach((x,i)=>{line(s,`learning-stage-rule-${i}`,x,279,230,i===0?C.orange:C.steel,3);text(s,`learning-stage-${i}`,labels[i],x,306,230,91,32,C.navy,true);text(s,`learning-definition-${i}`,defs[i],x,416,230,91,24,C.grey);if(i<3)arrow(s,`learning-flow-${i}`,x+252,355,27);});
 box(s,'learning-content-band',72,549,1136,76,C.pale);
 text(s,'generic-learning','Generic capabilities',102,571,475,40,28,C.navy,true,'center');
 text(s,'learning-plus','+',617,567,46,45,33,C.orange,false,'center');
 text(s,'cyber-learning','Cyber-specific learning',703,571,475,40,28,C.navy,true,'center');
 text(s,'existing-capability','Build on what people can already demonstrate',72,646,1100,31,23,C.grey);
 notes(s,'A capability profile specifies the target. Learning needs identify the topics required to reach that target. Learning outcomes state what a person must know or do and allow training resources and realistic exercises to be selected and assessed. Compare target outcomes with demonstrated current capability so that people do not repeat learning unnecessarily. Without a baseline, these are target learning needs, not measured skill gaps. Generic capabilities transfer across functions, such as supervising or evaluating agents. Cyber-specific learning concerns cybersecurity work, threats and controls. These are content categories, independent of level, role and tool access. Generic does not mean everyone must take it, and some cyber-specific awareness has a broad audience. Course coverage, demonstrated competence and operational permission are separate decisions.','From the model to learning needs; Generic and cyber-specific learning needs; From target work to a training plan');
}

// 8. Delivery priorities, with a continuous workforce-practices workstream.
{
 const s=slide('Priorities for implementation','Coordinate capability development, tools and ways of working',8);
 const x=[72,374,676,978], w=230;
 const stage=['VALIDATE','PREPARE','PLAN','ROLL OUT'];
 x.forEach((xx,i)=>{text(s,`priority-stage-${i}`,stage[i],xx,230,w,28,17,C.orange,true);line(s,`priority-stage-rule-${i}`,xx,268,w,C.rule,2);if(i<3)arrow(s,`priority-stage-flow-${i}`,xx+250,340,30);});
 const pri=(n,copy,xx,yy)=>{text(s,`priority-number-${n}`,String(n).padStart(2,'0'),xx,yy,35,28,18,C.orange,true);text(s,`priority-${n}`,copy,xx,yy+33,230,76,25,C.navy,true);};
 pri(1,'Validate model\nand needs',x[0],293);
 pri(2,'Select or build\ntraining',x[1],293);
 pri(3,'Select tools\nand timeline',x[1],402);
 pri(4,'Who learns what\nand when',x[2],293);
 pri(5,'Define gates\nand certification',x[2],402);
 pri(6,'Pilot and roll out\nin phases',x[3],293);
 box(s,'workforce-practices-band',72,538,1136,125,C.navy);
 text(s,'workforce-practices-label','WORKFORCE PRACTICES ALONGSIDE TRAINING',96,555,1090,26,17,C.bright,true);
 text(s,'junior-development','Develop junior\ncyber judgement',96,592,324,66,25,C.paper,true);
 text(s,'skills-maintenance','Maintain expertise\nthrough practice',472,592,324,66,25,C.paper,true);
 text(s,'overreliance','Counter overreliance\nand rehearse takeover',848,592,335,66,25,C.paper,true);
 notes(s,'First validate the model and learning needs with the relevant leaders and practitioners. Training selection and tool planning should run in parallel: choose suitable courses and exercises, build missing material, and establish the approved tool roadmap and access dates. Together these inputs determine the audiences, what they learn and when. Define readiness gates and the role of certification before widening use. These are design decisions to develop, not an existing approved certification policy. Distinguish training completion, practical competence and operational authorisation. Pilot and roll out in phases, using evidence from each phase to refine the next. Throughout the programme, address workforce practices: give juniors supervised cases that build independent judgement, maintain core skills with investigations and exercises without AI, form independent assessments before reviewing AI output where appropriate, and rehearse agent failures, takeover and continued operation.','From target work to a training plan; N14.5–N14.7','Delivery priorities follow the user-approved presentation plan, 18 October 2026.');
}

await fs.mkdir(path.join(BUILD,'previews'),{recursive:true});
for(const [i,s] of pres.slides.items.entries()){
 const png=await pres.export({slide:s,format:'png',scale:1.3});
 await fs.writeFile(path.join(BUILD,'previews',`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
 const layout=await s.export({format:'layout'});
 await fs.writeFile(path.join(BUILD,'previews',`slide-${i+1}.layout.json`),await layout.text());
}
const candidate=path.join(BUILD,'candidate.pptx');
await (await PresentationFile.exportPptx(pres)).save(candidate);
await fs.writeFile(path.join(BUILD,'presentation.json'),JSON.stringify(pres.toProto()));
console.log(JSON.stringify({candidate,slideCount:pres.slides.items.length,previews:path.join(BUILD,'previews'),font:FONT,fontRegistered:GlobalFonts.families.some(f=>f.family===FONT)},null,2));
