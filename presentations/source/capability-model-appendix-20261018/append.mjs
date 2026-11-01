import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {GlobalFonts, createCanvas} from '@napi-rs/canvas';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';

const ROOT='/Users/cyberk/projects/ai-era-training';
const DIR=path.join(ROOT,'.presentation-build/capability-model-appendix-20261018');
const FONT='IBM Plex Sans';
for(const w of ['Regular','Bold']) GlobalFonts.registerFromPath(path.join(ROOT,`.presentation-build/capability-model-20261018/assets/IBMPlexSans-${w}.ttf`));
const data=JSON.parse(await fs.readFile(path.join(DIR,'model.json'),'utf8'));
const pres=await PresentationFile.importPptx(await FileBlob.load(path.join(DIR,'original-eight-slides.pptx')));
assert.equal(pres.slides.items.length,8);
const C={paper:'#F6F4EF',ink:'#13202E',muted:'#526577',rule:'#D8D1C4',generic:'#245695',cyber:'#A24F19'};
const ctx=createCanvas(10,10).getContext('2d');
const drawn=[], metrics=[];
const short={
 'N1.1':'AI in cyber today','N1.3':'How our work changes',
 'N4.2':'Confidentiality and client data','N4.7':'Vetting third-party Skills and connectors',
 'N5.1':'AI social engineering','N5.4':'Attacks on the bank’s AI','N5.6':'Recognising AI attacks','N5.7':'Threat tracking and control adjustment',
 'N8.1':'Writing reusable instructions','N8.2':'Maintaining instructions','N8.3':'Shared instruction library','N8.4':'Safe connector use','N8.5':'Vetting before installation',
 'N9.5':'Feeding domain evaluation',
 'N10.3':'Harness and context engineering','N10.7':'Skills as infrastructure',
 'N11.3':'Validating automated judges',
 'N12.6':'Logs, monitoring and stop controls',
 'N14.1':'Work allocation','N14.4':'Measuring value','N14.5':'Adoption and change',
 'R1.1.2':'Stopping an agent','R1.1.3':'Compromised-agent investigation','R1.1.4':'Clean-up and recovery','R1.1.5':'Manual fallback','R1.2.2':'Agent forensic readiness','R1.2.3':'Agent as investigation subject',
 'R3.1.4':'Model and platform attacks','R3.1.5':'Automated red-team programme','R3.2.1':'Containment before a run','R3.2.2':'Monitoring during a run','R3.2.4':'Trajectory-level validation',
 'R4.2.1':'Why set-up matters','R4.2.2':'Context for code analysis','R4.2.3':'Framework, model and method','R4.2.4':'Confirming vulnerabilities','R4.2.5':'Reliability by vulnerability class',
 'R5.1.1':'Classifying agent actions','R5.1.2':'External enforcement','R5.1.3':'Stop mechanism','R5.1.4':'Audit trail','R5.1.5':'Oversight interface',
 'R6.1.2':'Assuring assessment AI',
 'R9.1.1':'Agent registration','R9.1.3':'Connector and MCP scopes','R9.1.8':'IGA/PAM/SIEM integration','R9.1.9':'Privilege and break-glass'
};
function wrap(str,width,size,bold=false){
 ctx.font=`${bold?'bold':'normal'} ${size}px "${FONT}"`;
 return str.split('\n').flatMap(p=>{const out=[];let line='';for(const word of p.split(' ')){const trial=line?`${line} ${word}`:word;if(line&&ctx.measureText(trial).width*1.035>width){out.push(line);line=word;}else line=trial;}if(line)out.push(line);return out;});
}
function text(s,name,str,x,y,w,size,color=C.ink,bold=false,spacing=1.2){
 const lines=wrap(str,w,size,bold), h=lines.length*size*spacing+1;
 const a=s.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 a.text=lines.join('\n');a.text.style={typeface:FONT,fontSize:size,color,bold,insets:0,wrap:'none',autoFit:'none',verticalAlignment:'top'};
 return h;
}
function rule(s,x,y,w){s.shapes.add({geometry:'line',position:{left:x,top:y,width:w,height:0},fill:'none',line:{fill:C.rule,width:0.8}});}
function page(title,subtitle,num){
 const s=pres.slides.add();s.background.fill=C.paper;
 text(s,'title',title,40,27,920,33,C.ink,true);
 text(s,'subtitle',subtitle,40,81,1170,15.5,C.muted);
 text(s,'generic-legend','[G] Generic',984,35,114,14,C.generic,true);
 text(s,'cyber-legend','[C] Cyber-specific',1100,35,140,14,C.cyber,true);
 text(s,'page-number',String(num),1210,685,30,13,C.muted);
 return s;
}
function section(s,label,x,y,w,size){
 const h=text(s,`section-${label}`,label,x,y,w,size,C.ink,true);
 rule(s,x,y+h+4,w);
 return y+h+10;
}
function need(s,id,ids,x,y,w,{size=14.2,titleSize=15.2,gap=11,note=null}={}){
 const n=data.needs[id];assert(n);
 const cat=n.category==='Generic'?'G':'C', color=cat==='G'?C.generic:C.cyber;
 y+=text(s,`need-${id}-${drawn.length}`,`${id} [${cat}] ${n.title}`,x,y,w,titleSize,color,true)+4;
 if(note)y+=text(s,`need-context-${id}`,note,x,y,w,size-0.3,C.muted)+3;
 for(const oid of ids){
  const o=data.outcomes[oid];assert(o&&o.need===id);
  y+=text(s,`outcome-${oid}`,`${oid} ${short[oid]||o.label}`,x,y,w,size,C.ink,false)+0.6;
  drawn.push({id:oid,slide:pres.slides.items.length,category:n.category,need:id,placement:o.placement});
 }
 return y+gap;
}
const ids=(n,predicate=()=>true)=>data.needs[n].outcomes.filter(i=>predicate(data.outcomes[i]));
const foundation=o=>o.placement.startsWith('Foundation');
const shared=o=>/^(Foundation|L[123] )/.test(o.placement);
const role=o=>!shared(o);
const xs=[40,285,530,775,1020],W=220;

