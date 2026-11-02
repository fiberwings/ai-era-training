import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {pathMetrics, pathComponents} from '../../training-planner/public/components.js';
import {validateScenario, serialize, deserialize} from '../../training-planner/public/storage.js';
import {duration} from '../../training-planner/public/duration.js';
import {proposedItem} from '../../training-planner/public/proposed-training.js';
import {MODEL_VERSION, MODEL_REVISION} from '../../training-planner/public/capability-model.js';

const root=fileURLToPath(new URL('../../',import.meta.url));
const read=path=>readFile(resolve(root,path),'utf8');
const sourcePath='recommended-pathways/Recommended-Training-Pathways.json';
const source=await read(sourcePath),scenario=JSON.parse(source),publication=scenario.publication;
// Use the saved evidence, so a later catalogue refresh cannot silently rewrite this decision record.
const cataloguePath=`training-planner/catalogue-history/${scenario.catalogueVersion}.json`;
const catalogue=JSON.parse(await read(cataloguePath));
assert.equal(catalogue.version,scenario.catalogueVersion);
assert.equal(catalogue.sourceSha256,scenario.catalogueIdentity.sourceSha256);
assert.equal(scenario.modelVersion,MODEL_VERSION,'Review model changes before regenerating pathways');
assert.equal(scenario.modelRevision,MODEL_REVISION,'Review model changes before regenerating pathways');
assert.deepEqual(validateScenario(scenario,catalogue),[]);
assert.deepEqual(deserialize(serialize(scenario),catalogue).scenario,scenario);
const reviewed='Reviewed',pending='AI recommendation - to be reviewed';
for(const target of [...scenario.components,...scenario.audiences]){
 assert.ok([reviewed,pending].includes(target.reviewStatus),`Missing review status: ${target.id}`);
 assert.ok(target.rationale.startsWith(target.reviewStatus+'. '),`Status not visible in planner: ${target.id}`);
 if(target.reviewStatus===reviewed)assert.ok(target.reviewDate,`Missing review date: ${target.id}`);
 assert.ok(!Object.hasOwn(target,'needsReview'),'Review labels must not restore planner review gates');
}
const excluded=new Set(publication.exclusions.map(x=>x.id));
for(const component of scenario.components)assert.ok(component.selected.every(id=>!excluded.has(id)),`Excluded selection: ${component.id}`);
assert.equal(publication.roles.length,9);
for(const role of publication.roles)for(const id of role.audiences)assert.ok(scenario.audiences.some(a=>a.id===id));
const foundation=scenario.components.find(c=>c.id==='foundation');
const savedBrief=catalogue.proposedTraining.rows.find(r=>r[15]===foundation.catalogueProposalSource.itemId);
assert.deepEqual(foundation.internal.find(i=>i.id===savedBrief[15]),proposedItem(savedBrief),'Preserve the saved internal brief');
const byCourse=new Map(catalogue.courses.map(c=>[c.id,c]));
const byAudience=new Map(scenario.audiences.map(a=>[a.id,a]));
const byComponent=new Map(scenario.components.map(c=>[c.id,c]));
const hash=text=>createHash('sha256').update(text).digest('hex');
const cell=x=>String(x??'').replaceAll('|','\\|').replaceAll('\n',' ');
const pct=x=>(100*x).toFixed(1)+'%';
const time=hours=>{if(hours===null)return 'Unknown';const n=Math.round(hours*60);return n?`${Math.floor(n/60)}h${n%60?' '+String(n%60).padStart(2,'0')+'m':''}`:'0h';};
const table=(head,rows)=>['| '+head.join(' | ')+' |','| '+head.map(()=> '---').join(' | ')+' |',...rows.map(row=>'| '+row.map(cell).join(' | ')+' |')].join('\n');
const anchor=id=>'brief-'+id.toLowerCase();
const internalLink=i=>`[${i.title}](Internal-Training-Briefs.md#${anchor(i.id)})`;
const courseLabel=id=>{const c=byCourse.get(id);return `**${id}** — [${c.title}](${c.url})`;};
const metrics=target=>pathMetrics(catalogue,scenario,target);
const summary=m=>({courseHours:m.time.hours,internalHours:m.items.reduce((n,i)=>n+(i.hours||0),0),totalHours:m.total.hours,unknownLearningDurations:m.total.unknown,toolHours:null,assessedCoverage:m.coverage,plannedCoverage:m.planned.coverage,mustHavesWithZeroAssessedScore:m.critical,mustHavesBelowFullAssessedScore:m.rows.filter(r=>r.core&&r.score<3).length,mustHavesWithZeroPlannedScore:m.planned.critical,applicableOutcomes:m.rows.length,needCount:m.needs.length});
const evidence=m=>({summary:summary(m),courses:m.ids,internalItems:m.items.map(i=>i.id),needs:m.needs.map(n=>({id:n.id,assessedCoverage:n.coverage,plannedCoverage:m.planned.needs.find(p=>p.id===n.id).coverage})),outcomes:m.rows.map(r=>({id:r.id,title:r.title,need:r.need,mustHave:r.core,assessed:r.assessed,assessedScore:r.score,bestCourseIds:r.witnesses.map(c=>c.id),plannedScore:m.planned.rows.find(p=>p.id===r.id).score,internalItemIds:m.items.filter(i=>i.requirements.includes(r.id)).map(i=>i.id)}))});
const report={version:publication.version,date:publication.date,scenarioId:scenario.id,scenarioSha256:hash(source),catalogueIdentity:scenario.catalogueIdentity,modelVersion:scenario.modelVersion,modelRevision:scenario.modelRevision,method:'Best course score per outcome (0–3); equally weighted need percentages; full-course upper-bound durations; shared courses, outcomes and internal items counted once. Planned coverage assumes full teaching of linked internal outcomes and is not assessed credit. Tool training is unselected and its time is additional and unknown.',components:scenario.components.map(c=>({id:c.id,name:c.name,reviewStatus:c.reviewStatus,...evidence(metrics(c))})),audiences:scenario.audiences.map(a=>({id:a.id,name:a.name,reviewStatus:a.reviewStatus,...evidence(metrics(a))}))};
report.calculationSources={};
for(const name of ['components','scoring','duration','capability-model'])report.calculationSources[`training-planner/public/${name}.js`]=hash(await read(`training-planner/public/${name}.js`));

