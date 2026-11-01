"""Build a portable HTML decision report and auditable CSV/JSON plan pack."""
import csv, html, json, zipfile, re
from pathlib import Path
from verify_analysis import DATA, COURSES, RESULTS, scope, chain, max_score, measure, hours

HERE=Path(__file__).resolve().parent
options=RESULTS['options']
scenarios={o['id']:json.loads((HERE/(o['id']+'.json')).read_text()) for o in options}
needs={n['id']:n['title'] for n in DATA['needs']}
variants=json.loads((HERE/'variants.json').read_text())
ceilings=json.loads((HERE/'catalogue-ceilings.json').read_text())
design=json.loads((HERE/'in-house-design.json').read_text())
excluded=json.loads((HERE/'global-exclusions.json').read_text())
esc=lambda s:html.escape(str(s),quote=True)
pct=lambda x:f'{100*x:.1f}%'
h=lambda x:f'{x:.1f}h'

def csvout(name,rows):
    with (HERE/name).open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.writer(f)
        for row in rows:
            writer.writerow(["'"+v if isinstance(v,str) and v.startswith(('=','+','-','@')) else v for v in row])

course_rows=[['Option','Cohort','Course ID','Title','Provider','Type','Original duration','Planning hours','Duration basis','Internal or provider URL','Public sources','Catalogue sheet','Catalogue row','Unique layer coverage points if removed']]
need_rows=[['Option','Cohort','Need','Title','Applicable requirements','Coverage %','Band','Critical zero-score requirements','Score-3 requirements']]
requirement_rows=[['Option','Cohort','Requirement','Title','Level','Critical','Selected score','Selected assessment status','Catalogue maximum','Gap class','Witness course IDs','Evidence','Evidence source rows','Proposed internal item IDs']]
internal_rows=[['Option','Cohort','Title','Owner','Learner hours','Linked requirements','Intended outcomes','Status']]
time_rows=[['Option','Cohort','Course budget','Incremental course hours','Incremental internal hours','Cumulative course hours','Cumulative internal hours','Cumulative learner hours','Layer coverage %','Cumulative coverage %','Cumulative critical zero-score requirements']]
all_ids=list(COURSES)
global_ids=[i for i in all_ids if i not in excluded]
def gap(current,best):
    if current==3:return 'Complete'
    if best==0:return 'No assessed teaching found — no evidenced coverage'
    if best==1:return 'No assessed teaching found — mention only'
    if best==3:return 'Can be completed through another assessed resource'
    if best>current:return 'Can be improved, but needs internal completion'
    return 'Internal completion needed'

for o in options:
    s=scenarios[o['id']]
    for c,out in zip(s['cohorts'],o['rows']):
        ch=chain(s,c); ids=list(dict.fromkeys(i for a in ch for i in a['selected']))
        out['budget']=c['budget'];out['internalItems']=c['internal'];out['parent']=c['parent']
        out['inherited']=[i for a in ch[:-1] for i in a['selected']]
        out['requirementDetails']=[]
        for r in scope(c):
            rid=r['id']; score=max_score(ids,rid);ceiling=max_score(all_ids,rid)
            witnessed=[i for i in ids if COURSES[i]['scores'].get(rid,{}).get('score')==score]
            positive=witnessed if score else []
            assessed=any(rid in COURSES[i]['scores'] for i in ids)
            status='Assessed' if assessed else 'Unassessed'
            evidence=[{'id':i,'title':COURSES[i]['title'],**COURSES[i]['scores'][rid]} for i in positive]
            improvements=sorted([{'id':i,'title':COURSES[i]['title'],'score':COURSES[i]['scores'].get(rid,{}).get('score',0)} for i in global_ids if COURSES[i]['scores'].get(rid,{}).get('score',0)>score],key=lambda x:(-x['score'],x['id']))
            items=[x for a in ch for x in a['internal'] if rid in x['requirements']]
            rd={**r,'score':score,'ceiling':ceiling,'globalCeiling':max_score(global_ids,rid),'status':status,'gap':gap(score,ceiling),'evidence':evidence,'improvements':improvements,'internal':[x['title'] for x in items]}
            out['requirementDetails'].append(rd)
            requirement_rows.append([o['name'],c['name'],rid,r['title'],r['level'],r['core'],score,status,ceiling,rd['gap'],'; '.join(positive),' | '.join(f"{e['id']}: {e['evidence']}" for e in evidence),' | '.join(f"{e['id']}: {e['source']['sheet']} row {e['source']['row']}" for e in evidence),'; '.join(x['id'] for x in items)])
        for d in out['details']:
            course=COURSES[d['id']];d['description']=course['description'];d['limitations']=re.sub(r'^V8 \([^)]*\):\s*','',course['limitations']).replace(' Prior fit note retained in V8 audit.','').replace('were omitted from the prior needs list','are included in the course')
            d['durationBasis']='Planner estimate for full reading bundle' if d['id']=='TR-118' else 'Full source duration / upper bound'
            course_rows.append([o['name'],c['name'],d['id'],d['title'],d['provider'],d['type'],d['duration'],d['hours'],d['durationBasis'],d['url'],'; '.join(d['sources']),d['source']['sheet'],d['source']['row'],d['uniquePoints']])
        for n in out['needs']:need_rows.append([o['name'],c['name'],n['id'],needs[n['id']],n['count'],100*n['coverage'],n['band'],n['critical'],n['full']])
        for x in c['internal']:internal_rows.append([o['name'],c['name'],x['title'],x['owner'],x['hours'],'; '.join(x['requirements']),x['outcomes'],x['status']])
        time_rows.append([o['name'],c['name'],c['budget'],out['courseHours']['hours'],out['ownInternalHours'],out['cumulativeCourseHours']['hours'],out['internalHours'],out['cumulativeCourseHours']['hours']+out['internalHours'],out['coverage']*100,out['cumulativeCoverage']*100,out['cumulativeCritical']])

