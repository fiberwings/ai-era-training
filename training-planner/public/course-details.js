import {duration,hoursLabel} from './duration.js';
import {measure} from './scoring.js';
import {audienceLabel} from './presentation.js';
import {NEED_TITLES} from './capability-model.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=value=>(value*100).toFixed(1)+'%';
const hours=value=>value===null?'Unresolved':hoursLabel(value);
const pill=(text,kind='')=>`<span class="pill ${kind}">${esc(text)}</span>`;
const link=(url,label)=>/^https?:\/\//i.test(url||'')?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:'';
const labels=['Not covered','Mentioned','Partly taught','Fully covered'];
const sourceRef=source=>source?`${source.sheet||'Source'}${source.row?' · row '+source.row:''}`:'';

// All metrics use the existing scorer and the caller's effective outcome scope.
// Course evidence stays separate from the plan's internal teaching commitments.
export function courseDetailModel(data,course,context){
 const scoped=new Map(context.requirements.map(r=>[r.id,r]));
 const rows=data.requirements.map(base=>{
  const r=scoped.get(base.id)||base,record=course.scores?.[r.id],assessed=Number.isInteger(record?.score);
  return {...r,inScope:scoped.has(r.id),core:scoped.has(r.id)&&r.core,score:assessed?record.score:null,record:record||course.unassessed?.[r.id]||null};
 });
 const before=measure(context.requirements,context.courses,data.thresholds);
 const after=measure(context.requirements,[...context.courses,course],data.thresholds);
 const d=duration(course,context.overrides),selected=context.courses.some(c=>c.id===course.id);
 const extra=selected?0:d.hours,unknown=context.spent.unknown+(extra===null?1:0);
 const total=context.spent.hours+(extra??0),budget=context.budget;
 const budgetText=budget===null?'Course budget not set':unknown?'Budget fit unresolved':total>budget+1e-8?`${hours(total-budget)} over course budget`:'Fits course budget';
 const dates=[...Object.values(course.scores||{}),...Object.values(course.unassessed||{})].map(r=>r.date).filter(Boolean).sort();
 return {rows,before,after,d,selected,extra,total,unknown,budget,budgetText,latest:dates.at(-1),gain:after.coverage-before.coverage};
}

function sourceLabel(url){
 try{const u=new URL(url),part=u.pathname.split('/').filter(Boolean).at(-1);return `${u.hostname}${part?' · '+decodeURIComponent(part).replace(/[-_]/g,' '):''}`;}catch{return 'Supporting source';}
}

function evidenceRow(row){
 const s=row.record,status=row.score===null?'Not assessed':`${row.score}/3 · ${labels[row.score]}`;
 return `<tr><th scope="row"><strong>${esc(row.id+' · '+row.title)}</strong><small>${esc(row.description)}</small>${row.core?pill('Must-have in current scope',row.score===0?'amber':''):''}</th><td>${pill(status,row.score===null?'':row.score===3?'green':row.score===0?'red':'amber')}</td><td><p>${esc(s?.evidence||'No recorded assessment for this outcome. This is not a zero score.')}</p>${s?`<small>${esc([s.assessor,s.date,sourceRef(s.source)].filter(Boolean).join(' · '))}</small>${link(s.sourceUrl,'Assessment source')}${s.change?`<small>${esc(s.change)}</small>`:''}${Number.isInteger(s.priorScore)?`<small>Previous score: ${s.priorScore}/3</small>`:''}`:''}</td></tr>`;
}