// Slide 9: 64 outcomes assigned to Foundation and the three shared agentic levels.
{
 const s=page('Shared learning needs and outcomes','64 outcomes. Foundation is common. Higher agentic levels build on earlier shared capabilities.',9);
 let y=section(s,'FOUNDATION',xs[0],126,W,16.5);
 for(const n of ['N1','N2','N3'])y=need(s,n,ids(n,foundation),xs[0],y,W);
 metrics.push({slide:9,column:1,bottom:y});
 y=section(s,'FOUNDATION (CONT.)',xs[1],126,W,16.5);
 for(const n of ['N4','N5'])y=need(s,n,ids(n,foundation),xs[1],y,W);
 metrics.push({slide:9,column:2,bottom:y});
 y=section(s,'L1  AI ASSISTANCE',xs[2],126,W,16.5);
 y=need(s,'N6',ids('N6'),xs[2],y,W);
 y=section(s,'L2  SUPERVISE AGENTS',xs[2],y+14,W,16.5);
 y=need(s,'N7',ids('N7'),xs[2],y,W);
 metrics.push({slide:9,column:3,bottom:y});
 y=section(s,'L2  (CONTINUED)',xs[3],126,W,16.5);
 for(const n of ['N8','N9'])y=need(s,n,ids(n),xs[3],y,W);
 y=need(s,'N4',['N4.7'],xs[3],y,W);
 metrics.push({slide:9,column:4,bottom:y});
 y=section(s,'L3  BUILD AND EVALUATE',xs[4],126,W,16.5);
 for(const n of ['N10','N11'])y=need(s,n,ids(n,shared),xs[4],y,W);
 metrics.push({slide:9,column:5,bottom:y});
 rule(s,40,650,1200);
 text(s,'shared-methodology','Generic and cyber-specific describe content, not audience. Outcomes within a need can belong to different components.',40,662,1170,13,C.muted);
 text(s,'shared-scope','Specialist outcomes are on the next slide. N0 core cyber expertise is assumed. Tool practice follows access and intended work.',40,683,1140,13,C.muted);
}