for file,rows in [('course-selections.csv',course_rows),('need-coverage.csv',need_rows),('requirement-evidence-and-gaps.csv',requirement_rows),('internal-commitments.csv',internal_rows),('time-and-coverage.csv',time_rows)]:csvout(file,rows)

shortnames=['1 · Maximum scored coverage','2 · Quality and distinct outcomes','3 · Reputable sources','4 · Quality core + in-house capability']
decision=[
('Coverage benchmark','Maximises the existing scores within the global scope and time limits. Includes brief introductions and a helping-professions course whose relevance to cyber roles is less direct. Useful for comparison; course quality and learner performance remain separate judgements.'),
('Lower development commitment','Curated courses with distinct purposes, plus broad internal practice and sign-off. Keeps generic organisational-redesign teaching. Useful where internal design capacity is limited, but the internal content still needs to be specified and built.'),
('Strict sourcing route','First-party learning, established specialist providers and professional-community references. Suitable where marketplace courses are not permitted. Requires substantial internal completion; a reputable publisher does not make a reading a practical assessment.'),
('Recommended, subject to build capacity','Keeps the quality core and commissions targeted internal teaching for real use cases, approved platforms, supervision, Skills and workflow redesign. Accepts lower currently evidenced course coverage in exchange for a more relevant delivery design. Release depends on pilot evidence and named owners.')]
recommended=options[3]
rec_by={r['id']:r for r in recommended['rows']}
def total(r):return r['cumulativeCourseHours']['hours']+r['internalHours']
def link(url,label):return f'<a href="{esc(url)}" target="_blank" rel="noopener noreferrer">{esc(label)}</a>'
def table(headers,rows):
    return '<div class="tablewrap"><table><thead><tr>'+''.join('<th>'+x+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(('<th>'+x+'</th>') if i==0 else ('<td>'+x+'</td>') for i,x in enumerate(row))+'</tr>' for row in rows)+'</tbody></table></div>'

comparison=table(['Option','All staff / Entry','Practitioner additions','Technical Expert','Governance Expert','Leadership','Critical foundation zeros'],[[esc(shortnames[i])+'<small>'+decision[i][0]+'</small>']+[pct(r['coverage']) for r in o['rows'][:5]]+[str(o['rows'][0]['critical'])] for i,o in enumerate(options)])
timecomparison=table(['Option','All staff / Entry','Practitioner','Technical Expert','Governance Expert','Leadership'],[[esc(shortnames[i])]+[h(total(r)) for r in o['rows'][:5]] for i,o in enumerate(options)])
decisioncards=''.join(f'<article class="card"><span class="eyebrow">OPTION {i+1}</span><h3>{esc(title)}</h3><p>{esc(text)}</p></article>' for i,(title,text) in enumerate(decision))
metrics=''.join(f'<div class="metric"><strong>{h(total(r))}</strong>{esc(label)}<small>{h(r["cumulativeCourseHours"]["hours"])} resources + {h(r["internalHours"])} internal</small></div>' for label,r in zip(['All staff total','Practitioner total','Technical Expert total','Governance Expert total'],recommended['rows'][:4]))
gate={
 'all':'Explain own-domain and neighbouring use cases, distinguish production from pilots, choose permitted tools/data and demonstrate safe use.',
 'practitioner':'Inspect permissions and traces, identify planted errors, stop/revoke/recover, maintain a Skill and its tests, record an accountable release decision.',
 'technical':'Defend a scoped implementation and redesigned workflow using independent tests, human-checked evaluators, tested controls and recovery.',
 'governance':'Defend an AI-risk decision with control, vendor and evaluation evidence; specify oversight and residual-risk ownership.',
 'leadership':'Challenge vendor claims and weak evaluation, set evidence-based autonomy and supervision capacity, retain human accountability.'}
