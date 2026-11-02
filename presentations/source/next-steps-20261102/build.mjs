import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root=process.cwd();
const runtime=process.env.ARTIFACT_NODE_MODULES || '/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES ||= runtime;
const require=createRequire(path.join(runtime,'_resolver.cjs'));
const {Presentation,PresentationFile,FileBlob}=require('@oai/artifact-tool');
const {GlobalFonts}=require('@napi-rs/canvas');
const build=path.join(root,'.work/presentations/next-steps-20261102-secai');
await fs.mkdir(path.join(build,'previews'),{recursive:true});
for(const weight of ['Regular','Bold']) GlobalFonts.registerFromPath(path.join(root,`presentations/source/capability-model-20261018/assets/IBMPlexSans-${weight}.ttf`));
const reference=path.join(root,'presentations/Agentic-Era_Workforce_Capability_Model_Briefing.pptx');
// Inspect/render actual reference; reuse its canvas, theme and editorial geometry.
const source=await PresentationFile.importPptx(await FileBlob.load(reference));
await fs.writeFile(path.join(build,'reference-slide-3.png'),new Uint8Array(await (await source.export({slide:source.slides.items[2],format:'png',scale:1})).arrayBuffer()));
const p=Presentation.create({slideSize:{width:1280,height:720}});
p.theme.defaultFont='IBM Plex Sans';
const C={navy:'#13202E',paper:'#F6F4EF',orange:'#A24F19',grey:'#4A5563',rule:'#D8D1C4',muted:'#5E6773',bright:'#E8914F'};
p.theme.colorScheme={name:'Cyber capability',themeColors:{accent1:C.orange,accent2:C.bright,accent3:'#7E98AD',accent4:'#1F4D2E',accent5:'#6B3410',accent6:C.grey,bg1:C.paper,bg2:C.navy,tx1:C.navy,tx2:C.grey,dk1:C.navy,dk2:C.grey,lt1:C.paper,lt2:'#EBE6DC',hlink:C.orange,folHlink:C.grey}};
function text(s,name,value,x,y,w,h,size=26,color=C.navy,bold=false){const a=s.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=value;a.text.style={typeface:'IBM Plex Sans',fontSize:size,color,bold,insets:0,autoFit:'none',wrap:'square',verticalAlignment:'top'};return a;}
function line(s,x,y,w){s.shapes.add({geometry:'line',position:{left:x,top:y,width:w,height:0},line:{fill:C.rule,width:1}});}
function slide(title,subtitle){const s=p.slides.add();s.background.fill=C.paper;text(s,'title',title,72,60,1136,70,44,C.navy,true);text(s,'subtitle',subtitle,72,143,1136,70,26,C.grey);text(s,'discussion-footer','DRAFT FOR DISCUSSION',72,677,800,20,14,C.muted);text(s,'page-number',String(p.slides.items.length),1172,673,36,24,15,C.muted);return s;}
function rows(s,data,{top=235,step=88,left=72,labelWidth=340,bodyLeft=454,size=26}={}){data.forEach(([a,b],i)=>{const y=top+i*step;line(s,left,y-15,1208-left);text(s,`label-${i}`,a,left,y,labelWidth,step-16,size,C.navy,true);text(s,`body-${i}`,b,bodyLeft,y,1208-bodyLeft,step-16,size,C.grey);});}
function notes(s,body){s.speakerNotes.text=body+'\n\nSources: user walkthrough brief and agreed skeleton, 2 November 2026; capability-framework/Agentic-Era_Workforce_Capability_Model.md (model 2 revision 3); recommended-pathways/Recommended-Training-Pathways.md (v0.1, catalogue v15); docs/PROJECT_CONTEXT.md. Design reference: Agentic-Era_Workforce_Capability_Model_Briefing.pptx. This is an unofficial walkthrough; formal approval is a separate session.';}
{
const s=slide('From capability model to staff learning','Preparing a coordinated launch for the cybersecurity workforce in 2027');
rows(s,[['Establish ownership','Give each model component an accountable owner.'],['Prepare common learning','Foundation + L1 as the proposed baseline for all.'],['Make learning relevant','Domain recommendations and training aligned to tools.'],['Bring it together','Launch the staff offer at CISO Connect.']],{step:94});
notes(s,'Initial unofficial walkthrough with the Group CISO. Discuss the direction and next steps without per-slide approval requests. The mandatory completion year is 2027; launch and submission dates remain unset.');
}
{
const s=slide('Proposed ownership across the model','Provisional mapping — each owner validates needs and recommends training');
const values=[['Owner','Model components'],['DOM1','Foundation; L1, L2, L3; Security architecture & engineering'],['DOM2','Security operations & response; Threat intelligence & detection;\nVulnerability & exposure management'],['DOM3','Offensive security & testing — red team'],['DOM7','Offensive security & testing — secure coding'],['DOM4','Governance, risk, compliance & assurance'],['DOM10','Security awareness & culture'],['DOM5','Identity & access management'],['EXCO','Leadership'],['DOM6','Tooling']];
const t=s.tables.add({rows:values.length,columns:2,left:72,top:222,width:1136,height:420,columnWidths:[150,986],values});
t.borders.assign({fill:C.rule,width:0.5,style:'solid'});
t.cells.block({row:0,column:0,rowCount:values.length,columnCount:2}).assign({margins:{top:3,bottom:3,left:9,right:9}});
for(let r=0;r<values.length;r++){t.rows[r].height=r===2?64:39;for(let c=0;c<2;c++){const cell=t.getCell(r,c);cell.fill=C.paper;cell.text.style={typeface:'IBM Plex Sans',fontSize:23,color:r===0?C.orange:C.navy,bold:r===0||c===0};}}
notes(s,'Ownership is provisional, exactly as requested. Each domain nominates an accountable lead. Secure coding and red team are the proposed split of Offensive security and testing for ownership purposes. Reconcile exact learning-outcome boundaries with the current model, including related code-analysis and architecture outcomes, before changing framework sources. No model or recommendation source has been changed by this deck.');
}
{
const s=slide('Owners turn needs into recommendations','A clear learning offer for the people who need each component');
text(s,'all-label','EVERY COMPONENT OWNER',72,235,520,28,18,C.orange,true);
text(s,'all-body','Validate the learning needs\nand identify gaps or changes.\n\nRecommend training and\nidentify the staff audience.\n\nIdentify internal learning to build\nand nominate delivery leads.',72,286,520,310,28,C.navy);
text(s,'tools-label','DOM6: TOOLS AND ACCESS',690,235,518,28,18,C.orange,true);
text(s,'tools-body','Identify relevant tools\nand intended uses.\n\nSet out who gets access\nand when.\n\nAlign recommended training\nwith tool availability.',690,286,518,310,28,C.navy);
notes(s,'Component owners should return validated needs, recommended courses and audiences, and proposed internal teaching with delivery leads. DOM6 supplies the tool selection and availability view by audience, together with training. Existing specialist and higher-level recommendations remain AI recommendations awaiting owner review.');
}
{
const s=slide('One proposed baseline for everyone','Foundation + L1 — mandatory learning proposed for 2027');
rows(s,[['CertMike SecAI+\nUdemy · 6h 11m','Build the shared AI and\ncybersecurity baseline.'],['Anthropic · 3h 30m\nAI Capabilities and Limitations','Understand limitations and\nwhen to check outputs.'],['Our AI use cases · 1h\nInternal session — to be built','Show what is possible\nin our cybersecurity work.']],{step:110,size:26,labelWidth:440,bodyLeft:560});
text(s,'total','10h 41m total planned learning',72,597,1136,42,32,C.orange,true);
notes(s,'Reviewed Foundation/L1 selection: TR-281 CompTIA SecAI+ (CY0-001) Complete Course from CertMike! (6h 11m), TR-145 AI Capabilities and Limitations (3h 30m), plus the saved one-hour AI use cases brief. Shared learning is counted once; L1 adds no separate course in this selection. The internal brief is Proposed and not delivery-ready. Mandatory status, completion deadline and tracking arrangements require the later formal approval session. Completion is not proof of competence or operational authorisation. Course sources: https://www.udemy.com/course/comptia-secai-certmike/ and https://academy.claude.com/courses/ai-capabilities-and-limitations (saved catalogue records).');
}
{
const s=slide('What the SecAI+ course covers','CertMike on Udemy · Mike Chapple and Fred Nwanganga · 6h 11m');
rows(s,[['AI concepts','AI models, prompting and retrieval-augmented generation;\ndata security and the AI lifecycle.'],['Securing AI systems','Threat modelling, access and data controls;\nmonitoring, auditing and responses to AI attacks.'],['AI-assisted security','Using AI for security tasks and automation;\nunderstanding how AI also enhances attacks.'],['Governance, risk\nand compliance','Organisational governance, AI risks and the impact\nof compliance on AI use and development.']],{step:88,size:26});
text(s,'course-format','Self-paced videos and knowledge checks',72,610,1136,35,23,C.orange);
notes(s,'Course content summary for the selected TR-281, checked on 2 November 2026 against the provider syllabus: https://www.udemy.com/course/comptia-secai-certmike/ . The page lists 30 sections, 147 lectures and 6h 11m, updated August 2026. It describes four subject domains and explicitly lists prompting and retrieval-augmented generation. The summary groups that published content for an executive audience. The saved catalogue evidence at catalogue/evidence/v14/README.md and sources.json corroborates the course identity, duration and video/knowledge-check format. No learner lab has been verified. Course subject coverage is not evidence of measured competence, full coverage of our model, or operational authorisation. The proposed programme does not require the certification exam.');
}
{
const s=slide('Build the use-case session from our work','BISOs and Domain owners contribute the examples that make it relevant');
rows(s,[['Collect','Ask every BISO and Domain owner for use cases.'],['Describe','Capture the task, benefit, tool and human checks.'],['Select','Cover a range of cybersecurity responsibilities.'],['Build','Create a one-hour session with demonstrations,\npossibilities and limitations.']],{step:87});
text(s,'coordination','Proposed coordination: DOM1 for learning; DOM6 for tool availability.',72,612,1136,35,23,C.orange);
notes(s,'Nominate a session lead and set a contribution deadline during delivery planning. Contributors should distinguish usable demonstrations from future possibilities. Use safe examples suitable for internal teaching. DOM1 coordination is proposed, not an existing appointment; DOM6 supports tools and availability. The existing one-hour internal brief remains the source rather than a new duplicate teaching commitment.');
}
{
const s=slide('Four connected offers for staff','Common learning, relevant recommendations and support for practical use');
rows(s,[['Mandatory 2027 training','A clear baseline everyone completes.'],['Domain recommendations','Additional learning relevant to responsibilities.'],['Cyber AI learning plan app','Discover learning, plan development\nand provide feedback.'],['Cybersecurity prompt library','Find useful prompts, contribute new ones\nand rate their usefulness.']],{step:94});
notes(s,'These are intended launch offers. The learner app 1.6.0 exists and publishes Recommended Training Pathways v0.1. Current learner progress and feedback are browser-local, and Microsoft Forms is configurable but unconnected. Confirm operational ownership and shared feedback collection before announcing central receipt. The prompt library and contribution/rating mechanisms require preparation and operational ownership, including review of submitted prompts. This slide does not assert that those mechanisms already exist.');
}
{
const s=slide('CISO Connect: make the next step clear','One announcement explains the offer and how staff can take part');
rows(s,[['01   Why this matters','How AI changes our work and how the model helps.'],['02   What to complete','The mandatory learning proposed for 2027.'],['03   What else to learn','Domain recommendations and relevant tool training.'],['04   Where to go','The learning app and cybersecurity prompt library.'],['05   How to contribute','Use cases, new prompts, ratings and feedback.']],{step:78,size:25});
notes(s,'This is the proposed storyline for the future staff announcement, not that announcement itself. Assemble the CISO Connect presentation alongside the learning content and supporting services. Before launch, confirm owners, course access and links, service availability, staff instructions and dates. Avoid presenting future tool access or proposed internal training as already available.');
}
{
const s=slide('Proposed route to launch','Use this walkthrough to shape the delivery proposal');
rows(s,[['Refine the proposal','Discuss ownership, the baseline and the staff offer.'],['Prepare delivery details','Validate needs, collect use cases and plan tools.'],['Formal approval session','Present responsibilities, requirements and dates.'],['Complete preparation','Finalise learning, services and the launch presentation.'],['Launch at CISO Connect','Announce the offer and explain staff actions.']],{step:78,size:25});
notes(s,'Formal approval is a separate, later session. Preparation includes accountable leads, component-owner submissions, mandatory completion and tracking arrangements, use-case session delivery, app and prompt-library operations, and launch coordination. Dates remain unset. Use delivery readiness to determine the announcement date; do not imply that provisional ownership or the proposed 2027 requirement has already been approved.');
}
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
const skill='/Users/cyberk/.codex/plugins/cache/openai-primary-runtime/presentations/26.1026.10807/skills/presentations';
const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
const final=path.join(root,'presentations/AI-Era_2027_Next-Steps_Group-CISO_Walkthrough.pptx');
const result=await finalizePresentation({workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath:final,explicitTotalSlideCount:9,requiredNativeTableOwnerSlides:[2],requiredNativeChartOwnerSlides:[],pythonExecutable:'/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','2'],fontPolicy:{basis:'reference',families:['IBM Plex Sans'],referencePath:reference,referenceSha256:createHash('sha256').update(await fs.readFile(reference)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')});
console.log(JSON.stringify(result));
const saved=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<saved.slides.items.length;i++)await fs.writeFile(path.join(build,'previews',`slide-${i+1}.png`),new Uint8Array(await (await saved.export({slide:saved.slides.items[i],format:'png',scale:1})).arrayBuffer()));
await fs.copyFile(path.join(build,'validation.json'),path.join(root,'presentations/source/next-steps-20261102/validation.json'));
console.log('Rendered all 9 final slides.');