export function renderCourseEvidence(data,model,scope='current'){
 const rows=model.rows.filter(r=>scope==='all'||r.inScope),groups=new Map();
 for(const r of rows){if(!groups.has(r.need))groups.set(r.need,[]);groups.get(r.need).push(r);}
 if(!rows.length)return '<div class="empty">No assessed outcome scope is assigned to this component. Use All outcomes to inspect the catalogue record. Product/task fit alone does not earn coverage.</div>';
 return `<p class="course-evidence-count" aria-live="polite">${rows.length} outcomes · ${rows.filter(r=>r.score===3).length} fully covered · ${rows.filter(r=>r.score===1||r.score===2).length} partly covered or mentioned · ${rows.filter(r=>r.score===0).length} not covered · ${rows.filter(r=>r.score===null).length} not assessed</p>${[...groups].map(([id,rs])=>{
  const assessed=rs.filter(r=>r.score!==null),coverage=rs.reduce((sum,r)=>sum+(r.score??0),0)/(rs.length*3),must=rs.filter(r=>r.core&&r.score===0).length;
  return `<details class="course-need"><summary><span><strong>${esc(id+' · '+(NEED_TITLES[id]||data.needs.find(n=>n.id===id)?.title||id))}</strong><small>${rs.length} outcomes${must?' · '+must+' must-have outcome'+(must===1?'':'s')+' not covered':''}${assessed.length<rs.length?' · '+(rs.length-assessed.length)+' not assessed':''}</small></span><span class="course-need-score">${assessed.length?pct(coverage):'Not assessed'}${assessed.length?`<span class="course-need-bar"><span style="width:${coverage*100}%"></span></span>`:''}</span></summary><div class="course-evidence-table"><table><thead><tr><th>Outcome</th><th>Course score</th><th>Evidence & source</th></tr></thead><tbody>${rs.map(evidenceRow).join('')}</tbody></table></div></details>`;
 }).join('')}`;
}