const publicationDate=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(publication.date+'T00:00:00Z'));
const catalogueLabel=catalogue.filename.match(/_(v\d+)\.xlsx$/)?.[1]||catalogue.filename;
const lines=['# Recommended Training Pathways','',`**Version ${publication.version} · ${publicationDate} · ${publication.status}**`,'',
 'Foundation and L1 use the reviewed shared bundle of CertMike SecAI+, Anthropic AI Capabilities and Limitations, and the internal AI use cases session. L2, L3, coached alternatives and specialist pathways are **AI recommendation - to be reviewed**. These recommendations combine the agreed capability model with selected courses and proposed internal practice.','',
 '[Importable planner scenario](Recommended-Training-Pathways.json) · [Internal training briefs](Internal-Training-Briefs.md) · [Detailed coverage and time](coverage.json) · [Maintenance and import guide](README.md)','',
 `Catalogue: **${catalogueLabel}**, snapshot \`${scenario.catalogueVersion}\`. Capability model: **${scenario.modelVersion} revision ${scenario.modelRevision}**. Pathway owner: **Unassigned**. Next review date: **Unscheduled**; review before assigning an AI-generated pathway and when relevant inputs change.`, '',
 '## How to use the pathways','',
 'Compose Foundation + the shared learning through the person’s agentic level + relevant role responsibilities + approved tool training. The same course or internal activity is counted once. Levels follow the work, independently of seniority; demonstrated capabilities need not be retaught. Specialist audience levels below are proposed starting points, not requirements for everyone in a role.','',
 '**Reviewed** records the user’s review of the Foundation/L1 selection on 1 November 2026. It does not declare full outcome coverage, delivery readiness, competence or operational permission. The full scenario remains Draft because its other pathways await review. Review labels are descriptive and do not add planner gates.','',
 'Course time uses the full catalogue duration or the upper bound of a range. Internal learner time is additional. Product training is still unselected and its duration is unknown; it must be added before a complete delivery commitment is made. Time budgets and calendar dates are unset. Suggested facilitators in historical briefs are not assigned owners.','',
 'Assessed coverage describes catalogue syllabus evidence. Planned coverage additionally assumes full teaching of outcomes linked to internal activities, including Proposed activities. Neither percentage measures learner competence. Zero must-have gaps means no applicable must-have has a zero score; partially covered must-haves still need attention.','',
 '## Shared pathways','',
 table(['Pathway','Review status','Cumulative course time','Cumulative internal time','Total before tool training','Assessed coverage','Planned coverage'],['foundation-path','l1-path','l2-path','l3-path','l2-coached-path','l3-coached-path'].map(id=>{const a=byAudience.get(id),m=metrics(a),v=summary(m);return [a.name,a.reviewStatus,time(v.courseHours),time(v.internalHours),time(v.totalHours),pct(v.assessedCoverage),pct(v.plannedCoverage)];})),'',
 '### Foundation and L1','', '**Reviewed · 1 November 2026**','',
 table(['Selected learning','Type','Learner time'],[...foundation.selected.map(id=>[courseLabel(id),'Catalogue course',time(duration(byCourse.get(id),scenario.overrides).hours)]),...foundation.internal.map(i=>[internalLink(i),'Internal training — '+i.status,time(i.hours)])]),'',
 'The combined commitment is **10h 41m**: 9h 41m of catalogue learning and the 1h AI use cases session. The courses are assigned once in Foundation and inherited by L1 and higher pathways. L1 applies the same evidence to its own outcomes and adds no separate course or internal exercise in this reviewed selection.','',
 'AI use cases retains its saved title, description, stable item ID and N1.1–N1.3 links. Its delivery status is **Proposed**, and its owner remains **Unassigned**. The historical Foundation and L1 internal modules are not assigned.','',
 'Suggested sequence: start with the internal use-case examples, complete the two courses, and apply the learning to the person’s own work. This sequencing is an implementation suggestion; the reviewed decision is the selection. Bank-specific policies, approved platforms and practical checking habits should be considered against the remaining partial coverage.',''];
