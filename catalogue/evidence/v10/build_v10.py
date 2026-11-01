"""Append explicit syllabus assessments while preserving native workbook parts.

The established v8/v9 workflow documents artifact-tool full-import heap
exhaustion at 4/12 GB. Preserve native OOXML, render small native-format extracts
with artifact-tool, and independently reconcile all formula caches with Calc.
No scores are inferred from keywords; decisions.tsv is the analyst record.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from collections import Counter, defaultdict
from datetime import date
import json, re, sys, math, hashlib, csv
from lxml import etree as E

P=Path(__file__).resolve().parent; ROOT=P.parent
sys.path.insert(0,str(ROOT/'.catalogue-v8'))
from workbook_xml import tag, NS, xml, valcell, setcache, col, put
SRC=ROOT/'AI_Era_Cyber_Training_Catalogue_v9.xlsx'
if not SRC.exists(): SRC=ROOT/'catalogue-archive'/SRC.name
DST=ROOT/'AI_Era_Cyber_Training_Catalogue_v10.xlsx'
DATE='2026-10-18'; serial=(date(2026,10,18)-date(1899,12,30)).days
base=json.loads((ROOT/'training-planner/public/data/catalogue.json').read_text())
# Use the archived v9 snapshot when rerunning after publication.
if base['filename']!=SRC.name:
    base=json.loads((ROOT/'training-planner/catalogue-history/a959067fd5d91eba.json').read_text())
reqs={r['id']:r for r in base['requirements']}; needs={n['id']:n for n in base['needs']}
inventory=json.loads((P/'inventory.json').read_text()); inv={c['reviewNumber']:c for c in inventory}
inv[83]['url']='https://www.deeplearning.ai/courses/intro-to-federated-learning-c2'
dec={}
next_id=176
for line in (P/'decisions.tsv').read_text().splitlines():
    n,action,level,scores,note=line.split('\t'); n=int(n)
    values={k:int(v) for k,v in (x.split('=') for x in scores.split())} if scores!='-' else {}
    assert set(values)<=set(reqs) and all(v in [1,2,3] for v in values.values())
    oid=f'TR-{next_id:03d}' if action=='ADD' else action.split(':')[1] if action.startswith('EXISTING:') else ''
    if action=='ADD': next_id+=1
    dec[n]=dict(number=n,action=action,level=level,scores=values,note=note,id=oid)
assert set(dec)==set(inv)==set(range(1,132))
# Final conservative whole-requirement review: broad modalities are incomplete.
dec[105]['scores']['N2.2']=2
dec[105]['note']='Open-model selection and labs span text, image, audio and visual QA, then cloud deployment. Practical model orientation; the full code/document/screen modality range, bank-approved platforms and secure deployment are not all evidenced.'

with ZipFile(SRC) as z:parts={n:z.read(n) for n in z.namelist()}
original=parts.copy()
strings=[''.join(t.itertext()) for t in E.fromstring(parts['xl/sharedStrings.xml'])]
def value(c):
    if c is None:return None
    if c.get('t')=='inlineStr':return ''.join(c.find(tag('is')).itertext())
    s=c.findtext(tag('v'))
    if c.get('t')=='s':return strings[int(s)]
    if c.get('t') in (None,'n'):
        try:return float(s) if '.' in s or 'e' in s.lower() else int(s)
        except (ValueError,TypeError,AttributeError):return s
    return s
def rv(row,cc):return value(row.find(f'm:c[@r="{cc}{row.get("r")}"]',NS))
trees={i:E.fromstring(parts[f'xl/worksheets/sheet{i}.xml']) for i in [1,3,4,5,6,10,14]}
def template(num):
    row=trees[num].find('m:sheetData/m:row[@r="2"]',NS)
    return ({re.sub(r'\d','',c.get('r')):c.get('s','5') for c in row},
            {re.sub(r'\d','',c.get('r')):c.find(tag('f')).text for c in row if c.find(tag('f')) is not None})
templates={n:template(n) for n in [5,6,10,14]}
def append(num,values,height):
    sd=trees[num].find(tag('sheetData')); rn=int(sd[-1].get('r'))+1
    row=E.SubElement(sd,tag('row'),r=str(rn),ht=str(height),customHeight='true')
    styles,formula=templates[num]
    for i,v in enumerate(values,1):
        cc=col(i);row.append(valcell(f'{cc}{rn}',v,styles.get(cc,'5'),formula.get(cc)))
    return rn
def meta(c):
    txt=(P/'sources'/f"{c['reviewNumber']:03d}.txt").read_text()
    m=re.search(r'\n((?:\d+h(?:\d+m)?|\d+m))\n',txt)
    duration=m[1] if m else 'Not stated'
    updated=re.search(r'Updated ([A-Z][a-z]+ \d+, \d{4})',txt)
    cost=('Free access advertised at review; Pro graded work/accomplishment; external service costs may apply'
          if 'Enroll for Free' in txt else 'See membership pricing; Pro graded work/certificate; external service costs may apply')
    who=txt.split('Who should join?')[-1].split('Course Outline')[0] if 'Who should join?' in txt else ''
    if c['reviewNumber'] in [12,21,48,60]: pre='No technical background required.'
    elif c['reviewNumber']==81: pre='Beginner Python with AI assistance; no prior coding required.'
    elif c['reviewNumber']==102: pre='Basic JavaScript required.'
    elif c['reviewNumber']==11: pre='React and Python familiarity recommended.'
    elif c['reviewNumber']==45: pre='Python and Git familiarity recommended.'
    elif 'Python' in who: pre='Python familiarity; consult the provider for further prerequisites.'
    else: pre='Check the provider audience/prerequisites before assigning this course.'
    return duration,cost,updated[1] if updated else c['releasedAt'][:10],pre

boundary={
 'N1.1':'Cyber-relevant example only; the full own/adjacent-domain range is not covered.',
 'N1.3':'General work-change orientation; own cyber-domain application needs discussion.',
 'N2.1':'Selected model/token/performance concepts; not the whole provider, reasoning and hosting landscape.',
 'N2.2':'Selected modalities; not all modalities in the requirement are evidenced.',
 'N2.3':'Some collaboration patterns; not all four usage patterns.',
 'N2.4':'Agent components are taught; complete harness anatomy is only credited where explicit.',
 'N2.5':'Some extension mechanisms; not all of MCP, Skills and APIs.',
 'N2.6':'Only the named safety components; no complete deployment safety stack.',
 'N3.3':'Context limits/persistence are addressed; full recognition in the learner\'s own tools is not established.',
 'N3.7':'Checking/critique is taught; independent-first judgment and sampling are not all evidenced.',
 'N4.1':'Generic data-transfer behavior; bank-specific boundaries are not covered.',
 'N4.2':'Privacy/confidentiality techniques; corporate client-data rules still need internal teaching.',
 'N6.1':'Task scoping/selection is taught; complete workplace delegation judgment needs practice.',
 'N6.2':'Useful context/prompting techniques; complete information, examples and constraints practice is not all evidenced.',
 'N6.3':'Review/debugging is taught; complete output, reasoning and behavior judgment is not established.',
 'N6.5':'Some model/task tradeoffs; full choice and effort-setting practice is not evidenced.',
 'N6.6':'Some memory/context techniques; the whole degradation-and-management skill is incomplete.',
 'N6.8':'Course exercises do not establish daily use within the bank\'s rules.',
 'N7.1':'Task boundaries are taught; signed-off action classes and permission checks are incomplete.',
 'N7.2':'Tracing/observation only; permissions, changes and approval overload are not all covered.',
 'N7.4':'Intervention in a demo; compromised-agent rollback, takeover and outage fallback remain incomplete.',
 'N8.1':'Some Skill construction; triggers, steps, examples, failure guidance and own tests are not all evidenced.',
 'N8.2':'Some reuse/refinement; monthly review and retesting after every dependency change are incomplete.',
 'N8.3':'Reuse/library is mentioned; ownership and deprecation workflow are not taught.',
 'N8.4':'Connector use is shown; full permissions and least-privilege practice is not evidenced.',
 'N9.1':'Evaluation examples exist; a full known-answer benchmark set for the learner\'s use cases is not established.',
 'N9.2':'Failure examples/diagnosis; not a complete maintained known-fault catalogue.',
 'N9.3':'Checks/metrics are taught; complete per-case pass/fail practice is not established.',
 'N9.4':'Iteration/CI is covered; every Skill shipping tests and all model/tool/Skill change triggers are not established.',
 'N10.1':'Some loop/tool/planning/reflection patterns; not all four with practice.',
 'N10.2':'Some agent collaboration; complete decomposition and communication design is not evidenced.',
 'N10.3':'Selected harness/context infrastructure; not full-scale architecture.',
 'N10.4':'Selected performance choices; not the whole model-selection/routing/cost/latency skill.',
 'N10.5':'Selected hosting options; full residency and placement decisions are not covered.',
 'N10.7':'Reusable Skills/plugins are discussed; production library ownership and packaging lifecycle are incomplete.',
 'N10.8':'Selected deployment measures; full N2/N12 safety and N11 evaluation standards remain incomplete.',
 'N11.1':'Selected test/evaluation methods; not the full domain/vendor test-set design skill.',
 'N11.2':'Error analysis is taught; aggregation across practitioners is not established.',
 'N11.3':'Judge use is mentioned; validation against human labels is not established.',
 'N11.4':'Benchmarking technique only; procurement decision methodology is incomplete.',
 'N11.5':'Monitoring/measurement is taught; complete production drift practice is not established.',
 'N12.3':'Isolation techniques; complete sandbox threats and countermeasures are not covered.',
 'N12.4':'Restricted functions are mentioned; an independently enforced authorisation layer is not established.',
 'N12.5':'Selected guardrails; complete design and attacks against them are not covered.',
 'N12.6':'Logging/monitoring only; kill switches and adversarial threats remain incomplete.',
 'N12.9':'Selected architecture/placement controls; not complete tenancy/isolation/residency patterns.',
 'N14.1':'Task allocation examples; workflow-wide supervision ratios are not established.',
 'N14.2':'Workflow/project redesign concepts; bank workflow practice remains incomplete.',
 'N14.4':'Value/prototype feedback concepts; full evidence-based value measurement practice is incomplete.',
 'N14.5':'Adoption concepts; all champion, protected-time, Skills-sharing and refresh mechanisms are not evidenced.',
 'R4.2.1':'Context effects on review quality; the full security-harness performance case is incomplete.',
 'R4.2.2':'Repository context retrieval; full automated static/dynamic dataflow and build-context supply is incomplete.',
 'R4.2.3':'Structured specialized review; full framework/model selection methodology is incomplete.',
 'R5.1.5':'Human-facing interaction/approval patterns; risk, confidence, overload and overseer training are incomplete.'
}
review=[]; newcov=[]; allscores=defaultdict(list)
for c in base['courses']:
    for q,s in c['scores'].items():allscores[q].append(s['score'])
existing_rows={rv(r,'A'):int(r.get('r')) for r in trees[10].find(tag('sheetData')) if r.get('r')!='1'}
for n,d in dec.items():
    c=inv[n];dur,cost,updated,pre=meta(c)
    partners=', '.join(x['title'] for x in c['wpData'].get('coursePartner',[]))
    provider='DeepLearning.AI'+(' + '+partners if partners and partners!='DeepLearning.AI' else '')
    title=c['name'].replace('\u3164','').strip(); url=c['url']
    if d['action']=='ADD':
        oid=d['id']; scores=d['scores']; cv=[]
        for need,nr in needs.items():
            rr=[r for r in reqs.values() if r['need']==need]
            rank=max(['Base','Entry','Practitioner','Expert'].index(d['level']),min(r['rank'] for r in rr),max((r['rank'] for r in rr if scores.get(r['id'],0)>=2),default=0))
            scope=[r for r in rr if r['rank']<=rank]; vals=[scores.get(r['id'],0) for r in scope]
            pct=sum(vals)/(3*len(vals));core=sum(r['core'] for r in scope);gaps=sum(r['core'] and v==0 for r,v in zip(scope,vals))
            band='Full' if all(v==3 for v in vals) else 'Strong' if pct>=.7 and not gaps else 'Partial' if pct>=.3 else 'Weak'
            row=[oid,title,need,nr['title'],['Base','Entry','Practitioner','Expert'][rank],rank,len(scope),len(scope),pct,core,gaps,vals.count(3),band,'All 140 outcomes reviewed. Target scope follows historical workbook ranks; the capability-model overlay controls planning applicability.']
            append(6,row,42);cv.append(row);newcov.append(row)
        for q,r in reqs.items():
            score=scores.get(q,0);allscores[q].append(score)
            if score==0:evidence='V10 public-syllabus review: no explicit teaching or mention evidenced for this requirement. Zero describes the reviewed evidence, not proof of absence from gated course content.'
            else:
                limit=('Whole requirement evidenced with '+('explicit exercise/lab practice.' if not q.startswith(('N1.','N2.','N3.','N4.','N5.')) else 'sufficient knowledge depth.')) if score==3 else boundary.get(q,'Relevant partial teaching is evidenced; the entire requirement and its practice conditions are not established.')
                evidence=f'V10 — {r["title"]}. {d["note"]} Requirement boundary: {limit}'
            append(5,[oid,title,q,r['need'],r['title'],score,evidence,'AI public-syllabus desk review v10',serial,r['rank'],'Yes' if r['core'] else '', 'Active','Assessed',None,url,'New v10 assessment'],max(45,min(160,math.ceil(len(evidence)/86)*13+8)))
        pos=[v for v in cv if v[8]>0];summary='; '.join(f'{v[2]} {v[12]} {v[8]:.0%}' for v in pos)
        supervision='Partial' if any(scores.get(q,0)>=2 for q in ['N7.1','N7.2','N7.3','N7.4','N7.5']) else 'No'
        review_status='Needs delivery validation' if n==129 else 'Assessed'
        source_type={'short_course':'Short course','course':'Course','specialization':'Certificate programme'}[c['type']]
        description=f'{DATE} public syllabus review. {source_type}. '+d['note'].split(';')[0].rstrip('. ')+'. '+pre
        fit=f'V10 ({DATE}): {d["note"]} {pre} Assessment is of advertised teaching, not course completion or workplace authorisation.'
        offer=[oid,provider,title,'Course','Vendor-led, transferable' if partners!='DeepLearning.AI' else 'Vendor-neutral','Self-paced online',dur,cost,updated,supervision,'See requirement evidence; no complete corporate supervisory sign-off.', 'Y' if c['wpData']['courseLevel']=='Beginner' else 'N','V',d['level'],'All 23 needs assessed; evidenced: '+', '.join(v[2] for v in pos),'—',review_status,None,url,'Full syllabus',description,summary,sum(v[12] in ['Full','Strong'] for v in cv),fit,url+'\nhttps://www.deeplearning.ai/courses']
        append(10,offer,110)
    elif d['action'].startswith('EXISTING:'):
        rn=existing_rows[d['id']];t=trees[10]
        # Recheck adds evidence while retaining old score values and reviewer decisions.
        oldfit=value(t.find(f'.//m:c[@r="X{rn}"]',NS)) or ''
        oldsources=value(t.find(f'.//m:c[@r="Y{rn}"]',NS)) or ''
        put(t,f'X{rn}',oldfit+f' V10 recheck ({DATE}): '+d['note'])
        put(t,f'Y{rn}','\n'.join(dict.fromkeys((oldsources+'\n'+url+'\nhttps://www.deeplearning.ai/courses').splitlines())))
        if n!=36:
            put(t,f'G{rn}',dur);put(t,f'H{rn}',cost);put(t,f'S{rn}',url);put(t,f'M{rn}','V')
        t.find(f'm:sheetData/m:row[@r="{rn}"]',NS).set('ht','180')
    decision='Added (v10)' if d['action']=='ADD' else 'Not added (v10)' if d['action']=='EXCLUDE' else 'Existing — rechecked (v10)'
    reason=f'{DATE}: {d["note"]} Source: {url}'
    append(14,[title,provider,decision,d['id'],reason],max(70,min(200,math.ceil(len(reason)/78)*13+10)))
    review.append(dict(number=n,title=title,type=c['type'],decision=decision,catalogueId=d['id'],duration=dur,level=d['level'],positiveRequirements=len(d['scores']),source=url,reviewDate=DATE,reason=d['note']))

new_offer_count=307+sum(d['action']=='ADD' for d in dec.values());score_count=new_offer_count*140;coverage_count=new_offer_count*23
allcov=[(rv(r,'C'),rv(r,'M')) for r in trees[6].find(tag('sheetData')) if r.get('r')!='1']
stats={q:(max(v),v.count(3),v.count(2)) for q,v in allscores.items()}
for row in trees[4].find(tag('sheetData')):
    q=rv(row,'A')
    if q not in stats:continue
    for cc,v in zip(['L','M','N'],stats[q]):setcache(row.find(f'm:c[@r="{cc}{row.get("r")}"]',NS),v)
for row in trees[3].find(tag('sheetData')):
    need=rv(row,'A'); rr=[r for r in reqs.values() if r['need']==need]
    if not rr:continue
    vs=[sum(stats[r['id']][0]==3 for r in rr),sum(stats[r['id']][0]<2 for r in rr),sum(n==need and b in ['Full','Strong'] for n,b in allcov),sum(n==need and b=='Partial' for n,b in allcov)]
    for cc,v in zip(['K','L','M','N'],vs):setcache(row.find(f'm:c[@r="{cc}{row.get("r")}"]',NS),v)
# Three-line summary headers must remain readable with the expanded counts.
trees[3].find('m:sheetData/m:row[@r="1"]',NS).set('ht','48')
trees[3].find('m:sheetData/m:row[@r="1"]',NS).set('customHeight','true')
rd=trees[1]
put(rd,'A1','AI-era cyber training catalogue — draft v10')
put(rd,'A8',f'Scores — all {new_offer_count} Offers × all 140 active requirements. Blank scores are explicitly unassessed. Assessment dates and source references identify each review.')
put(rd,'A37','Assessed/general learning offers')
put(rd,'A41','Screening log entries (all reviews)')
put(rd,'A42','…added (all screening reviews)');put(rd,'A43','…not added (all screening reviews)')
for addr,v in {'B37':new_offer_count,'B41':216,'B42':126,'B43':61,'B67':sum(s[0]==3 for s in stats.values()),'B68':sum(s[0]<2 for s in stats.values()),'B69':score_count-280,'B70':coverage_count,'B71':sum(b in ['Full','Strong'] for _,b in allcov)}.items():setcache(rd.find(f'.//m:c[@r="{addr}"]',NS),v)
notes=[
 'Changes in v10 — 18 October 2026',
 'DeepLearning.AI review: all 131 currently listed offerings (107 short courses, 13 courses, 11 certificate programmes), cross-checked against the public sitemap. 104 added as TR-176–TR-279, 7 existing entries rechecked without changing their scores, and 20 exclusions recorded in Screening log.',
 f'Current scope: {new_offer_count} Offers + 117 Tool track entries = {new_offer_count+117} resources; 140 requirements; {score_count-280:,} numeric scores + 280 unassessed rows; {coverage_count:,} course/need assessments. V9 is archived unchanged.',
 'Assessment basis: public learning objectives, lesson outlines and explicit exercise descriptions. Every new Offer is scored on all 140 requirements. 0 = no evidence in reviewed material; 1 = mention; 2 = partial teaching or incomplete practice; 3 = whole requirement, with practice for skill outcomes. Gated lessons and delivery were not completed.',
 'Scope and duplicates: certificate component courses are reviewed within their parent programme, not added again. Seven existing DeepLearning.AI courses retain their stable IDs. General model-training mathematics, unrelated domain courses and other N0 craft are excluded with reasons. Vendor-led courses enter Offers only for evidenced transferable learning, with product dependencies and prerequisites stated.',
 'Planning: provider-displayed total learning durations are retained, including listed exercises. Completion may take longer. Agentic AI TR-098 retains the Coursera estimate (~23h); its DeepLearning.AI alternative shows 9h55m. Membership, graded work and external API/cloud costs must be checked at enrolment; no blanket free-access claim is made.',
 'Delivery exception: Gemini CLI course TR-277 includes a provider deprecation notice for Free/Pro/Ultra users. It remains assessed and visible as Needs delivery validation, excluded from automatic recommendations. Older model/API courses carry compatibility notes.',
 'Interpretation: bank policies, data classification, approved platforms, operational authorisation, incident response and regulatory controls are not inferred from generic coding labs. Existing workforce plans require review against the expanded catalogue; no learner competence or internal-training completion is inferred.',
 'Navigation: filter Offers IDs TR-176 to TR-279 for additions. Screening log rows 87–217 record every DeepLearning.AI inclusion, duplicate and exclusion with sources. Column headings are now version-neutral; existing assessment dates and the historical V8 audit remain intact.'
]
# The exception ID is derived, rather than tied to directory order assumptions.
notes[6]=notes[6].replace('TR-277',dec[129]['id'])
for rn,text in enumerate(notes,93):
    put(rd,f'A{rn}',text,style='23' if rn==93 else '5')
    row=rd.find(f'm:sheetData/m:row[@r="{rn}"]',NS);row.set('ht',str(max(30,math.ceil(len(text)/130)*16+10)));row.set('customHeight','true')
    E.SubElement(rd.find(tag('mergeCells')),tag('mergeCell'),ref=f'A{rn}:D{rn}')
rd.find(tag('mergeCells')).set('count',str(len(rd.find(tag('mergeCells')))))
rd.find(tag('dimension')).set('ref',f'A1:D{92+len(notes)}')
headers={10:{'U':'Content summary (dated desk reviews)','V':'Coverage at assessment','X':'Fit note'},5:{'P':'Assessment change'}}
for num,changes in headers.items():
    for cc,h in changes.items():put(trees[num],cc+'1',h,style='23')
extents={5:f'A1:P{score_count+1}',6:f'A1:N{coverage_count+1}',10:f'A1:Y{new_offer_count+1}',14:'A1:E217'}
for num,extent in extents.items():
    t=trees[num];t.find(tag('dimension')).set('ref',extent);end=int(re.search(r'\d+$',extent)[0])
    for x in t.findall('m:conditionalFormatting',NS):
        x.set('sqref',re.sub(r'(?<=:)\$?([A-Z]+)\$?\d+',lambda m:m[1]+str(end),x.get('sqref')))
        for f in x.findall('.//m:formula',NS):
            if f.text and num==5:f.text=f.text.replace('$42981',f'${end}')
    for dv in t.findall('m:dataValidations/m:dataValidation',NS):
        dv.set('sqref',re.sub(r'(?<=:)\$?([A-Z]+)\$?\d+',lambda m:m[1]+str(end+1000),dv.get('sqref')))
        # ID dropdowns/ranges referring to Offers need to include all additions.
        for f in dv.findall('m:formula1',NS):
            if f.text and 'Offers!' in f.text:f.text=re.sub(r'(Offers!\$A\$2:\$A\$)\d+',lambda m:m[1]+str(new_offer_count+1),f.text)
name_nums={'Scores':5,'Coverage':6,'Offers':10,'Screening':14}
for path,raw in list(parts.items()):
    if not path.startswith('xl/tables/') or not path.endswith('.xml'):continue
    t=E.fromstring(raw);num=name_nums.get(t.get('name'))
    if not num:continue
    t.set('ref',extents[num]);t.find(tag('autoFilter')).set('ref',extents[num])
    for c in t.find(tag('tableColumns')):
        cc=col(int(c.get('id')))
        if cc in headers.get(num,{}):c.set('name',headers[num][cc])
    parts[path]=xml(t)
# Keep the user-facing URL cells as real hyperlinks, including refreshed rows.
REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
rels_path='xl/worksheets/_rels/sheet10.xml.rels'
rels=E.fromstring(parts[rels_path]); links=trees[10].find(tag('hyperlinks'))
next_rel=max(int(e.get('Id')[3:]) for e in rels if re.fullmatch(r'rId\d+',e.get('Id','')))+1
active_rows={rv(r,'A'):int(r.get('r')) for r in trees[10].find(tag('sheetData')) if r.get('r')!='1'}
for d in dec.values():
    if not d['id'] or d['number']==36:continue
    addr=f'S{active_rows[d["id"]]}';url=inv[d['number']]['url']
    link=next((e for e in links if e.get('ref')==addr),None)
    if link is not None:
        rid=link.get('{'+REL+'}id'); rel=next(e for e in rels if e.get('Id')==rid);rel.set('Target',url)
    else:
        rid=f'rId{next_rel}';next_rel+=1
        E.SubElement(links,tag('hyperlink'),ref=addr,attrib={'{'+REL+'}id':rid})
        E.SubElement(rels,'{'+PKG+'}Relationship',Id=rid,Type=REL+'/hyperlink',Target=url,TargetMode='External')
parts[rels_path]=xml(rels)
for num,t in trees.items():parts[f'xl/worksheets/sheet{num}.xml']=xml(t)
with ZipFile(DST,'w',ZIP_DEFLATED) as z:
    for name,raw in parts.items():z.writestr(name,raw)
with (P/'review-register.csv').open('w',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=review[0].keys());writer.writeheader();writer.writerows(review)
manifest={'date':DATE,'source':str(SRC),'sourceSha256':hashlib.sha256(SRC.read_bytes()).hexdigest(),'output':str(DST),'reviewed':131,'added':104,'existingRechecked':7,'excluded':20,'offers':new_offer_count,'resources':new_offer_count+117,'scoreRows':score_count,'numericScores':score_count-280,'coverageRows':coverage_count,'newIds':[d['id'] for d in dec.values() if d['action']=='ADD'],'deliveryValidationIds':[dec[129]['id']],'changedParts':[n for n in parts if parts[n]!=original.get(n)],'sourceFiles':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in (P/'sources').glob('*.html')}}
(P/'manifest.json').write_text(json.dumps(manifest,indent=2));(P/'assessments.json').write_text(json.dumps(list(dec.values()),indent=2))
print(json.dumps({k:v for k,v in manifest.items() if k not in ['sourceFiles','newIds']},indent=2))