export function renderCourseDetailBody(data,course,context,model=courseDetailModel(data,course,context)){
 const m=model,scored=m.rows.some(r=>r.score!==null),sources=[...new Set(course.sources||[])].filter(u=>u!==course.url);
 const fit=context.fitNote||context.reason||'Eligible under current recommendation filters';
 const commitment=`${hours(m.total)}${m.unknown?' + '+m.unknown+' unresolved':''}${m.budget===null?'': ' / '+hours(m.budget)}`;
 return `<div class="course-meta">${pill(course.id)}${pill(course.provider)}${pill(course.type||'Resource')}${pill('Source audience: '+audienceLabel(course.level))}${pill(course.cost||'Cost not recorded')}${pill(scored?(course.evidence||'Assessed'):'Not assessed',scored?'blue':'amber')}</div>
 <section class="course-section"><h3>Overview</h3><p>${esc(course.description||'No description provided in the catalogue.')}</p></section>
 <div class="course-facts"><section><h3>Learning commitment</h3><dl><div><dt>Published duration</dt><dd>${esc(course.duration||'Not recorded')}</dd></div><div><dt>Planning hours</dt><dd><strong>${hours(m.d.hours)}</strong>${Object.hasOwn(context.overrides||{},course.id)?pill('Planner override','amber'):''}</dd></div></dl><small>${esc(m.d.note)}. Full-course learning time.</small></section><section><h3>Access & cost</h3><p>${link(course.url,'Open course / enrolment')||'Course link not recorded'}</p><p>${esc(course.cost||'Cost not recorded')}</p><small>${esc(course.type||'Resource')}${course.tool?' · '+esc(course.tool):''}</small></section></div>
 <section class="course-fit"><div class="course-section-heading"><h3>Fit for ${esc(context.name)}</h3>${pill(context.selectionLabel||(m.selected?'Already selected or shared':'Not selected'),m.selected?'green':'')}</div><div class="course-fit-stats"><div><strong>${context.requirements.length?'+'+(m.gain*100).toFixed(1)+' pp':'Not assessed'}</strong><small>Additional assessed coverage</small></div><div><strong>${hours(m.extra)}</strong><small>Additional course time in this path</small></div><div><strong>${esc(commitment)}</strong><small>${m.selected?'Current course time in this scope':'Course time in this scope after addition'}</small></div></div>${context.requirements.length?`<p>Assessed coverage: ${pct(m.before.coverage)} → ${pct(m.after.coverage)}. ${m.after.critical} must-have outcomes remain at zero in the assessed scope.</p>`:''}<div class="course-fit-notes">${pill(fit,context.reason?'amber':'blue')}${pill(m.budgetText,m.budget!==null&&!m.unknown&&m.total<=m.budget+1e-8?'green':'amber')}</div><small>Course budgets exclude internal practice. Assessed coverage uses catalogue evidence; internal teaching is tracked separately in planned coverage.</small></section>
 <section class="course-section"><h3>Fit & limitations</h3><p>${esc(course.limitations||'No additional fit note recorded.')}</p></section>
 <section class="course-section"><div class="course-section-heading"><div><h3>Coverage & outcome evidence</h3><small>Scores below describe this course, not the combined plan.</small></div><label>Evidence scope<select data-course-scope><option value="current">${esc(context.scopeLabel||'Current component')}</option><option value="all">All outcomes</option></select></label></div>${!scored?'<div class="banner warn">Not assessed against the outcome rubric. Missing evidence does not mean no teaching is present.</div>':''}<p class="course-score-guide">0: not covered · 1: mentioned · 2: partly taught · 3: fully covered under the rubric. Skill outcomes require practice for 3. Not assessed is separate from zero. Coverage does not certify learner competence.</p><div data-course-evidence>${renderCourseEvidence(data,m)}</div></section>
 <section class="course-section course-sources"><h3>Sources & assessment history</h3><p>${m.latest?'Latest recorded outcome assessment: <strong>'+esc(m.latest)+'</strong>. ':''}${esc(sourceRef(course.source))}</p><details><summary>Supporting sources (${sources.length})</summary>${sources.length?`<ul>${sources.map(url=>`<li>${link(url,sourceLabel(url))||'Source link unavailable'}</li>`).join('')}</ul>`:'<p>No additional supporting links recorded.</p>'}</details>${course.audit?`<details><summary>Historical source review · ${esc(sourceRef(course.audit.source))}</summary><p class="course-score-guide">Historical record. Later outcome assessments above take precedence.</p><p>${esc(course.audit.basis)}</p><p>${esc(course.audit.note)}</p>${course.audit.priorFit?`<p><strong>Earlier fit note:</strong> ${esc(course.audit.priorFit)}</p>`:''}${course.audit.priorCoverage?`<p><strong>Earlier coverage:</strong> ${esc(course.audit.priorCoverage)}</p>`:''}</details>`:''}</section>`;
}

export function showCourseDetails(dialog,data,course,context){
 const model=courseDetailModel(data,course,context),attr=context.workspace==='legacy'?'data-action':'data-cp';
 const button=(action,text,primary=false)=>`<button ${attr}="${action}" data-id="${esc(course.id)}" class="${primary?'primary':''}">${esc(text)}</button>`;
 const editable=!context.readOnly&&!context.busy;
 dialog.classList.add('course-details-dialog');dialog.setAttribute('aria-labelledby','course-detail-title');
 const content=dialog.querySelector('#dialog-content');
 content.innerHTML=`<header class="dialog-top"><div><div class="eyebrow">Course detail</div><h2 id="course-detail-title">${esc(course.title)}</h2></div>${button('close','Close')}</header><div class="course-detail-scroll">${renderCourseDetailBody(data,course,context,model)}</div><footer class="course-detail-footer"><span>${context.readOnly?'Finalised plan · read only':context.busy?'Recommendation in progress':model.selected?'Already included in this path':''}</span><div class="actions">${editable?button('estimate','Adjust planning hours'):''}${link(course.url,'Open course')}${editable&&!model.selected?button('preview','Preview addition to '+context.name,true):''}</div></footer>`;
 content.querySelector('[data-course-scope]').addEventListener('change',event=>{
  content.querySelector('[data-course-evidence]').innerHTML=renderCourseEvidence(data,model,event.target.value);
 });
 if(!dialog.open)dialog.showModal();
}