planrows=[]
for r in recommended['rows'][:5]:
    resources='<br>'.join(f'{esc(c["id"])} · {link(c["url"],c["title"])} — {h(c["hours"])}'+(' <em>planner estimate</em>' if c['id']=='TR-118' else '') for c in r['details'])
    internal='<br>'.join(esc(i['title'])+' — '+h(i['hours']) for i in r['internalItems'])
    planrows.append([esc(r['name']),resources,internal,f'{h(total(r))}<small>Cumulative; {h(r["ownInternalHours"])} internal at this layer</small>',gate[r['id']]])
plantable=table(['Audience','External learning — full duration','In-house learning / practice','Total time','Gate'],planrows)

matrixscopes=[('all',f'N{i}','All staff / Entry') for i in range(1,7)]+[('practitioner','N4','Practitioner: N4.7 only')]+[('practitioner',f'N{i}','Practitioner') for i in range(7,10)]+[('technical','N5','Expert: N5.7 only'),('technical','N10','Technical Expert'),('technical','N11','Technical Expert'),('technical','N12','Technical Expert; no architect-only requirement'),('governance','N13','Governance Expert'),('technical','N14','Technical Expert; no leader-only requirements'),('governance','N11','Governance Expert'),('governance','N14','Governance Expert'),('leadership','N11','Leadership'),('leadership','N13','Leadership'),('leadership','N14','Leadership; includes leader-only requirements')]
specialscopes=[('cdc','R1.1'),('forensics','R1.1'),('forensics','R1.2'),('testing','R3.1'),('testing','R3.2'),('redteam','R3.1'),('redteam','R3.2'),('exposure','R4.1'),('harness','R4.2'),('architecture','R5.1'),('biso','R6.1'),('iam','R9.1'),('iam-expert','R9.1')]
def needcell(o,cid,nid):
    row=next(r for r in o['rows'] if r['id']==cid);n=next((n for n in row['needs'] if n['id']==nid),None)
    return pct(n['coverage'])+f'<small>{n["band"]} · {n["critical"]} critical zero</small>' if n else 'Not applicable'
matrix=table(['Need and audience']+[f'Option {i+1}' for i in range(len(options))],[[nid+' · '+esc(needs[nid])+'<small>'+esc(label)+'</small>']+[needcell(o,cid,nid) for o in options] for cid,nid,label in matrixscopes])
specmatrix=table(['Specialist need and branch']+[f'Option {i+1}' for i in range(len(options))],[[nid+' · '+esc(needs[nid])+'<small>'+esc(rec_by[cid]['name'])+'</small>']+[needcell(o,cid,nid) for o in options] for cid,nid in specialscopes])
ceilingtable=table(['Need','Full catalogue ceiling','Requirements at 3','Requirements with maximum 0'],[[n['id']+' · '+esc(n['name']),pct(n['coverage']),f'{n["full"]}/{n["count"]}',esc(', '.join(r['id']+' '+r['title'] for r in n['gaps'] if r['score']==0) or '—')] for n in ceilings])

# Intended teaching is reported as links/counts, never as points or completed gaps.
planned_rows=[];planned_csv=[['Cohort','Need','Applicable requirements','Course coverage %','Incomplete requirements','Incomplete with planned internal item','Incomplete without planned internal item','Unlinked requirement IDs','Internal modules']]
for r in recommended['rows']:
    for n in r['needs']:
        qs=[q for q in r['requirementDetails'] if q['need']==n['id']]
        incomplete=[q for q in qs if q['score']<3];linked=[q for q in incomplete if q['internal']];unlinked=[q['id'] for q in incomplete if not q['internal']]
        modules=sorted({x for q in qs for x in q['internal']})
        planned_rows.append([esc(r['name'])+'<small>'+n['id']+' · '+esc(needs[n['id']])+'</small>',pct(n['coverage']),f'{len(linked)} / {len(incomplete)}<small>Incomplete requirements linked to a proposed item</small>',esc(', '.join(unlinked) or 'None; proposed teaching still needs assessment'),'<br>'.join(esc(x) for x in modules) or 'No linked item'])
        planned_csv.append([r['name'],n['id'],len(qs),n['coverage']*100,len(incomplete),len(linked),len(unlinked),'; '.join(unlinked),'; '.join(modules)])