// Slide 10: all remaining outcomes, with each specialist role represented.
{
 const s=page('Specialist learning needs by role','76 additional outcomes. Select relevant responsibilities at any agentic level. Role groupings are starting points.',10);
 const opts={size:13.1,titleSize:14.3,gap:6};
 let y=section(s,'1  SECURITY OPERATIONS\n& RESPONSE',xs[0],126,W,15.3);
 for(const n of ['R1.1','R1.2'])y=need(s,n,ids(n),xs[0],y,W,opts);
 y=section(s,'2  THREAT INTELLIGENCE\n& DETECTION',xs[0],y+5,W,15.3);
 y=need(s,'N5',['N5.7'],xs[0],y,W,opts);
 metrics.push({slide:10,column:1,bottom:y});

 y=section(s,'3  OFFENSIVE SECURITY\n& TESTING',xs[1],126,W,15.3);
 for(const n of ['R3.1','R3.2'])y=need(s,n,ids(n),xs[1],y,W,opts);
 y=section(s,'9  LEADERSHIP',xs[1],y+5,W,15.3);
 y=need(s,'N14',ids('N14'),xs[1],y,W,opts);
 metrics.push({slide:10,column:2,bottom:y});

 y=section(s,'4  VULNERABILITY &\nEXPOSURE MANAGEMENT',xs[2],126,W,15.3);
 for(const n of ['R4.1','R4.2'])y=need(s,n,ids(n),xs[2],y,W,opts);
 y=section(s,'7  SECURITY AWARENESS\n& CULTURE',xs[2],y+5,W,15.3);
 y+=text(s,'awareness-scope','Shared needs and tool practice. No additional role-specific outcomes are defined.',xs[2],y,W,13.1,C.muted);
 metrics.push({slide:10,column:3,bottom:y});

 y=section(s,'5  SECURITY ARCHITECTURE\n& ENGINEERING',xs[3],126,W,15.3);
 y=need(s,'N10',ids('N10',role),xs[3],y,W,{...opts,note:'Agent infrastructure outcomes'});
 for(const n of ['N12','R5.1'])y=need(s,n,ids(n),xs[3],y,W,opts);
 metrics.push({slide:10,column:4,bottom:y});

 y=section(s,'6  GOVERNANCE, RISK,\nCOMPLIANCE & ASSURANCE',xs[4],126,W,15.3);
 for(const n of ['N13','R6.1'])y=need(s,n,ids(n),xs[4],y,W,opts);
 y=section(s,'8  IDENTITY & ACCESS\nMANAGEMENT',xs[4],y+5,W,15.3);
 y=need(s,'R9.1',ids('R9.1'),xs[4],y,W,opts);
 metrics.push({slide:10,column:5,bottom:y});

 rule(s,40,650,1200);
 text(s,'reused-outcomes','Vendor evaluation can reuse N11.4 and N11.6 without L3. Leadership also uses N13.3. Reused outcomes are counted once.',40,662,1170,13,C.muted);
 text(s,'classification-total','Across both slides: 23 needs and 140 outcomes. 11 needs are generic and 12 are cyber-specific. IDs retain the source assessment numbering.',40,683,1150,13,C.muted);
}

// Strong coverage and methodology audit, independent of layout.
const present=new Set(drawn.map(o=>o.id));
assert.equal(drawn.length,140);assert.equal(present.size,140);
assert.deepEqual([...present].sort(),Object.keys(data.outcomes).sort());
assert.equal(drawn.filter(o=>o.slide===9).length,64);
assert.equal(drawn.filter(o=>o.slide===10).length,76);
for(const o of drawn)assert.equal(o.slide,shared(data.outcomes[o.id])?9:10);
for(const i of [8,9]){
 const shown=drawn.filter(o=>o.slide===i+1), s=pres.slides.items[i];
 const introduction=i===8?'Foundation is separate from L1–L3. Higher levels build on earlier shared capabilities. N4.7 belongs to L2. The role-specific N5.7 and N10.3, N10.6 and N10.7 are on slide 10.':'These are responsibility-based packages, not mandatory assignments to everyone in a function. Role depth is independent of agentic level. N12 security design can support relevant responsibilities beyond architecture. N14.1–N14.5 also support workflow transformation and adoption roles. Vendor evaluation may use N11.4 and N11.6 without requiring L3. Leadership additionally uses N13.3 on autonomy policy. Role 8 IAM retains the stable assessment code R9.1. Awareness and culture has no additional standalone need in the source; shared capabilities and tool training still apply.';
 s.speakerNotes.text=`${introduction}\n\nG = Generic: capabilities that transfer across functions. C = Cyber-specific: cybersecurity work, threats, controls and practices. Category does not determine audience. N0 is the existing cyber-craft prerequisite outside the 23 assessed needs. Tool training follows access and intended work, and is not an additional capability level.\n\nSource: /Users/cyberk/projects/ai-era-training/Agentic-Era_Workforce_Capability_Model.md, version 2, updated 18 October 2026.\n\nDetailed source outcomes:\n\n`+shown.map(o=>{const full=data.outcomes[o.id];return `${full.id} ${full.label}. ${full.definition}\nContent category: ${o.category}. Placement: ${full.placement}.${full.mustHave?' Must-have outcome.':''}`;}).join('\n\n');
 const png=await pres.export({slide:s,format:'png',scale:2});
 await fs.writeFile(path.join(DIR,'previews',`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
 const layout=await s.export({format:'layout'});
 await fs.writeFile(path.join(DIR,'previews',`slide-${i+1}.layout.json`),await layout.text());
}
await (await PresentationFile.exportPptx(pres)).save(path.join(DIR,'roundtrip.pptx'));
await fs.writeFile(path.join(DIR,'coverage-audit.json'),JSON.stringify({source:data.source,needs:23,outcomes:140,categories:{generic:11,cyberSpecific:12},drawn,metrics},null,2));
console.log(JSON.stringify({slides:pres.slides.items.length,coverage:present.size,metrics},null,2));
