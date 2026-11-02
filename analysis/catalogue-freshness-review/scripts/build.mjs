import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = path.resolve(here, '..');
const root = path.resolve(base, '../..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const review = JSON.parse(fs.readFileSync(path.join(base, 'inputs/review.json'), 'utf8'));
const catalogue = read(`training-planner/catalogue-history/${review.catalogueVersion}.json`);
const workbook = path.join(root, 'archive/catalogues', catalogue.filename);
const hash = crypto.createHash('sha256').update(fs.readFileSync(workbook)).digest('hex');
if (catalogue.version !== review.catalogueVersion || catalogue.sourceSha256 !== hash || hash !== review.workbookSha256) throw Error('Source identity mismatch; reconcile the proposal before rebuilding.');
const courses = new Map(catalogue.courses.map(c => [c.id, c]));
const retire = new Map(review.retire.map(d => [d.id, d]));
const refresh = new Map(review.refresh.map(d => [d.id, d]));
const retainNotes = new Map(review.retainNotes.map(d => [d.id, d]));
const allDecisions = [...review.retire, ...review.refresh, ...review.retainNotes];
if (new Set(allDecisions.map(d => d.id)).size !== allDecisions.length) throw Error('Duplicate or conflicting decisions.');
for (const d of allDecisions) {
  if (!courses.has(d.id)) throw Error(`Unknown course ${d.id}`);
  for (const id of d.sources || []) if (!review.sources[id]) throw Error(`Unknown source ${id}`);
}
if (courses.size !== 534 || retire.size !== 18 || refresh.size !== 13) throw Error('Unexpected review population.');
if (courses.has('TR-127')) throw Error('Previously excluded TR-127 is unexpectedly present.');
const kept = catalogue.courses.filter(c => !retire.has(c.id));
const best = (items, id) => Math.max(0, ...items.map(c => typeof c.scores?.[id]?.score === 'number' ? c.scores[id].score : 0));
const differences = (before, after) => catalogue.requirements.map(r => ({id:r.id, title:r.title, before:best(before,r.id), after:best(after,r.id)})).filter(r => r.before !== r.after);
const scenarioImpact = file => {
  const baseline={'recommended-pathways/Recommended-Training-Pathways.json':'archive/recommended-pathways/v0.1/Recommended-Training-Pathways.json','training-planner/public/data/default-scenario.json':'training-planner/scenario-history/default-before-v16-retirements.json'};
  const scenario = read(baseline[file]||file), selectedReferences = [], excludedReferences = [];
  const walk = (value, at='$') => {
    if (!value || typeof value !== 'object') return;
    for (const [key, v] of Object.entries(value)) {
      if (['selected','pinned','excluded'].includes(key) && Array.isArray(v)) for (const id of v) {
        if (retire.has(id)) (key==='excluded' ? excludedReferences : selectedReferences).push({id,path:`${at}.${key}`,component:value.name || value.id || at});
      }
      if (v && typeof v==='object') walk(v,`${at}.${key}`);
    }
  };
  walk(scenario);
  const componentChanges = (scenario.components || scenario.cohorts || []).filter(c => (c.selected || []).some(id => retire.has(id))).map(c => {
    const before=(c.selected||[]).map(id=>courses.get(id)).filter(Boolean), after=before.filter(c=>!retire.has(c.id));
    return {id:c.id,name:c.name,removedSelections:(c.selected||[]).filter(id=>retire.has(id)),outcomeChanges:differences(before,after),scope:'Component own selected courses only; excludes inherited Foundation, overrides and internal teaching.'};
  });
  return {file,name:scenario.name,selectedReferences,excludedReferenceCount:excludedReferences.length,componentChanges};
};
const impact = {
  date:review.date,status:review.status,catalogueVersion:catalogue.version,workbookSha256:hash,
  total:catalogue.courses.length,proposedRetirements:retire.size,retained:kept.length,retainedForRefresh:refresh.size,
  proposedInternalBriefsUnchanged:catalogue.proposedTraining.rows.length,
  sourceSheets:['Offers','Tool track'].map(sheet=>({sheet,before:catalogue.courses.filter(c=>c.source.sheet===sheet).length,after:kept.filter(c=>c.source.sheet===sheet).length})),
  catalogueBestOutcomeScoreChanges:differences(catalogue.courses,kept),
  coverageMethod:'Compare each of 140 outcomes using the best numerical course score (0–3). Unassessed records do not supply scores. This is curriculum availability, not competence or a replacement pathway.',
  scenarios:[scenarioImpact('recommended-pathways/Recommended-Training-Pathways.json'),scenarioImpact('training-planner/public/data/default-scenario.json')]
};
const out=path.join(base,'outputs');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'impact.json'),JSON.stringify(impact,null,2)+'\n');
const esc = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceLinks = d => (d.sources||[]).map(id=>`<a href="${esc(review.sources[id].url)}">${esc(review.sources[id].title)}</a>`).join('<br>');
const row = d => {
  const c=courses.get(d.id);
  return `<tr><td><strong>${esc(c.id)}</strong><br><span class="muted">${esc(c.source.sheet)} row ${c.source.row}</span></td><td><a href="${esc(c.url)}">${esc(c.title)}</a><br><span class="muted">${esc(c.provider)} · ${esc(c.duration)}</span></td><td>${esc(d.reason)}${d.basis?`<p class="muted">Basis: ${esc(d.basis)}</p>`:''}${d.next?`<p>${esc(d.next)}</p>`:''}</td><td>${sourceLinks(d)||'Saved v15 assessment; no new runtime test'}</td></tr>`;
};
const table = (entries,label) => `<div class="table-wrap"><table aria-label="${esc(label)}"><thead><tr><th>ID / workbook</th><th>Resource</th><th>Reason and follow-up</th><th>Evidence</th></tr></thead><tbody>${entries.map(row).join('')}</tbody></table></div>`;
const keptRows=kept.map(c=>{const d=refresh.get(c.id)||retainNotes.get(c.id);return `<tr data-status="${refresh.has(c.id)?'refresh':'retained'}"><td>${esc(c.id)}</td><td><a href="${esc(c.url)}">${esc(c.title)}</a></td><td>${esc(c.provider)}</td><td>${esc(c.duration)}</td><td>${refresh.has(c.id)?'Retain; refresh before assignment':'Retain'}${d?`<p class="muted">${esc(d.reason)}</p>`:''}</td></tr>`;}).join('');
const legacy=impact.scenarios[1].componentChanges;
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Catalogue freshness review — proposal, 2 November 2026</title><style>
:root{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#183048;background:#f5f7fa;line-height:1.55}*{box-sizing:border-box}body{margin:0}main{max-width:1260px;margin:auto;padding:36px 28px 80px}h1{font-size:2.2rem;line-height:1.18;margin:10px 0 18px}h2{font-size:1.5rem;margin:38px 0 12px}h3{margin-top:26px}p{max-width:1000px}a{color:#1256a3;text-underline-offset:3px}a:hover{color:#003e7f}.kicker{font-weight:700;color:#526579;letter-spacing:.04em;text-transform:uppercase;font-size:.85rem}.notice{border-left:5px solid #a85e00;background:#fff5de;padding:16px 20px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:24px 0}.metric{padding:18px;background:white;border:1px solid #d8e1e9;border-radius:8px}.metric strong{display:block;font-size:2rem}.muted{color:#53667b;font-size:.9rem}nav{display:flex;gap:22px;flex-wrap:wrap;margin:24px 0}section{scroll-margin-top:20px}.table-wrap{overflow-x:auto;background:white;border:1px solid #d8e1e9;border-radius:6px}table{width:100%;border-collapse:collapse;font-size:.93rem}th{text-align:left;background:#e9eff5;padding:12px;vertical-align:top}td{padding:13px 12px;vertical-align:top;border-top:1px solid #e0e6ec;overflow-wrap:anywhere}td:first-child{min-width:105px}td:nth-child(2){min-width:230px;width:27%}td:nth-child(3){min-width:280px}td:nth-child(4){min-width:180px}td p{margin:8px 0 0}.controls{display:flex;flex-wrap:wrap;gap:16px;align-items:end;margin:18px 0}label{display:block;font-weight:600}input,select{display:block;margin-top:5px;padding:10px 12px;border:1px solid #8da0b3;border-radius:5px;font:inherit;background:white}input{width:min(430px,85vw)}details{margin:18px 0}summary{cursor:pointer;font-weight:650}li{margin:8px 0}.small-table td{min-width:0!important}footer{margin-top:40px;border-top:1px solid #ccd6e0;padding-top:20px;font-size:.88rem;color:#53667b}@media(max-width:760px){main{padding:24px 16px}.metrics{grid-template-columns:repeat(2,1fr)}h1{font-size:1.8rem}}@media print{body{background:white}main{max-width:none;padding:0}nav,.controls{display:none}.table-wrap{overflow:visible}table{font-size:9pt}a{color:inherit}thead{display:table-header-group}tr{break-inside:avoid}.metrics{grid-template-columns:repeat(4,1fr)}}
</style></head><body><main><div class="kicker">Catalogue v15 · Review dated 2 November 2026</div><h1>Proposed retirements and revised catalogue list</h1><div class="notice"><strong>Approved and applied in catalogue v16 on 2 November 2026.</strong> <a href="../../../catalogue/evidence/v16/README.md">Implementation and verification</a>. This page preserves the original review baseline.<br>This proposal would retire 18 resources from new programme selection and retain 516. The separate internal <em>AI use cases</em> brief is unchanged. Historical course IDs, assessments and evidence should be preserved when implementing approved retirements.</div>
<div class="metrics"><div class="metric"><strong>534</strong>Resources screened</div><div class="metric"><strong>18</strong>Proposed retirements</div><div class="metric"><strong>516</strong>Would remain</div><div class="metric"><strong>13</strong>Retained; refresh needed</div></div>
<nav><a href="#retire">Proposed removals</a><a href="#refresh">Retain and refresh</a><a href="#impact">Pathway impact</a><a href="#revised">Full revised list</a><a href="#evidence">Evidence and limits</a></nav>
<p>The catalogue contains <strong>Reasoning with o1 (TR-229)</strong>, not an o2 course. Recommended Training Pathways already exclude it. Dedicated Llama courses are proposed for retirement in line with your request. This is a programme decision; it does not establish that every Llama model or deployment is unsupported.</p>
<section id="retire"><h2>18 proposed retirements</h2><p>These are specific recorded editions. Confirmed platform/exam retirements are distinguished from programme choices and historical background.</p>${table(review.retire,'Proposed retirements')}</section>
<section id="refresh"><h2>13 retained entries needing refresh</h2><p>These remain in the proposed revised list. Check the noted content or runtime before a new assignment; no fresh rubric scores are inferred.</p>${table(review.refresh,'Retain and refresh')}<h3>Other Llama mentions that do not justify whole-course removal</h3>${table(review.retainNotes,'Retained courses with model or framework references')}</section>
<section id="impact"><h2>Effect on the catalogue and saved pathways</h2><ul><li><strong>Offers:</strong> 417 → 403. <strong>Tool track:</strong> 117 → 113. The one proposed internal brief remains.</li><li><strong>Recommended Training Pathways v0.1:</strong> none of the 18 is selected or pinned anywhere in the saved scenario. Reviewed Foundation/L1 remains TR-281 + TR-145 + the saved internal brief.</li><li><strong>Legacy planner default:</strong> TR-229 is selected in L3. A retirement release must resolve this explicitly while preserving historical scenarios, browser backups and personal records. No replacement has been selected.</li><li><strong>Catalogue-wide curriculum availability:</strong> the best numerical course score is unchanged for all 140 outcomes after hypothetical removal. This does not mean every pathway is unaffected or that learners are competent.</li></ul>
<p>If TR-229 were simply deleted from the legacy L3 component's own selected courses, these scores would fall. This calculation excludes inherited Foundation, overrides and internal teaching:</p><div class="table-wrap"><table class="small-table"><thead><tr><th>Outcome</th><th>Before</th><th>After</th></tr></thead><tbody>${legacy.flatMap(c=>c.outcomeChanges).map(r=>`<tr><td>${esc(r.id)} — ${esc(r.title)}</td><td>${r.before}</td><td>${r.after}</td></tr>`).join('')}</tbody></table></div>
<p>TR-127 stays excluded. LlamaIndex courses stay because LlamaIndex is a separate application/data framework. No current app publication, model revision, scoring group, course assessment or saved scenario has changed.</p></section>
<section id="revised"><h2>Full proposed revised list: 516 retained resources</h2><p>The list below excludes only the 18 proposed retirements and retains every other existing record. “Retain” means no retirement proposed in this review, not a fresh endorsement of its quality, delivery readiness or assessment.</p><div class="controls"><div><label for="query">Search ID, title or provider</label><input id="query" type="search" placeholder="Search the retained list"></div><div><label for="status">Show</label><select id="status"><option value="all">All retained resources</option><option value="refresh">Retain; refresh needed</option><option value="retained">Other retained resources</option></select></div><p id="count" aria-live="polite">516 of 516 retained resources</p></div><div class="table-wrap"><table id="retained"><thead><tr><th>ID</th><th>Title</th><th>Provider</th><th>Saved duration</th><th>Proposed treatment</th></tr></thead><tbody>${keptRows}</tbody></table></div></section>
<section id="evidence"><h2>Evidence and review limits</h2><p>All 534 records and their saved descriptions, limitations, audit notes and assessment evidence were screened for older model names, retired exams/APIs, superseded frameworks and stale teaching editions. Public provider and platform checks targeted the retirement candidates. This is not a fresh assessment of every course, a complete link audit or a test of private notebooks and labs. Some DeepLearning.AI pages were available through indexed provider text after direct fetches returned 403. Public page and workbook dates may differ; no live metadata was silently overwritten.</p><p>The saved workbook and imported snapshot were checked for consistency: 58,100 numerical scores, 280 explicitly unassessed rows, and 9,591 course/need coverage rows validated against Excel. Course durations above are retained from the workbook. The public INT-B16 page now shows taught lectures and 2h09m, while its catalogue record says practice tests with unknown duration; that discrepancy remains recorded for review.</p><details><summary>Provider/platform source notes (${Object.keys(review.sources).length})</summary><ol>${Object.values(review.sources).map(s=>`<li><a href="${esc(s.url)}">${esc(s.title)}</a> — ${esc(s.finding)}</li>`).join('')}</ol></details><p>If you approve a list, implement decommissioning through a new catalogue version, preserving historical evidence and IDs. Resolve the legacy o1 selection explicitly, refresh affected generated artifacts and verify both apps. Approval of retirement does not approve any replacement course or confer assessment credit.</p></section>
<footer>Source: ${esc(catalogue.filename)} · snapshot ${esc(catalogue.version)}<br>Workbook SHA-256: ${hash}<br>Proposal only. No catalogue or app changes applied.</footer></main><script>const q=document.getElementById('query'),s=document.getElementById('status'),rows=[...document.querySelectorAll('#retained tbody tr')];function filter(){const text=q.value.trim().toLowerCase();let n=0;for(const row of rows){const yes=(!text||row.textContent.toLowerCase().includes(text))&&(s.value==='all'||row.dataset.status===s.value);row.hidden=!yes;if(yes)n++;}document.getElementById('count').textContent=n+' of '+rows.length+' retained resources';}q.addEventListener('input',filter);s.addEventListener('change',filter);</script></body></html>`;
fs.writeFileSync(path.join(out,'review.html'),html);
console.log(JSON.stringify({total:impact.total,retire:impact.proposedRetirements,retain:impact.retained,refresh:impact.retainedForRefresh,bestScoreChanges:impact.catalogueBestOutcomeScoreChanges.length,scenarioReferences:impact.scenarios.map(s=>({file:s.file,selected:s.selectedReferences}))},null,2));
