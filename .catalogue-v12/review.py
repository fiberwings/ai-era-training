"""Two-course review: artifact-authored edits with native OOXML preservation."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
import json, sys, re, copy, hashlib
from datetime import date
P=Path(__file__).resolve().parent; R=P.parent
sys.path.insert(0,str(R/'.catalogue-v8'))
from workbook_xml import NS, tag, xml, put, setcache
SRC=R/'AI_Era_Cyber_Training_Catalogue_v11.xlsx'
DST=R/'AI_Era_Cyber_Training_Catalogue_v12.xlsx'
def load(p):
    with ZipFile(p) as z:return {n:z.read(n) for n in z.namelist()}
def save(p,path):
    with ZipFile(path,'w',ZIP_DEFLATED) as z:
        for n,b in p.items():z.writestr(n,b)
def strings(p):return [''.join(x.itertext()) for x in E.fromstring(p['xl/sharedStrings.xml'])] if 'xl/sharedStrings.xml' in p else []
def value(c,ss):
    if c is None:return None
    if c.get('t')=='inlineStr':return ''.join(c.find(tag('is')).itertext())
    v=c.findtext(tag('v'))
    if c.get('t')=='s':return ss[int(v)]
    if c.get('t') in [None,'n']:
        try:return float(v) if '.' in v or 'e' in v.lower() else int(v)
        except (TypeError,AttributeError,ValueError):return v
    return v
def tree(p,n):return E.fromstring(p[f'xl/worksheets/sheet{n}.xml'])
def projection(path,out):
    p=load(path)
    for n in range(1,17):
        t=tree(p,n);sd=t.find(tag('sheetData'))
        for row in list(sd):
            if not ((n==10 and int(row.get('r')) in [1,66,118]) or (n==5 and int(row.get('r')) in [1,16252,16253,16254,16255,16256,16257,16258])):sd.remove(row)
        for c in t.findall('.//m:c[m:f]',NS):c.remove(c.find(tag('f')))
        for name in ['tableParts','drawing','legacyDrawing','conditionalFormatting','dataValidations','hyperlinks']:
            for x in t.findall('m:'+name,NS):t.remove(x)
        p[f'xl/worksheets/sheet{n}.xml']=xml(t)
        p.pop(f'xl/worksheets/_rels/sheet{n}.xml.rels',None)
    p={k:v for k,v in p.items() if not k.startswith(('xl/tables/','xl/drawings/')) and k!='xl/calcChain.xml'}
    save(p,out)

if sys.argv[1]=='prepare':
    d=json.loads((R/'training-planner/catalogue-history/6f245643cc5bf083.json').read_text());(P/'before.json').write_text(json.dumps(d))
    c=next(c for c in d['courses'] if c['id']=='TR-145')
    base='https://academy.claude.com/courses/ai-capabilities-and-limitations'
    # Each assessment is grounded in the public lesson text inspected on 31 October.
    decisions={
      'N2.1':(2,'next-token-prediction','Token generation and model training are explained. Provider, cost, speed and hosting comparisons remain missing.'),
      'N2.3':(1,'working-memory','Assistant use and multi-agent workflows are named. The four usage patterns are not systematically taught.'),
      'N2.5':(1,'knowledge','Retrieval, MCPs and external tools are named. Reusable Skills and APIs are not distinguished.'),
      'N3.1':(3,'next-token-prediction','Explains fabricated specifics and confidence. Learners check five facts independently and compare accuracy in their own domain.'),
      'N3.2':(3,'how-ai-gets-its-character','Explains training-induced agreement. Learners test an incorrect premise, invite disagreement and compare responses on their own task.'),
      'N3.3':(3,'working-memory','Explains finite context, truncation and lost middle information. Probes compare instruction placement and cross-session loss.'),
      'N3.4':(3,'next-token-prediction','The sampling probe repeats an identical facts request in a fresh conversation and compares changed answers.'),
      'N3.5':(0,'steerability','Instruction-following limitations do not establish prompt-injection teaching. No exercise on hostile instructions in read content is evidenced.'),
      'N3.6':(1,'next-steps','Calibrated trust is introduced. The human automation-bias mechanism is not explained in sufficient depth.'),
      'N3.7':(3,'next-token-prediction','Learners write independently checkable facts before prompting, verify returned specifics and repeat requests to sample output variability.'),
      'N6.1':(2,'knowledge','Learners judge task suitability and when to supply information or seek another source. Full human/AI division of work is not practised.'),
      'N6.2':(3,'working-memory','Before-and-after probes supply relevant information, prior examples and role constraints, define good output and compare results. Steering practice adds explicit goals.'),
      'N6.3':(3,'steerability','Exercises check output against goals, review dependent reasoning steps and test agreement behaviour. Failure Diagnosis evaluates the model diagnosis and tests corrections.'),
      'N6.6':(3,'working-memory','Teaches context limits, placement, chunking and fresh-session loss. Exercises practise context setup and compare sessions, with optional memory/project setup.'),
      'N6.8':(2,'intro-to-ai-capabilities-and-limitations','A personal task list is used throughout hands-on exercises and a weekly commitment. Daily bank practice under local rules is outside the course.'),
    }
    edits=[]
    def add(n,a,v):edits.append([n,a,v])
    sources=[base]+[base+'/'+x for x in dict.fromkeys(v[1] for v in decisions.values())]+[base+'/when-properties-collide']
    summary='Foundation AI literacy focused on model limitations, with L1 context, discernment and memory practice. 13 lessons, one quiz and a completion badge. No prerequisites. Public lessons cover model training, prediction, knowledge, context and instruction following, with exercises on personal work tasks. Companion to AI Fluency; either course may be taken first.'
    fit='31 Oct 2026: Foundation (N3), with L1 practice (N6); generic and transferable, not specialist cyber or Claude product training. Published learning estimate 3.5h. Public lessons/exercises inspected; not a completion claim. Prompt injection, bank rules and cyber threats still need other teaching. Exceeds the 2h Foundation course budget. Supersedes the historical V8 audit for this course.'
    for cc,v in {'G':'3.5h','N':'Base','R':'Reviewed 31 October 2026. Foundation / N3 primary; L1 / N6 secondary. Public lessons and exercises now available.','S':base,'T':'Public lessons and exercises','U':summary,'V':'V12 review: N2 19% Weak; N3 76% Partial (prompt-injection core gap); N6 54% Partial. Current results: Coverage sheet.','X':fit,'Y':'\n'.join(sources)}.items():add(10,f'{cc}118',v)
    serial=(date(2026,10,31)-date(1899,12,30)).days
    records=[]
    for q,old in c['scores'].items():
        score,slug,evidence=decisions.get(q,(0,'','No explicit teaching of this outcome was found in the reviewed public course and lesson text. This is an evidence limit, not a claim about inaccessible media.'))
        url=base+('/'+slug if slug else '')
        evidence='31 October 2026 public-lesson review: '+evidence
        rn=old['source']['row']
        for cc,v in {'F':score,'G':evidence,'H':'AI public-lesson review v12','I':serial,'O':url,'P':f'V12 TR-145 review; prior v11 score: {old["score"]}'}.items():add(5,f'{cc}{rn}',v)
        records.append(dict(requirement=q,priorScore=old['score'],score=score,evidence=evidence,sourceUrl=url))
    add(1,'A1','AI-era cyber training catalogue — v12')
    # Existing README rows preserve the historical v11 decision log.
    add(10,'O118','N2; N3; N6')
    (P/'edits.json').write_text(json.dumps(edits,ensure_ascii=False))
    (P/'assessment.json').write_text(json.dumps(dict(courseId='TR-145',reviewDate='2026-10-31',durationHours=3.5,primaryCategory='Foundation — AI limitations (N3)',secondaryCategory='L1 — working with AI (N6)',sources=sources,decisions=records),indent=2))
    c=next(c for c in d['courses'] if c['id']=='TR-089')
    base='https://academy.claude.com/courses/ai-fluency-framework-foundations'
    decisions={
      'N2.1':(1,'generative-ai-fundamentals','Introduces models and training. Provider, cost, speed, reasoning and hosting trade-offs are not taught.'),
      'N2.2':(1,'capabilities-limitations','Names text, images and code. Does not cover the complete modality range.'),
      'N2.3':(2,'the-4d-framework','Explains automation, augmentation and agency, with applied scenarios. Does not teach the complete four-pattern model including agent teams.'),
      'N2.5':(1,'capabilities-limitations','External-tool connection is named. MCP, reusable Skills and APIs are not distinguished.'),
      'N2.7':(1,'a-closer-look-at-delegation','Introduces platform awareness. Bank-approved versus public deployment and data flows are not taught.'),
      'N3.1':(2,'capabilities-limitations','Explains hallucinations and knowledge limits. Expert Discernment checks factual errors, but dedicated confident-error recognition in the learner tool is not fully established.'),
      'N3.3':(1,'capabilities-limitations','Introduces context-window constraints. Long-session loss and recovery are not taught in depth.'),
      'N3.6':(1,'a-closer-look-at-discernment','Emphasises human judgement and oversight. The human automation-bias mechanism is not taught explicitly.'),
      'N3.7':(2,'the-description-discernment-loop','Teaches iterative output checking and corrective feedback. Independent-first judgement, external-source checking and repeated-input sampling are not all established.'),
      'N4.1':(1,'a-closer-look-at-diligence','The learner reflects on data shared with AI. Bank data exits and public-tool flows are not explained.'),
      'N4.2':(1,'a-closer-look-at-diligence','The learner considers privacy and security in data and system choices. Confidential client-data handling is not taught in depth.'),
      'N6.1':(3,'project-planning-and-delegation','Learners define success, break down a project and assign work between humans and AI, then retain the delegation plan for implementation.'),
      'N6.2':(3,'effective-prompting-techniques','Explicitly teaches context, examples and constraints. Bad Prompt Makeover and the continuing project practise clearer instructions and feedback.'),
      'N6.3':(3,'a-closer-look-at-discernment','The expert-domain exercise evaluates output accuracy, reasoning and interaction behaviour, then practises feedback and revision.'),
      'N6.4':(3,'a-closer-look-at-diligence','Learners draft and attach a project diligence statement documenting AI contribution, verification and human responsibility.'),
      'N6.5':(1,'a-closer-look-at-delegation','Platform awareness introduces selecting suitable systems. Model and effort-level selection is not practised.'),
      'N6.6':(1,'generative-ai-fundamentals','Context windows are introduced. Practical long-session and persistent-memory management are not taught.'),
      'N6.8':(2,'the-description-discernment-loop','The continuing project practises AI-assisted work; Additional Activities proposes a personal practice plan. Daily bank work within local rules remains outside the course.'),
    }
    sources=[base]+[base+'/'+x for x in dict.fromkeys(v[1] for v in decisions.values())]+[base+'/a-closer-look-at-description',base+'/additional-activities']
    summary='L1 AI-assisted work through Delegation, Description, Discernment and Diligence. 14 lessons, one quiz and a completion badge; published learning estimate 4h. Public lessons include task-allocation exercises, prompt improvement, expert-domain output review and a continuing project with a diligence statement. Generic and transferable, with supporting Foundation concepts.'
    fit='31 Oct 2026: L1 / N6 primary, Foundation support secondary. The four core N6 outcomes have explicit teaching and practice; the rubric does not require graded labs. Does not complete bank platform/data rules, model/effort choice or memory management. Public lessons reviewed, not a course-completion claim. Supersedes the historical V8 audit for this course.'
    for cc,v in {'G':'4h','H':'Free (completion badge)','N':'Entry','O':'All 23 needs assessed; evidenced: N2, N3, N4, N6','R':'Reviewed 31 October 2026. L1 / N6 primary; Foundation support secondary. Exercises satisfy the practice criterion without requiring grading.','S':base,'T':'Public lessons and exercises','U':summary,'V':'V12 review: N2 29% Weak; N3 29% Weak; N4 11% Weak; N6 67% Partial. Current results: Coverage sheet.','X':fit,'Y':'\n'.join(sources)}.items():add(10,f'{cc}66',v)
    records=[]
    for q,old in c['scores'].items():
        score,slug,evidence=decisions.get(q,(0,'','No explicit teaching of this outcome was found in the reviewed public course and lesson text. This is an evidence limit, not a claim about inaccessible media.'))
        url=base+('/'+slug if slug else '');evidence='31 October 2026 public-lesson review: '+evidence;rn=old['source']['row']
        for cc,v in {'F':score,'G':evidence,'H':'AI public-lesson review v12','I':serial,'O':url,'P':f'V12 TR-089 review; prior v11 score: {old["score"]}'}.items():add(5,f'{cc}{rn}',v)
        records.append(dict(requirement=q,priorScore=old['score'],score=score,evidence=evidence,sourceUrl=url))
    (P/'assessment-fluency.json').write_text(json.dumps(dict(courseId='TR-089',reviewDate='2026-10-31',durationHours=4,primaryCategory='L1 — working with AI (N6)',secondaryCategory='Foundation support',sources=sources,decisions=records),indent=2))
    (P/'edits.json').write_text(json.dumps(edits,ensure_ascii=False))
    projection(SRC,P/'before-view.xlsx')
    print('Prepared',len(edits),'cell edits and',len(records),'outcome decisions')
elif sys.argv[1]=='apply':
    p=load(SRC);a=load(P/'authored.xlsx');ss=strings(a)
    authored=[]
    for row in tree(a,1).find(tag('sheetData')):
        if row.get('r')=='1':continue
        cs={re.sub(r'\d','',c.get('r')):value(c,ss) for c in row};authored.append([int(cs['A']),cs['B'],cs.get('C')])
    assert authored==json.loads((P/'edits.json').read_text())
    for n in set(e[0] for e in authored):
        t=tree(p,n)
        for sn,addr,v in authored:
            if sn==n:put(t,addr,v)
        if n==10:
            for rn,slug in [(118,'ai-capabilities-and-limitations'),(66,'ai-fluency-framework-foundations')]:
                row=t.find(f'm:sheetData/m:row[@r="{rn}"]',NS)
                row.set('ht','300');row.set('customHeight','true')
                link=t.find(f'm:hyperlinks/m:hyperlink[@ref="S{rn}"]',NS)
                link.set('display','https://academy.claude.com/courses/'+slug)
        p[f'xl/worksheets/sheet{n}.xml']=xml(t)
    relpath='xl/worksheets/_rels/sheet10.xml.rels';rels=E.fromstring(p[relpath])
    offerTree=tree(p,10)
    linkTargets={offerTree.find(f'm:hyperlinks/m:hyperlink[@ref="S{rn}"]',NS).get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'):'https://academy.claude.com/courses/'+slug for rn,slug in [(66,'ai-fluency-framework-foundations'),(118,'ai-capabilities-and-limitations')]}
    for rel in rels:
        if rel.get('Id') in linkTargets:rel.set('Target',linkTargets[rel.get('Id')])
    p[relpath]=xml(rels)
    save(p,DST)
    (P/'recalc-in').mkdir(exist_ok=True);(P/'recalc-out').mkdir(exist_ok=True)
    # Recalculate the full affected dependency closure in a disposable copy.
    # Scores lookup columns depend only on unchanged titles/rubric fields.
    # Only these two courses' Coverage rows depend on changed score inputs.
    # README, Needs, Rubric and Paths summaries remain live in the projection.
    calcCells={};ss=strings(p)
    coverageRows={int(row.get('r')) for row in tree(p,6).find(tag('sheetData')) if value(row.find('m:c[@r="A'+row.get('r')+'"]',NS),ss) in ['TR-089','TR-145']}
    for n in range(1,17):
        t=tree(p,n)
        for c in t.findall('.//m:c[m:f]',NS):
            rn=int(re.search(r'\d+',c.get('r'))[0])
            live=n in [1,3,4,7,8] or (n==6 and rn in coverageRows)
            if live:
                calcCells.setdefault(str(n),[]).append(c.get('r'))
                for x in list(c):
                    if x.tag in [tag('v'),tag('is')]:c.remove(x)
            else:c.remove(c.find(tag('f')))
        p[f'xl/worksheets/sheet{n}.xml']=xml(t)
    # Prevent calculated table columns from recreating materialized formulas.
    for name,raw in list(p.items()):
        if not name.startswith('xl/tables/'):continue
        t=E.fromstring(raw)
        for col in t.findall('m:tableColumns/m:tableColumn',NS):
            for f in col.findall('m:calculatedColumnFormula',NS):col.remove(f)
        p[name]=xml(t)
    p.pop('xl/calcChain.xml',None)
    (P/'calculation-cells.json').write_text(json.dumps(calcCells))
    save(p,P/'recalc-in'/DST.name)
    print('Applied artifact-authored values; prepared uncached calculation copy')
elif sys.argv[1]=='cache':
    p=load(DST);calc=load(P/'recalc-out'/DST.name);ss=strings(calc);count=0;errors=[];calcCells=json.loads((P/'calculation-cells.json').read_text())
    for n in range(1,17):
        t=tree(p,n);cells={c.get('r'):c for c in tree(calc,n).findall('.//m:c',NS)};live=set(calcCells.get(str(n),[]))
        for c in t.findall('.//m:c[m:f]',NS):
            if c.get('r') not in live:continue
            out=cells.get(c.get('r'));v=value(out,ss)
            if out is not None and out.get('t')=='e':errors.append([n,c.get('r'),v])
            setcache(c,v);count+=1
        if n==5:
            changed={int(re.search(r'\d+',addr)[0]) for sn,addr,v in json.loads((P/'edits.json').read_text()) if sn==5}
            for row in t.find(tag('sheetData')):
                if int(row.get('r')) in changed:row.set('ht','84');row.set('customHeight','true')
        p[f'xl/worksheets/sheet{n}.xml']=xml(t)
    assert not errors,errors[:10]
    save(p,DST);projection(DST,P/'after-view.xlsx')
    (P/'recalculation.json').write_text(json.dumps(dict(engine='LibreOffice recalculation of affected dependency closure; unchanged lookup caches retained, native formulas and other workbook features preserved',formulaCount=count,errors=errors)))
    print(count,'formula caches refreshed')