for(const id of ['l2','l3','l2-coached','l3-coached']){
 const c=byComponent.get(id);
 lines.push('### '+c.name.replaceAll(' — ',' '),'',`**${c.reviewStatus}**`,'',c.reviewBasis,'');
 lines.push(table(['Additional selected learning','Type','Learner time'],[...c.selected.map(id=>[courseLabel(id),'Catalogue resource',time(duration(byCourse.get(id),scenario.overrides).hours)]),...c.internal.map(i=>[internalLink(i),'Internal training — '+i.status,time(i.hours)])]),'');
 if(!c.selected.length)lines.push('There is no external course assigned to this component. Its planned teaching depends on developing and assessing the internal curriculum.','');
}
lines.push('## Specialist role pathways','',`**All specialist pathways: ${pending}.** Complete the shared learning through the indicated level, then the selected branch. Courses and practice shown below are the specialist additions; totals include inherited learning. The role grouping follows the nine-role model.`,'');
for(const role of publication.roles){
 lines.push(`### ${role.id} ${role.name}`,'');
 for(const id of role.audiences){
  const a=byAudience.get(id),m=metrics(a),specialists=pathComponents(scenario,a).filter(c=>c.category==='Specialisms');
  const ids=[...new Set(specialists.flatMap(c=>c.selected))],items=[...new Map(specialists.flatMap(c=>c.internal).map(i=>[i.id,i])).values()];
  const r=summary(m);
  lines.push(`**${a.name} · L${a.level} · ${a.reviewStatus}**`,'',a.reviewBasis,'');
  if(ids.length||items.length)lines.push(table(['Specialist addition','Learner time'],[...ids.map(id=>[courseLabel(id),time(duration(byCourse.get(id),scenario.overrides).hours)]),...items.map(i=>[internalLink(i)+' — '+i.status,time(i.hours)])]),'');
  else lines.push('Uses shared awareness and relevant product training; no separate specialist package is defined by the model.','');
  lines.push(`Cumulative learning before tool training: **${time(r.totalHours)}** (${time(r.courseHours)} catalogue + ${time(r.internalHours)} internal). Assessed coverage: **${pct(r.assessedCoverage)}**; planned coverage: **${pct(r.plannedCoverage)}**. Must-haves with zero assessed coverage: **${r.mustHavesWithZeroAssessedScore}**; below full assessed coverage: **${r.mustHavesBelowFullAssessedScore}**.`, '');
 }
}
lines.push('## Tool training','',`**${publication.toolTraining.reviewStatus}**`,'',publication.toolTraining.policy,'',
 'Choose product-specific learning for the actual tasks: using, supervising, building or administering. Record approved access, prerequisites, the owner, selected resource IDs and full learner time. No product is assumed deployed by this recommendation.','',
 '## Review and remaining needs','',
 table(['Shared pathway','Must-haves at zero assessed score','Must-haves below full assessed score','Must-haves at zero planned score'],['foundation-path','l1-path','l2-path','l3-path','l2-coached-path','l3-coached-path'].map(id=>{const a=byAudience.get(id),m=summary(metrics(a));return [a.name,m.mustHavesWithZeroAssessedScore,m.mustHavesBelowFullAssessedScore,m.mustHavesWithZeroPlannedScore];})),'',
 'The [coverage record](coverage.json) lists every applicable outcome, its best course score and supporting course IDs, linked internal activities and planned score. It preserves partial scores and explicit absence of assessed evidence. Use it to review what remains after the selected learning; do not treat a high planned percentage as evidence that an internal module is ready.','',
 'Before adopting the AI-generated pathways, confirm audience prerequisites and course access, pilot practical exercises, appoint owners and set delivery dates. Review L3 model selection, routing and cost/latency teaching after excluding TR-229; no replacement has been assigned. Preserve the reviewed Foundation/L1 selection unless the user changes it.','',
 '## Decisions and provenance','',
 ...publication.decisions.map(d=>`- **${d.date}:** ${d.decision}`),'',
 'The excluded resources are '+publication.exclusions.map(e=>'**'+e.id+'**').join(', ')+'. TR-127 is already absent from the catalogue; its exclusion remains in the decision register. Foundation also retains the exclusion of the full INT-2787 social-engineering course.','',
 `Historical candidates: [curated plan](../${publication.sourcePlan}), [coached plan](../${publication.sourceCoachedPlan}) and [internal briefs](../${publication.sourceBriefs}). The archived annual report remains historical. The current recommendation uses its own choices, statuses and catalogue evidence.`, '',
 'The [JSON scenario](Recommended-Training-Pathways.json) is the editable decision source. The guide, internal brief register and coverage record are generated together. Import the JSON into the planner as a separate scenario. The blank starter and retained legacy planner default remain separate. The learner app publishes this scenario with review labels and specialist variants. By user request, learner 1.6.2 uses standard level recommendations without a route selector. Personal learning records remain browser-local.','');