csvout('planned-internal-targets.csv',planned_csv)
plannedtable=table(['Audience / need','Assessed courses','Planned internal targets','Incomplete and not linked','Proposed modules'],planned_rows)

designcards=''
design_csv=[['Module','Audience','Title','Learner hours','Requirement targets','Owner','Why internal','Agenda','Assessment evidence','Prerequisites','Build effort low (person-hours estimate)','Build effort high (person-hours estimate)','Wave','Status']]
for m in design['modules']:
    valid={r['id'] for r in scope(next(c for c in scenarios['option-4']['cohorts'] if c['id']==m['cohort']))}
    m['requirements']=[r for r in m['requirements'] if r in valid]
    designcards+=f'<details><summary>{esc(m["code"])} · {esc(m["title"])} — {h(m["hours"])}</summary><p><strong>Audience:</strong> {esc(rec_by[m["cohort"]]["name"])} · <strong>Owner:</strong> {esc(m["owner"])} · <strong>Delivery:</strong> {esc(m["wave"])}</p><p><strong>Why build internally:</strong> {esc(m["why"])}</p><p><strong>Lesson plan:</strong> {esc(m["agenda"])}</p><p><strong>Evidence to collect:</strong> {esc(m["evidence"])}</p><p><strong>Inputs needed:</strong> {esc(m["prerequisites"])}</p><small>Targets: {esc(", ".join(m["requirements"]))} · Proposed; unassessed. Estimated initial design/build/review: {m["buildHoursEstimate"][0]}–{m["buildHoursEstimate"][1]} person-hours.</small></details>'
    design_csv.append([m['code'],rec_by[m['cohort']]['name'],m['title'],m['hours'],'; '.join(m['requirements']),m['owner'],m['why'],m['agenda'],m['evidence'],m['prerequisites'],*m['buildHoursEstimate'],m['wave'],m['status']])
csvout('in-house-build-briefs.csv',design_csv)
casetable=table(['Function','Candidate case to source','Evidence the colleague should show'],[[esc(c['function']),esc(c['candidate']),esc(c['evidence'])] for c in design['cases']])
buildlow=sum(m['buildHoursEstimate'][0] for m in design['modules']);buildhigh=sum(m['buildHoursEstimate'][1] for m in design['modules'])
buildrows=[]
for label,cohorts in [('Foundation',['all']),('Practitioner',['practitioner']),('Technical Expert',['technical']),('Governance adaptation',['governance']),('Leadership adaptation',['leadership'])]:
    ms=[m for m in design['modules'] if m['cohort'] in cohorts]
    buildrows.append([label,f'{sum(m["buildHoursEstimate"][0] for m in ms)}–{sum(m["buildHoursEstimate"][1] for m in ms)}',', '.join(m['code'] for m in ms)])
buildtable=table(['Reusable pilot pack','Estimated person-hours','Included modules'],buildrows+[['Shared-pathway total',f'{buildlow}–{buildhigh}','All five paths; each learner takes only their own path'],['Each commissioned specialist branch','12–20','Runbook, case and assessor adaptation; not all branches are required']])

