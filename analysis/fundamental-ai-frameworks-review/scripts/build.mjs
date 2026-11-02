import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve, dirname} from 'node:path';
import {homedir} from 'node:os';
import {gunzipSync} from 'node:zlib';
import {pathMetrics} from '../../../training-planner/public/components.js';
import {duration} from '../../../training-planner/public/duration.js';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const base=resolve(root,'analysis/fundamental-ai-frameworks-review');
const read=p=>readFile(resolve(base,p),'utf8');
const hash=x=>createHash('sha256').update(x).digest('hex');
const checking=process.argv.includes('--check');
const baseline=JSON.parse(await read('inputs/source-identities.json'));
const scenarioText=await read('inputs/pathways-v0.2.json');
const scenario=JSON.parse(scenarioText);
const proposal=JSON.parse(await read('inputs/proposal.json'));
const catalogueBytes=gunzipSync(await readFile(resolve(base,'inputs/catalogue-v16.json.gz')));
assert.equal(hash(catalogueBytes),baseline.files['training-planner/public/data/catalogue.json']);
const data=JSON.parse(catalogueBytes.toString('utf8'));
assert.equal(hash(scenarioText),baseline.files['recommended-pathways/Recommended-Training-Pathways.json']);
assert.equal(data.version,baseline.snapshot);
assert.equal(data.sourceSha256,baseline.files['catalogue/AI_Era_Cyber_Training_Catalogue_v16.xlsx']);
assert.equal(scenario.catalogueVersion,data.version);
assert.equal(scenario.publication.version,'0.2');
assert.equal(scenario.modelVersion,2);
assert.equal(scenario.modelRevision,3);
assert.equal(data.courses.length,516);
for(const name of ['components.js','capability-model.js','scoring.js','duration.js']) {
  const path='training-planner/public/'+name;
  assert.equal(hash(await readFile(resolve(root,path))),baseline.files[path],`Calculation source changed: ${path}. Reconcile before rebuilding this historical proposal.`);
}
const courseById=new Map(data.courses.map(c=>[c.id,c]));
const componentById=new Map(scenario.components.map(c=>[c.id,c]));
const draft=structuredClone(scenario);
const protectedIds=new Set(['TR-127','TR-229',...scenario.publication.exclusions.map(x=>x.id)]);
for(const addition of proposal.additions) {
  assert.ok(courseById.has(addition.courseId));
  assert.ok(!protectedIds.has(addition.courseId));
  for(const id of addition.componentIds) {
    const component=draft.components.find(c=>c.id===id);
    assert.ok(component,`Unknown component ${id}`);
    assert.ok(!component.excluded.includes(addition.courseId));
    assert.ok(!component.selected.includes(addition.courseId),`Addition is already selected: ${id}/${addition.courseId}`);
    component.selected.push(addition.courseId);
  }
}
assert.equal(JSON.stringify(scenario),JSON.stringify(JSON.parse(scenarioText)));
const ids=[...new Set([...proposal.additions.map(a=>a.courseId),...proposal.supplementaryExisting])];
const evidence=ids.map(id=>{
  const course=courseById.get(id);
  assert.ok(course,`Missing catalogue record: ${id}`);
  const {scores,...record}=course;
  const targets=proposal.additions.find(a=>a.courseId===id)?.componentIds||[];
  const relevant=new Set(targets.flatMap(id=>componentById.get(id).requirements));
  return {...record,currentAssignments:scenario.components.filter(c=>c.selected.includes(id)).map(c=>({id:c.id,name:c.name})),durationInterpretation:duration(course),positiveScores:Object.fromEntries(Object.entries(scores).filter(([,s])=>s.score>0)),proposedComponentScores:Object.fromEntries(Object.entries(scores).filter(([id])=>relevant.has(id)))};
});
const summarize=m=>({knownCourseHours:m.time.hours,knownInternalHours:m.items.reduce((n,i)=>n+(i.hours||0),0),knownTotalHours:m.total.hours,unknownDurationCount:m.total.unknown,unknownCourseIds:m.ids.filter(id=>duration(courseById.get(id),scenario.overrides).hours===null),assessedCoverage:m.coverage,plannedCoverage:m.planned.coverage,selectedIds:m.ids});
const audiences=scenario.audiences.map(a=>{
  const old=pathMetrics(data,scenario,a),next=pathMetrics(data,draft,draft.audiences.find(x=>x.id===a.id));
  const before=summarize(old),after=summarize(next);
  return {id:a.id,name:a.name,before,after,knownAdditionalHours:after.knownTotalHours-before.knownTotalHours,addedCourseIds:after.selectedIds.filter(id=>!before.selectedIds.includes(id)),improvedOutcomes:next.rows.filter(r=>r.score>old.rows.find(o=>o.id===r.id).score).map(r=>({id:r.id,before:old.rows.find(o=>o.id===r.id).score,after:r.score}))};
});
const impact={date:proposal.date,status:proposal.status,method:'Conditional illustration of all A1–A8, using saved v16 evidence without reassessment. Existing source selections and internal items retained. Best score per outcome, equally weighted needs; full-resource duration upper bounds; unknown durations remain unknown; all courses and internal items deduplicated by ID. No scenario is published.',baseline,decisions:proposal.additions,audiences};
const time=h=>{const minutes=Math.round(h*60);return `${Math.floor(minutes/60)}h${minutes%60?' '+String(minutes%60).padStart(2,'0')+'m':''}`;};
const pct=v=>(v*100).toFixed(1)+'%';
const escape=x=>String(x??'').replaceAll('|','\\|').replaceAll('\n',' ');
const table=(headers,rows)=>['| '+headers.join(' | ')+' |','| '+headers.map(()=> '---').join(' | ')+' |',...rows.map(row=>'| '+row.map(escape).join(' | ')+' |')].join('\n');
const placements=table(['Decision','Course','Add to these existing components'],proposal.additions.map(a=>[a.decision,a.courseId,a.componentIds.map(id=>'`'+id+'`').join('; ')]));
const sharedIds=['foundation-path','l1-path','l2-path','l3-path','l2-coached-path','l3-coached-path'];
const shared=table(['Shared pathway','Current planned time','Proposed planned time','Change','Assessed coverage before → after'],sharedIds.map(id=>{const a=audiences.find(a=>a.id===id);assert.equal(a.after.unknownDurationCount,0);return [a.name,time(a.before.knownTotalHours),time(a.after.knownTotalHours),'+'+time(a.knownAdditionalHours),pct(a.before.assessedCoverage)+' → '+pct(a.after.assessedCoverage)];}));
const specialistIds=['governance','biso','threat-intelligence','redteam','architecture','forensics','iam-integration'];
const specialist=table(['Existing audience path','Added known time','Additional unknown readings','Newly assigned course IDs'],specialistIds.map(id=>{const a=audiences.find(a=>a.id===id);return [a.name,'+'+time(a.knownAdditionalHours),a.after.unknownCourseIds.filter(id=>!a.before.unknownCourseIds.includes(id)).join(', ')||'None',a.addedCourseIds.join(', ')];}));
const foundation=audiences.find(a=>a.id==='foundation-path');
assert.equal(time(foundation.after.knownTotalHours),'12h 41m');
assert.deepEqual(foundation.improvedOutcomes,[{id:'N2.4',before:1,after:2},{id:'N3.5',before:2,after:3},{id:'N5.4',before:2,after:3},{id:'N5.8',before:2,after:3}]);
const markdown=(await read('report-template.md')).replace('{{PLACEMENTS}}',placements).replace('{{SHARED_TIME}}',shared).replace('{{SPECIALIST_TIME}}',specialist).replaceAll('](outputs/','](').replaceAll('](README.md)','](../README.md)');
assert.ok(!markdown.includes('{{'),'Unresolved report placeholder');
const modulePath=process.env.MARKED_MODULE||resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/marked/lib/marked.esm.js');
let marked;
try { ({marked}=await import('marked')); } catch { ({marked}=await import(pathToFileURL(modulePath).href)); }
let rendered=marked.parse(markdown);
const sections=[];
rendered=rendered.replace(/<h2>(.*?)<\/h2>/g,(_,title)=>{const id='section-'+(sections.length+1);sections.push({id,title});return `<h2 id="${id}">${title}</h2>`;});
rendered=rendered.replaceAll('<table>','<div class="table-scroll"><table>').replaceAll('</table>','</table></div>');
const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fundamental AI frameworks — review proposal</title>
<style>
:root{color-scheme:light;--ink:#192b39;--muted:#556574;--accent:#006b70;--line:#cdd9df}*{box-sizing:border-box}body{margin:0;background:#edf2f5;color:var(--ink);font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}header{background:#15394a;color:white;padding:18px max(24px,calc((100vw - 1320px)/2));font-size:14px;letter-spacing:.04em}header span{display:block;color:#c3e4e4;letter-spacing:0}.layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:34px;max-width:1370px;margin:30px auto;padding:0 24px 60px}nav{position:sticky;top:24px;align-self:start;font-size:13px;line-height:1.4}nav strong{display:block;margin-bottom:12px}nav a{display:block;padding:7px 0;color:var(--muted);text-decoration:none}nav a:hover{color:var(--accent)}main{min-width:0;background:white;padding:44px 48px;box-shadow:0 3px 22px #15394a0c;border:1px solid #e0e6eb;border-radius:8px}h1{font-size:36px;line-height:1.18;letter-spacing:-.025em;margin:0 0 18px;max-width:800px}h2{font-size:25px;line-height:1.3;border-top:2px solid var(--line);padding-top:30px;margin:44px 0 16px;scroll-margin-top:24px}p{margin:0 0 18px}a{color:var(--accent);text-decoration-thickness:1px;text-underline-offset:3px}strong{font-weight:650}code{font:12px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere;background:#eef4f5;padding:2px 4px;border-radius:3px}.table-scroll{overflow-x:auto;margin:22px 0 28px}table{border-collapse:collapse;width:100%;font-size:13.5px;line-height:1.5}th,td{text-align:left;vertical-align:top;padding:13px 12px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}th{background:#e6f0f1;color:#123e48;font-weight:650;overflow-wrap:normal;word-break:normal}tbody tr:nth-child(even){background:#f7fafb}table th:first-child{min-width:135px}td p:last-child{margin:0}ol{padding-left:24px}li{padding-left:4px;margin-bottom:12px}main>p:first-of-type{color:var(--muted)}footer{margin-top:40px;padding-top:15px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}@media(max-width:1050px){.layout{grid-template-columns:1fr}nav{position:static;display:none}main{padding:32px}}@media(max-width:620px){.layout{margin:16px 0;padding:0 12px 30px}main{padding:24px 18px}h1{font-size:29px}table{min-width:680px}h2{font-size:22px}}@media print{@page{size:A4 landscape;margin:16mm}body{background:white;font-size:10pt;line-height:1.45}header,nav,footer{display:none}.layout{display:block;margin:0;padding:0}main{padding:0;border:0;box-shadow:none}h1{font-size:26pt}h2{font-size:17pt;margin-top:24pt;padding-top:14pt;break-after:avoid}tr{break-inside:avoid}table{font-size:9pt;min-width:0}.table-scroll{overflow:visible}a{color:#164b58}th{background:#e6f0f1!important;print-color-adjust:exact}}
</style></head><body><header>AI ERA TRAINING<span>Analysis for review · 2 November 2026 · Pathways unchanged</span></header><div class="layout"><nav aria-label="Report sections"><strong>IN THIS REPORT</strong>${sections.map(s=>`<a href="#${s.id}">${s.title}</a>`).join('')}<a href="report.md">Markdown version</a><a href="../README.md">Evidence and rebuild guide</a></nav><main>${rendered}<footer>Proposal based on catalogue v16 and Recommended Training Pathways v0.2. No changes have been published.</footer></main></div></body></html>`;
const out={
 'report.md':markdown,
 'report.html':html,
 'catalogue-evidence.json':JSON.stringify({date:proposal.date,catalogueSnapshot:data.version,workbookSourceSha256:data.sourceSha256,records:evidence},null,2)+'\n',
 'impact.json':JSON.stringify(impact,null,2)+'\n'
};
for(const [file,content] of Object.entries(out)) {
  const path=resolve(base,'outputs',file);
  if(checking) assert.equal(await readFile(path,'utf8'),content,`Stale output ${file}`);
  else {await mkdir(dirname(path),{recursive:true});await writeFile(path,content);}
}
console.log(`${checking?'Verified':'Built'} review: ${proposal.additions.length} decisions, ${evidence.length} catalogue records, ${audiences.length} audience comparisons. Live pathways and catalogue are not written.`);
