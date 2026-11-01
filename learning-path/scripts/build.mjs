import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateFormsTemplate} from '../src/core.js';
import {prepareCentralScenario} from '../src/published-pathways.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
function arg(name,fallback){const i=args.indexOf(name);if(i<0)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw Error(`Missing value for ${name}`);return path.resolve(args[i+1]);}
const known=new Set(['--scenario','--config','--feedback','--output']);
for(let i=0;i<args.length;i+=2)if(!known.has(args[i]))throw Error(`Unknown argument ${args[i]}`);
const source=JSON.parse(fs.readFileSync(path.join(root,'../training-planner/public/data/catalogue.json'),'utf8'));
const scenario=prepareCentralScenario(JSON.parse(fs.readFileSync(arg('--scenario',path.join(root,'../recommended-pathways/Recommended-Training-Pathways.json')),'utf8')),source);
const config=JSON.parse(fs.readFileSync(arg('--config',path.join(root,'config.json')),'utf8'));
if(config.formsTemplate)validateFormsTemplate(config.formsTemplate);
let feedbackSummary=null;
if(args.includes('--feedback')){
  feedbackSummary=JSON.parse(fs.readFileSync(arg('--feedback'),'utf8'));
  if(feedbackSummary.schema!=='ai-learning-feedback-summary/1'||feedbackSummary.reviewed!==true||feedbackSummary.catalogueVersion!==source.version||!Array.isArray(feedbackSummary.courses))throw Error('Use a reviewed feedback summary matching this catalog.');
  const ids=new Set(source.courses.map(c=>c.id));
  for(const x of feedbackSummary.courses)if(!ids.has(x.courseId)||!Number.isInteger(x.count)||x.count<1||!Number.isFinite(x.usefulness)||x.usefulness<1||x.usefulness>5)throw Error('Invalid feedback summary.');
  // Only anonymous numeric aggregates are shipped; no comments or response identities.
  feedbackSummary={schema:feedbackSummary.schema,reviewed:true,reviewedOn:feedbackSummary.reviewedOn,catalogueVersion:source.version,courses:feedbackSummary.courses.map(({courseId,count,usefulness})=>({courseId,count,usefulness}))};
}
// Keep every score and evidence note; intern repeated notes to reduce the standalone file.
const notes=[],noteIndex=new Map();
function intern(text){if(!noteIndex.has(text)){noteIndex.set(text,notes.length);notes.push(text);}return noteIndex.get(text);}
const courses=source.courses.map(c=>{
  const {audit,coverageAtAssessment,scores,...rest}=c;
  return {...rest,scores:Object.fromEntries(Object.entries(scores).map(([id,s])=>[id,[s.score,intern(s.evidence||'')]]))};
});
const data={config:{appVersion:config.appVersion||'1.0.0',releaseDate:config.releaseDate||'2026-10-30',formsTemplate:config.formsTemplate||''},catalogue:{...source,courses},scenario,
  scenarioVersion:crypto.createHash('sha256').update(JSON.stringify(scenario)).digest('hex').slice(0,12),feedbackSummary,notes};
delete data.catalogue.scoringGuide;delete data.catalogue.buildItems;
const done=new Set(),visiting=new Set(),parts=[];
function bundle(file){
  file=path.resolve(file);if(done.has(file))return;if(visiting.has(file))throw Error('Circular module dependency');visiting.add(file);
  let text=fs.readFileSync(file,'utf8');
  const imports=/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*$/gm;
  for(const match of text.matchAll(imports))bundle(path.resolve(path.dirname(file),match[2]));
  text=text.replace(imports,(_,names,target)=>`const {${names}}=__modules[${JSON.stringify(path.relative(root,path.resolve(path.dirname(file),target)))}];`);
  const exports=[...text.matchAll(/^export (?:async )?(?:function|const|let|class)\s+(\w+)/gm)].map(m=>m[1]);
  text=text.replace(/^export (?=(?:async )?(?:function|const|let|class)\s)/gm,'');
  if(/^\s*(import|export)\b/m.test(text))throw Error(`Unsupported module syntax in ${file}`);
  if(/<\/script/i.test(text))throw Error(`Unsafe script in ${file}`);
  parts.push(`__modules[${JSON.stringify(path.relative(root,file))}]=(()=>{\n${text}\nreturn {${exports.join(',')}};})();`);
  done.add(file);visiting.delete(file);
}
bundle(path.join(root,'src/app.js'));
const safeJSON=JSON.stringify(data).replaceAll('<','\\u003c').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');
const html=fs.readFileSync(path.join(root,'src/shell.html'),'utf8').replace('/* STYLES */',fs.readFileSync(path.join(root,'src/styles.css'),'utf8')).replace('DATA_PLACEHOLDER',safeJSON).replace('/* APPLICATION */',`const __modules=Object.create(null);\n${parts.join('\n')}`);
const output=arg('--output',path.join(root,'index.html'));fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output+'.tmp',html);fs.renameSync(output+'.tmp',output);
console.log(`Built ${path.relative(root,output)} · ${(Buffer.byteLength(html)/1048576).toFixed(2)} MiB · ${courses.length} offerings · ${scenario.cohorts.length} learning groups · ${scenario.status} central plan`);