specialnotes={
'cdc':'Incident responders: scenario-based stop/revoke, fallback and an auditable incident record. No extra reading is assigned.',
'forensics':'Forensic specialists: preserve traces and record the AI step without compromising evidence integrity.',
'idp':'AI risk assessors as well as DLP/classification work. DLP-only staff can omit N13, INT-397 and the risk-assessment task with a recorded rationale.',
'biso':'Assurance responsibilities. Regulatory-response roles without assurance duties may omit R6.1 and its reading.',
'testing':'Practitioner test operators. Containment, trajectory review and finding validation on approved targets.',
'redteam':'Designated technical specialists. Contained adversarial test and independent finding validation; further specialist depth may need an exception.',
'exposure':'Inventory, provenance, ownership and lifecycle of agents, Skills and connectors.',
'harness':'Builders of code-analysis harnesses: false positives, deduplication, cost and measurement require a local test set.',
'architecture':'Architects only. Internal design review must address the actual control plane and architect-specific requirements.',
'iam':'Practitioner operations: registration, sponsor, permissions, recertification and revocation.',
'iam-expert':'Expert integration: IGA/PAM/SIEM, privileged access, evidence and break-glass.',
'cio':'Additional tool-selection/adoption decision exercise. Count it once if the same evidence is already assessed in leadership, with a documented exemption.'}
specialties=table(['Function / branch','Additional resources','Extra learner time','Assessed branch coverage','Purpose'],[[esc(r['group'])+'<small>'+esc(r['name'])+'</small>',', '.join(esc(d['id']) for d in r['details']) or 'No extra course',h(r['courseHours']['hours']+r['ownInternalHours'])+'<small>'+h(r['courseHours']['hours'])+' resources + '+h(r['ownInternalHours'])+' internal</small>',pct(r['coverage'])+f'<small>{r["critical"]} critical zero</small>',specialnotes[r['id']]] for r in recommended['rows'][5:]])
criticaltable=table(['Layer','Critical requirements with no assessed course coverage','Planned response'],[[esc(r['name']),'<br>'.join(esc(q['id']+' · '+q['title']) for q in r['requirementDetails'] if q['core'] and q['score']==0) or 'None at zero; partial requirements remain', '<br>'.join(esc(i['title']) for i in r['internalItems'])] for r in recommended['rows'][:5]])
noncoding=variants[2]
noncodingtext=f'The non-coding Practitioner adaptation replaces TR-100 with a supported no-code harness and adds 3h of assisted practice. Total commitment is {h(noncoding["cumulativeCourse"]["hours"]+noncoding["internal"])}; currently assessed Practitioner-layer coverage is {pct(noncoding["coverage"])}. Internal teaching must be assessed before awarding any teaching coverage. Heads must confirm platform availability and assess actual ability.'
certrows=[]
for v in variants[:2]:
    t=v['cumulativeCourse']['hours']+v['internal']+v.get('revisionHoursEstimate',0)+v.get('examHoursCatalogue',v.get('examHoursVerified',0))
    certrows.append([esc(v['name']),h(t)+'<small>Resources + internal work + estimated revision + exam allowance</small>',pct(v['coverage'])+'<small>Layer coverage; exam success does not change teaching scores</small>',esc(v['note'])])
certtable=table(['Optional route','Cumulative learner time','Assessed layer coverage','Planning condition'],certrows)
downloads=''.join(f'<a download href="{o["id"]}.json">Option {i+1} scenario</a>' for i,o in enumerate(options))
payload={'options':options,'needs':needs,'courseNames':{i:c['title'] for i,c in COURSES.items() if i not in excluded},'version':DATA['version']}
values=dict(STYLE=(HERE/'report_styles.css').read_text(),UI=(HERE/'report_ui.js').read_text(),VERSION=esc(DATA['version']),
    COMPARISON=comparison,TIMES=timecomparison,DECISIONS=decisioncards,METRICS=metrics,PLAN=plantable,
    MATRIX=matrix,SPECMATRIX=specmatrix,CEILINGS=ceilingtable,PLANNED=plannedtable,DESIGN=designcards,
    CASES=casetable,BUILD=buildtable,BUILDLOW=str(buildlow),BUILDHIGH=str(buildhigh),SPECIALTIES=specialties,
    CRITICAL=criticaltable,NONCODING=esc(noncodingtext),CERTS=certtable,DOWNLOADS=downloads,
    VERIFYCOUNT=str(sum(len(o['rows']) for o in options)),
    LEADERHOURS=h(total(rec_by['leadership'])),
    PAYLOAD=json.dumps(payload,ensure_ascii=False).replace('<','\\u003c'))
page=(HERE/'report_template.html').read_text()
for key,value in values.items():page=page.replace('@@'+key+'@@',value)
assert not re.search(r'@@[A-Z]+@@',page)
(HERE/'2027-Training-Plan.html').write_text(page,encoding='utf-8')
pack=['2027-Training-Plan.html']+[o['id']+'.json' for o in options]+['course-selections.csv','need-coverage.csv','requirement-evidence-and-gaps.csv','internal-commitments.csv','time-and-coverage.csv','planned-internal-targets.csv','in-house-build-briefs.csv','verification.json']
with zipfile.ZipFile(HERE/'2027-Training-Plan-Pack.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in pack:z.write(HERE/name,name)
print('Created self-contained report, four scenarios, seven CSVs and ZIP:',len(page.encode()),'report bytes')