const internalMap=new Map();
for(const c of scenario.components)for(const i of c.internal){const existing=internalMap.get(i.id);if(existing)assert.deepEqual(existing.item,i,`Conflicting shared internal item ${i.id}`);else internalMap.set(i.id,{item:i,components:[]});internalMap.get(i.id).components.push(c);}
const briefLines=['# Internal Training Briefs','',`**Recommended Training Pathways ${publication.version} · ${publicationDate}**`,'',
 'The AI use cases selection is Reviewed. All other internal training selections are AI recommendation - to be reviewed. Every module below remains Proposed for delivery, with an unassigned accountable owner. Suggested facilitator roles are retained as planning candidates. Hours describe learner participation, not development effort.','',
 '[Pathway guide](Recommended-Training-Pathways.md) · [Editable scenario](Recommended-Training-Pathways.json)',''];
for(const {item:i,components} of internalMap.values()){
 briefLines.push(`<a id="${anchor(i.id)}"></a>`,`## ${i.title}`,'',`**${i.id} · ${time(i.hours)} · Delivery: ${i.status} · Selection: ${components.every(c=>c.reviewStatus===reviewed)?reviewed:pending}**`,'',
 `Owner: **${i.owner||'Unassigned'}**.`+(i.suggestedOwner?` Suggested facilitator: ${i.suggestedOwner}.`:''),'',`Assigned in: ${components.map(c=>c.name).join('; ')}. Shared item IDs prevent duplicate learner time.`,'',
 i.outcomes,'',`Linked outcomes: ${i.requirements.join(', ')}.`,'');
}
const outputs={'Recommended-Training-Pathways.md':lines.join('\n'),'Internal-Training-Briefs.md':briefLines.join('\n'),'coverage.json':JSON.stringify(report,null,2)+'\n'};
const checking=process.argv.includes('--check');
for(const [file,content] of Object.entries(outputs)){
 const path='recommended-pathways/'+file;
 if(checking)assert.equal(await read(path),content,`Stale generated artifact: ${path}`);
 else await writeFile(resolve(root,path),content);
}
console.log(`${checking?'Verified':'Built'} pathways ${publication.version}: ${scenario.components.length} components, ${scenario.audiences.length} audience paths, ${internalMap.size} internal briefs; catalogue ${catalogue.version}.`);
