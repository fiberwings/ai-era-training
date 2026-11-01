import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {GlobalFonts} from '@napi-rs/canvas';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
import {applyPresentationChartFont} from '/Users/cyberk/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.11052/skills/presentations/container_tools/artifact_tool_utils.mjs';

const ROOT='/Users/cyberk/projects/ai-era-training';
const DIR=path.join(ROOT,'.presentation-build/capability-model-catalogue-20261018');
const FONT='IBM Plex Sans';
for(const weight of ['Regular','Bold'])GlobalFonts.registerFromPath(path.join(ROOT,`.presentation-build/capability-model-20261018/assets/IBMPlexSans-${weight}.ttf`));
const data=JSON.parse(await fs.readFile(path.join(ROOT,'training-planner/public/data/catalogue.json'),'utf8'));
assert.equal(createHash('sha256').update(await fs.readFile(path.join(ROOT,data.filename))).digest('hex'),data.sourceSha256);
const c=data.courses;
const totals={resources:c.length,learning:c.filter(c=>c.track==='general').length,tool:c.filter(c=>c.track==='tool').length,udemy:c.filter(c=>c.provider==='Udemy Business (internal)').length,udemyLearning:c.filter(c=>c.provider==='Udemy Business (internal)'&&c.track==='general').length,udemyTool:c.filter(c=>c.provider==='Udemy Business (internal)'&&c.track==='tool').length,assessed:c.filter(c=>Object.keys(c.scores).length).length,needs:data.needs.length,outcomes:data.requirements.length};
assert.deepEqual(totals,{resources:528,learning:411,tool:117,udemy:250,udemyLearning:174,udemyTool:76,assessed:409,needs:23,outcomes:140});
const cohortCount=JSON.parse(await fs.readFile(path.join(ROOT,'training-planner/public/data/default-scenario.json'),'utf8')).cohorts.length;
assert.equal(cohortCount,23);
const pres=await PresentationFile.importPptx(await FileBlob.load(path.join(DIR,'source.pptx')));
assert.equal(pres.slides.items.length,10);
const C={navy:'#13202E',paper:'#F6F4EF',orange:'#A24F19',grey:'#4A5563',muted:'#5E6773',rule:'#D8D1C4',blue:'#245695',green:'#286344',red:'#C62828'};
function text(s,name,value,x,y,w,h,size=26,color=C.navy,bold=false,align='left'){
 const a=s.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 a.text=value;a.text.style={typeface:FONT,fontSize:size,color,bold,insets:0,autoFit:'none',wrap:'none',verticalAlignment:'top',alignment:align};return a;
}
function line(s,name,x,y,w,color=C.rule,weight=1){return s.shapes.add({geometry:'line',name,position:{left:x,top:y,width:w,height:0},fill:'none',line:{fill:color,width:weight}});}
function page(title,subtitle,num){
 const s=pres.slides.add();s.background.fill=C.paper;
 text(s,'title',title,72,60,1136,67,44,C.navy,true);
 text(s,'subtitle',subtitle,72,143,1136,65,25,C.grey);
 text(s,'draft-for-discussion','DRAFT FOR DISCUSSION',960,8,280,21,16,C.red,true,'right');
 text(s,'page-number',String(num),1172,673,36,23,15,C.muted,false,'right');return s;
}

// 11. Research status plus the exact size and composition of catalogue v10.
{
 const s=page('How the training catalogue was built','AI-assisted research and internal review, mapped to the model’s learning outcomes.',11);
 text(s,'research-label','RESEARCH AND REVIEW',72,223,560,28,17,C.orange,true);
 const rows=[
  ['External training','AI-assisted research of courses and syllabuses.','Done',C.green],
  ['Internal Udemy catalogue','Review of learning available through the bank.','Done',C.green],
  ['Tool-specific training','External review of product and platform training.','Done',C.green],
  ['Other internal training','mylearnings and bank programmes.','Awaiting information',C.orange]
 ];
 rows.forEach(([title,desc,status,color],i)=>{
  const y=266+i*88;
  line(s,`source-rule-${i}`,72,y-10,568);
  text(s,`source-title-${i}`,title,72,y,425,37,27,C.navy,true);
  text(s,`source-description-${i}`,desc,72,y+39,568,30,20,C.grey);
  text(s,`source-status-${i}`,status,430,y+4,210,30,18,color,true,'right');
 });
 text(s,'catalogue-version','CATALOGUE v10  /  18 OCTOBER 2026',720,223,488,27,17,C.orange,true);
 text(s,'catalogue-size',String(totals.resources),720,257,200,90,76,C.navy,true);
 text(s,'resources-label','resources',922,293,286,42,29,C.grey);
 const chart=s.charts.add('bar',{
  name:'catalogue-composition',position:{left:706,top:355,width:516,height:135},
  categories:['Catalogue v10'],
  series:[{name:'Learning entries',values:[totals.learning],fill:C.blue,line:{fill:'none',width:0}},{name:'Tool training',values:[totals.tool],fill:C.orange,line:{fill:'none',width:0}}],
  barOptions:{direction:'bar',grouping:'stacked',overlap:100,gapWidth:20},
  hasLegend:true,legend:{position:'bottom',overlay:false,textStyle:{fontSize:19,fill:C.navy}},
  xAxis:{visible:false,min:0,max:528,majorGridlines:null,minorGridlines:null,tickLabelPosition:'none',line:{fill:'none',width:0}},
  yAxis:{visible:false,majorGridlines:null,minorGridlines:null,tickLabelPosition:'none',line:{fill:'none',width:0}},
  dataLabels:{showValue:true,position:'center',numberFormatCode:'0',textStyle:{fontSize:25,fill:'#FFFFFF',bold:true}},
  chartFill:'none',chartLine:{fill:'none',width:0},plotAreaFill:'none',plotAreaLine:{fill:'none',width:0},titlePlacement:'none'
 });
 applyPresentationChartFont(chart,{fontFamily:FONT});
 text(s,'udemy-total','250 available through internal Udemy',720,501,488,38,24,C.navy,true);
 text(s,'udemy-composition','174 learning entries and 76 tool-training entries',720,542,488,31,19,C.grey);
 line(s,'rubric-rule',720,586,488);
 text(s,'rubric-size','23 needs and 140 learning outcomes',720,601,488,36,24,C.navy,true);
 text(s,'assessment-count','409 learning entries assessed against the outcomes.\n2 learning entries and 117 tool-training entries remain unscored.',72,642,1070,52,18,C.muted);
 s.speakerNotes.text=`The research-status information is supplied by Marco Ceci on 18 October 2026: AI-assisted external training research, review of the internally available Udemy catalogue, and external review of tool-specific training are done. Other internal training, including mylearnings, awaits information. These are current-version reviews, not a claim that every provider or course in the market has been covered.\n\nCurrent snapshot: catalogue v10, assessment date 18 October 2026. ${totals.resources} resources = ${totals.learning} Offers learning entries + ${totals.tool} Tool track entries. Internal Udemy supplies ${totals.udemy} of the total: ${totals.udemyLearning} Offers entries and ${totals.udemyTool} Tool track entries. The other 278 entries comprise 237 external Offers entries and 41 external Tool track entries. These are resource records, not unique providers or solely taught courses: the catalogue also includes certifications, guidance, labs and learning paths.\n\nAssessment uses the existing rubric of ${totals.needs} needs and ${totals.outcomes} outcomes. ${totals.assessed} learning entries have 140 numerical assessments each, for 57,260 scores. Two learning entries remain explicitly unassessed (280 rows), and the 117 tool-training entries have no rubric scores. The 411 learning entries therefore must not all be described as assessed. Scores describe published teaching evidence, not course completion, training endorsement or learner competence. Public syllabuses, objectives and described exercises are the research basis. Course content and delivery fit still require human evaluation.\n\nSources: /Users/cyberk/projects/ai-era-training/${data.filename}; /Users/cyberk/projects/ai-era-training/training-planner/public/data/catalogue.json (snapshot ${data.version}, workbook SHA-256 ${data.sourceSha256}); /Users/cyberk/projects/ai-era-training/Agentic-Era_Workforce_Capability_Model.md; /Users/cyberk/projects/ai-era-training/PROJECT_CONTEXT.md. Internal-learning pending status: user instruction in this conversation, 18 October 2026.`;
}

// 12. The existing app, with a real catalogue screen and concise workshop workflow.
{
 const s=page('The catalogue planner','Simple course exploration and cohort planning',12);
 const rows=[
  ['Explore courses','Search by learning need, topic,\nprovider or tool.'],
  ['Evaluate in two clicks','Open course details, then jump\nto the provider’s content.'],
  ['Create cohort plans','Set level, roles, tools and hours.\nSelect courses and review gaps.']
 ];
 rows.forEach(([heading,body],i)=>{const y=238+i*127;line(s,`planner-rule-${i}`,72,y-13,384);text(s,`planner-heading-${i}`,heading,72,y,390,40,29,C.navy,true);text(s,`planner-description-${i}`,body,72,y+48,390,65,23,C.grey);});
 s.images.add({blob:new Uint8Array(await fs.readFile(path.join(DIR,'assets/planner-catalogue.png'))),contentType:'image/png',alt:'Actual planner catalogue view filtered by N7 Supervising agents and the search term evaluating, with course details available from the course title.',fit:'cover',position:{left:510,top:225,width:698,height:361},crop:{left:270/1280,top:184/720,right:30/1280,bottom:30/720}});
 text(s,'screenshot-caption','Select a course to review its evidence and open the course page.',510,600,698,51,20,C.grey);
 text(s,'planner-start','23 editable cohort templates. One HTML file to get started.',72,657,1090,36,23,C.orange,true);
 s.speakerNotes.text=`The existing Cyber capability planner supports exploration and planning against catalogue v10 and capability model v2. The catalogue contains 528 resource records. The example screenshot is an actual local app view captured on 18 October 2026: Full catalogue, N7 Supervising agents, search term evaluating, and the shared L2 cohort. It is cropped to the catalogue area. This is an illustration of browsing, not an endorsed course selection or final cohort plan.\n\nThe Full catalogue view supports text search across titles, providers and descriptions, and filters by need, source audience, provider, resource type, tool, training track, assessment status and hours. Clicking a course title opens its description, learning time, fit notes and requirement-level evidence. The Open course / enrolment link provides direct access to the provider page. The Evaluating AI Agents example and its link were inspected in the running app. Access to actual course content depends on the provider and the learner's entitlement.\n\nCohort plans start from 23 editable presets in the current distributed default. In Level, roles & tools, users set the cohort name, agentic level, relevant role specialisms, inherited shared learning and approved tools. Users can tune learning outcomes, time budgets and course selections, then inspect coverage and gaps. A cohort profile groups learning needs; the app does not maintain a learner roster or grant operational permission.\n\nThe standalone Training-Planner.html contains the app and catalogue and opens locally in a supported desktop browser without a server or software setup. Course links require online access. Scenarios can be exported and reloaded for discussion.\n\nSources: /Users/cyberk/projects/ai-era-training/training-planner/README.md; /Users/cyberk/projects/ai-era-training/training-planner/public/app.js; /Users/cyberk/projects/ai-era-training/training-planner/public/data/catalogue.json; /Users/cyberk/projects/ai-era-training/training-planner/public/data/default-scenario.json. Screenshot: local planner http://127.0.0.1:4173/ captured via browser UI on 18 October 2026.`;
}
assert.equal(pres.slides.items.length,12);
for(const i of [10,11]){
 const png=await pres.export({slide:pres.slides.items[i],format:'png',scale:1.5});
 await fs.writeFile(path.join(DIR,'previews',`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
}
await (await PresentationFile.exportPptx(pres)).save(path.join(DIR,'authored.pptx'));
await fs.writeFile(path.join(DIR,'source-counts.json'),JSON.stringify({totals,cohortCount,sourceWorkbook:data.filename,sourceSha256:data.sourceSha256,snapshot:data.version},null,2));
console.log(JSON.stringify({slides:pres.slides.items.length,totals,cohortCount}));
