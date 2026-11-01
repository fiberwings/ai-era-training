"""Prepare and assemble an artifact-authored, feature-preserving catalogue update."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
from datetime import date
from collections import defaultdict, Counter
import json, csv, copy, re, sys, hashlib

ROOT=Path(__file__).resolve().parents[3]
P=Path(__file__).resolve().parent
W=ROOT/'.work/catalogue/v13'
SRC=ROOT/'catalogue/AI_Era_Cyber_Training_Catalogue_v12.xlsx'
if not SRC.exists(): SRC=ROOT/'archive/catalogues/AI_Era_Cyber_Training_Catalogue_v12.xlsx'
DST=ROOT/'catalogue/AI_Era_Cyber_Training_Catalogue_v13.xlsx'
NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
T=lambda n:'{'+NS['m']+'}'+n
def load(path):
    with ZipFile(path) as z:return {n:z.read(n) for n in z.namelist()}
def save(parts,path):
    with ZipFile(path,'w',ZIP_DEFLATED) as z:
        for n,v in parts.items():z.writestr(n,v)
def xml(t):return E.tostring(t,xml_declaration=True,encoding='UTF-8',standalone=True)
def tree(parts,n):return E.fromstring(parts[f'xl/worksheets/sheet{n}.xml'])
def strings(parts):return [''.join(x.itertext()) for x in E.fromstring(parts['xl/sharedStrings.xml'])] if 'xl/sharedStrings.xml' in parts else []
def value(c,ss):
    if c is None:return None
    if c.get('t')=='inlineStr':return ''.join(c.find(T('is')).itertext())
    v=c.findtext(T('v'))
    if c.get('t')=='s':return ss[int(v)]
    if v is None:return None
    if c.get('t') in (None,'n'):
        try:return float(v) if any(k in v.lower() for k in '.e') else int(v)
        except ValueError:return v
    return v
def cells(t):return {c.get('r'):c for c in t.findall('.//m:sheetData/m:row/m:c',NS)}
def put(t,addr,v,cache=False):
    rn=int(re.search(r'\d+',addr)[0]);sd=t.find(T('sheetData'));row=sd.find(f'm:row[@r="{rn}"]',NS)
    if row is None:row=E.SubElement(sd,T('row'),r=str(rn))
    c=row.find(f'm:c[@r="{addr}"]',NS)
    if c is None:c=E.SubElement(row,T('c'),r=addr)
    for x in list(c):
        if not(cache and x.tag==T('f')):c.remove(x)
    c.attrib.pop('t',None)
    if v is None:return
    if isinstance(v,(int,float)):
        E.SubElement(c,T('v')).text=str(v)
    elif cache:
        c.set('t','str');E.SubElement(c,T('v')).text=str(v)
    else:
        c.set('t','inlineStr');s=E.SubElement(c,T('is'));E.SubElement(s,T('t')).text=str(v)
def clone_row(t,old,new):
    sd=t.find(T('sheetData'));row=copy.deepcopy(sd.find(f'm:row[@r="{old}"]',NS));row.set('r',str(new))
    for c in row:c.set('r',re.sub(r'\d+',str(new),c.get('r')))
    sd.append(row);return row
def extend(parts,sn,table,end):
    tp=f'xl/tables/table{table}.xml';t=E.fromstring(parts[tp]);old=t.get('ref');new=re.sub(r'\d+$',str(end),old);t.set('ref',new)
    af=t.find(T('autoFilter'))
    if af is not None:af.set('ref',new)
    parts[tp]=xml(t)
    t=tree(parts,sn);t.find(T('dimension')).set('ref',new)
    oldend=int(re.search(r'\d+$',old)[0])
    for x in t.findall('m:conditionalFormatting',NS)+t.findall('m:dataValidations/m:dataValidation',NS):
        if x.get('sqref'):x.set('sqref',re.sub(rf'(?<=[A-Z]){oldend}(?=\s|$)',str(end),x.get('sqref')))
    parts[f'xl/worksheets/sheet{sn}.xml']=xml(t)
def projection(parts,path,after=False):
    parts=parts.copy()
    for sn in range(1,17):
        t=tree(parts,sn);sd=t.find(T('sheetData'))
        for row in list(sd):
            if not(sn==10 and int(row.get('r')) in [1,15,16,24,413]):sd.remove(row)
        for c in t.findall('.//m:c[m:f]',NS):c.remove(c.find(T('f')))
        for name in ['tableParts','drawing','legacyDrawing','conditionalFormatting','dataValidations','hyperlinks']:
            for x in t.findall('m:'+name,NS):t.remove(x)
        parts[f'xl/worksheets/sheet{sn}.xml']=xml(t);parts.pop(f'xl/worksheets/_rels/sheet{sn}.xml.rels',None)
    parts={k:v for k,v in parts.items() if not k.startswith(('xl/tables/','xl/drawings/')) and k!='xl/calcChain.xml'}
    save(parts,path)

def prepare():
    cat=json.loads((ROOT/'training-planner/catalogue-history/6db669ed065cab54.json').read_text())
    assert hashlib.sha256(SRC.read_bytes()).hexdigest()==cat['sourceSha256']
    (W/'baseline.json').write_text(json.dumps(cat))
    req=cat['requirements'];byid={c['id']:c for c in cat['courses']}
    srcs=json.loads((ROOT/'analysis/secai-isc2-framework-review/inputs/sources.json').read_text())
    (P/'sources.json').write_text(json.dumps(srcs,indent=2)+'\n');urls={s['id']:s['url'] for s in srcs['sources']}
    audit=list(csv.DictReader((ROOT/'analysis/secai-isc2-framework-review/outputs/outcome-assessment.csv').open()))
    ds={}
    for cid,key in [('TR-014','ISC2'),('TR-280','SecAI')]:
        ds[cid]={r['id']:{'score':int(r[f'{key}_score']),'evidence':r[f'{key}_decision'],'sources':list(dict.fromkeys(urls[s.split(':')[0]] for s in re.split(r',(?=[IS]\d)',r[f'{key}_sources'])))} for r in audit}
    standalone={
      'N1.1':(2,'Explicit cybersecurity applications; breadth across all neighbouring domains is incomplete.'),
      'N5.4':(2,'Attack and mitigation outcomes with case-study activities; bank-specific AI examples are not established.'),
      'N5.6':(1,'Attack recognition is an explicit outcome; domain-specific examples and depth are not published.'),
      'N5.8':(1,'AI attacks and mitigations are named; the six required risk families and precautions are not enumerated.'),
      'N6.8':(1,'Operational applications are introduced; daily own-work practice under bank rules is not established.'),
      'N12.8':(1,'Basic mitigations are introduced; remediation from specialist findings and retesting are not specified.')}
    ds['TR-015']={r['id']:{'score':standalone.get(r['id'],(0,''))[0], 'evidence':standalone.get(r['id'],(0,'No specific teaching of this outcome is evidenced in the reviewed public course details and learning outcomes.'))[1], 'sources':[urls['I1']]} for r in req}
    ds['TR-023']={'N5.8':{'score':0,'evidence':'Exam-only record: published assessment objectives do not supply teaching. Corrects the stray v11 positive score; use separately assessed preparation training TR-280 or TR-155.','sources':[urls['S0']]}}
    parts=load(SRC);edits=[];serial=(date(2026,11,1)-date(1899,12,30)).days
    def add(sn,a,v):edits.append([sn,a,v])
    newtitle='CertMaster Perform for CompTIA SecAI+ (CY0-001)'
    for cid,dec in ds.items():
        for i,r in enumerate(req):
            rid=r['id']
            if rid not in dec:continue
            d=dec[rid];old=byid.get(cid,{}).get('scores',{}).get(rid)
            rn=57953+i if cid=='TR-280' else old['source']['row']
            if cid=='TR-280':
                add(5,f'A{rn}',cid);add(5,f'C{rn}',rid);add(5,f'M{rn}','Assessed');add(5,f'N{rn}',None)
            evidence='1 Nov 2026 public-syllabus review. '+d['evidence']
            if cid=='TR-280':evidence+=' Official product/objective alignment, corroborated by authorized-course outlines. Exact self-paced labs unverified; no full practical credit inferred.'
            vals={'F':d['score'],'G':evidence,'H':'AI public-syllabus review v13','I':serial,'O':'\n'.join(d['sources']),'P':f'V13 reassessment; prior v12 score: {old["score"]}' if old else 'V13 new training record; distinct from exam-only TR-023 and Pluralsight TR-155.'}
            for col,v in vals.items():add(5,f'{col}{rn}',v)
            d.update(row=rn,priorScore=old['score'] if old else None,evidence=evidence)
    metadata={
      15:{'H':'640 regular; 512 ISC2 members (USD, before tax)','K':'Human oversight and overconfidence taught; complete agent supervision not evidenced.','R':'V13 review, 1 Nov 2026: all six included course pages and their learning outcomes/activities reviewed. 60-day access; course certificate, not a separate professional certification.','T':'Detailed public course synopses','U':'Six-course, 16h bundle: AI for Cybersecurity (3h), Managing Overconfidence (3h), Global AI Regulations (2h), Foundations of AI (4h), Secure by Design AI (2h), Evolving Cybersecurity Workforce (2h). Video/text, activities and assessments; four course pages explicitly describe case studies. Teaching covers AI use, automation bias, critical judgement, secure lifecycle, framework alignment, accountability and workforce adaptation.','V':'V13 all-framework review: 13.6%; Foundation 32.9%; N1 66.7%, N6 33.3%, N14 38.1%. Coverage sheet retains stated historical target scopes.','X':'V13 supersedes old description-only limitations. All 140 outcomes reviewed. 0 means no specific public evidence; activities without details do not establish full practical skill. Bank policy, regional obligations and agent workflows need supplementation. Includes TR-015: do not duplicate time or credit. Prior reviews remain in archived v12 and V8 audit.','Y':'\n'.join(urls[k] for k in ['I0','I1','I2','I3','I4','I5','I6'])},
      16:{'R':'V13 review, 1 Nov 2026: Product Details, Key Topics, Learning Outcomes, Learning Experience and completion conditions reviewed. Included in TR-014.','T':'Detailed public course synopsis','U':'3h foundational course on AI cybersecurity applications, lifecycle, attacks, basic mitigations and threat tools. Public page lists three learning outcomes, video/text, case-study activities and an assessment. No prerequisites; 3 CPEs and validation of completion, with 60-day access. Detailed attack taxonomy and case exercises are not published.','V':'V13 reviewed across all 140 outcomes; strongest contribution N1/N5 awareness. Current target-scope results: Coverage sheet.','X':'V13 supersedes the earlier claim that no objectives or exercises are published. Specific course-level outcomes and case-study format support partial teaching; full practical outcomes and bank-specific examples remain unverified. No independent skill credit inferred from the assessment alone. Included in TR-014; do not double count.','Y':urls['I1']+'\n'+urls['I0']},
      24:{'H':'298 exam only (USD, before tax)','J':'No','K':'Exam only; teaching assessed separately.','R':'V13, 1 Nov 2026: exam-only teaching correction. Official preparation is a separate offer, TR-280; TR-155 is a separate Pluralsight path.','T':'Exam objectives only','V':'V13: zero taught coverage on all 140 outcomes. Exam scope is not teaching.','X':'Exam-only record with optional preparation purchased separately. All teaching scores are zero, including corrected N5.8. The assessment scope remains described in the content summary. See TR-280 for official CertMaster Perform training; do not transfer its scores into this exam or TR-155.','Y':urls['S0']+'\n'+urls['S1']},
      413:{'A':'TR-280','B':'CompTIA','C':newtitle,'D':'Course with labs','E':'Vendor-neutral curriculum; provider lab environments','F':'Self-paced online','G':'30–60h','H':'508 training; 628 complete bundle incl. exam and retake (USD, before tax)','I':'SecAI+ launched 17 Feb 2026; reviewed 1 Nov 2026','J':'Partial','K':'Monitoring, permissions and human oversight touched; full agent supervisory workflow missing.','L':'N','M':'V','N':'Practitioner','P':'—','Q':'Assessed','R':'New official-training record, separate from TR-023 exam and TR-155 Pluralsight path. Recommended 3–4 years IT/about 2 years cyber experience; 12 months access. Public-syllabus assessment; exact self-paced lab catalogue unverified.','S':urls['S0'],'T':'Official product/objectives + corroborating teaching outlines','U':'CertMaster Perform for CY0-001: instruction, videos, assessments and simulated/live labs. Four exam domains cover AI concepts, securing AI, AI-assisted security and GRC. Detailed authorized-course outlines corroborate six teaching modules, including prompting/data handling, controls/monitoring, attack analysis, automation and governance activities. Course-specific activity equivalence is not assumed.','V':'V13 all-framework review: 32.3%; Foundation 55.1%; N5 71.4%, N4 61.9%, N13 55.6%, N12 51.9%. Coverage sheet retains explicit target-level scopes.','W':0,'X':'Provisional fine-grained public-syllabus assessment. Official training is aligned to CY0-001, with detailed topic/practice corroboration from authorized-course providers. Partner labs are not guaranteed identical in self-paced Perform; no practical outcome gets 3. Bank rules, full agent supervision, Skills and evaluation need additional assessed learning. Full 30–60h course time applies; planner uses 60h.','Y':'\n'.join(urls[k] for k in ['S0','S1','S2','S3','S4'])}}
    for cid,rn in [('TR-014',15),('TR-015',16),('TR-280',413)]:
        positive=[n['id'] for n in cat['needs'] if any(ds[cid][r['id']]['score']>0 for r in req if r['need']==n['id'])]
        metadata[rn]['O']='All 23 needs assessed; evidenced: '+', '.join(positive)
    metadata[24]['O']='All 140 outcomes assessed: exam-only, no taught coverage'
    for rn,vals in metadata.items():
        for col,v in vals.items():add(10,f'{col}{rn}',v)
    add(1,'A1','AI-era cyber training catalogue — v13')
    add(1,'A8','Scores — 412 Offers × 140 active outcomes, plus preserved retired N5.2 evidence. Blank scores remain explicitly unassessed. V13 reviews ISC2 and official SecAI+ training.')
    readme=tree(parts,1);last=max(int(r.get('r')) for r in readme.find(T('sheetData')))
    notes=['Changes in v13 — 1 November 2026','ISC2 TR-014 and included course TR-015 reassessed against all 140 outcomes using detailed public pages. Official CompTIA CertMaster Perform added as TR-280 with explicit delivery-evidence limits. TR-023 exam-only N5.8 corrected to zero. Pluralsight TR-155 unchanged.','Scope: 412 Offers + 117 Tool track entries = 529 resources. 140 active outcomes, 23 needs, 57,400 active numeric scores and 280 unassessed active rows. Reviewer decisions and retained programme selections preserved.','Coverage measures published teaching, not competence. Exact self-paced SecAI+ labs were not inspected; no full practical credit inferred. Old workbooks and research baseline remain available for traceability.']
    for i,note in enumerate(notes):add(1,f'A{last+2+i}',note)
    (P/'assessment.json').write_text(json.dumps({'date':'2026-11-01','baseline':cat['version'],'decisions':ds,'unchanged':'TR-155: different provider/course; no score transfer.'},indent=2)+'\n')
    (P/'edits.json').write_text(json.dumps(edits,ensure_ascii=False)+'\n')
    projection(parts,W/'before-view.xlsx')
    print('Prepared',len(edits),'typed cell edits; new stable ID TR-280.')

def apply():
    parts=load(SRC);a=load(W/'authored.xlsx');ss=strings(a);authored=[]
    for row in tree(a,1).find(T('sheetData')):
        if row.get('r')=='1':continue
        cs={re.sub(r'\d','',c.get('r')):value(c,ss) for c in row};authored.append([int(cs['A']),cs['B'],cs.get('C')])
    assert authored==json.loads((P/'edits.json').read_text())
    ts={sn:tree(parts,sn) for sn in [1,5,6,10]}
    clone_row(ts[10],412,413)
    for rn in range(57953,58093):clone_row(ts[5],57952,rn)
    cat=json.loads((W/'baseline.json').read_text());ds=json.loads((P/'assessment.json').read_text())['decisions'];req=cat['requirements']
    for i,n in enumerate(cat['needs']):
        rn=9455+i;clone_row(ts[6],9454,rn)
        ranks=[r['rank'] for r in req if r['need']==n['id']]
        high=[r['rank'] for r in req if r['need']==n['id'] and ds['TR-280'][r['id']]['score']>=2]
        rank=max([2,min(ranks)]+high)
        for col,v in {'A':'TR-280','C':n['id'],'E':['Base','Entry','Practitioner','Expert'][rank],'N':'All 140 outcomes reviewed; this row uses the stated historical rank scope. Public teaching assessment; exact self-paced labs unverified.'}.items():put(ts[6],f'{col}{rn}',v)
    for sn,addr,v in authored:put(ts[sn],addr,v)
    for rn,height in [(15,150),(16,90),(24,150),(413,110)]:
        row=ts[10].find(f'm:sheetData/m:row[@r="{rn}"]',NS);row.set('ht',str(height));row.set('customHeight','true')
    for rn in {int(re.search(r'\d+',a)[0]) for sn,a,v in authored if sn==5}:
        row=ts[5].find(f'm:sheetData/m:row[@r="{rn}"]',NS);row.set('ht','110');row.set('customHeight','true')
    for sn,t in ts.items():parts[f'xl/worksheets/sheet{sn}.xml']=xml(t)
    extend(parts,10,5,413);extend(parts,5,8,58092);extend(parts,6,2,9477)
    # Preserve native features; only changed-value rows and appended table rows are assembled.
    save(parts,W/'uncached.xlsx')
    # Calculation copy retains all data and native affected formulas; unrelated formulas use existing caches.
    ss=strings(parts);covrows=set()
    for row in tree(parts,6).find(T('sheetData')):
        rn=row.get('r')
        if value(row.find(f'm:c[@r="A{rn}"]',NS),ss) in ds:covrows.add(int(rn))
    live={}
    for sn in range(1,17):
        t=tree(parts,sn)
        for c in t.findall('.//m:c[m:f]',NS):
            rn=int(re.search(r'\d+',c.get('r'))[0]);col=re.sub(r'\d','',c.get('r'))
            keep=(sn in [1,3,4]) or (sn==6 and rn in covrows) or (sn==5 and rn>=57953)
            if keep:
                live.setdefault(str(sn),[]).append(c.get('r'))
                for child in list(c):
                    if child.tag in [T('v'),T('is')]:c.remove(child)
            else:c.remove(c.find(T('f')))
        # Evidence prose and unrelated detail cells do not feed any live formula.
        # Omit them only from this disposable calculation copy, never the deliverable.
        if sn==5:
            for row in t.find(T('sheetData')):
                rn=int(row.get('r'))
                if rn==1:continue
                keepcols={'A','C','D','F','J','K','L'} | ({'B','E'} if rn>=57953 else set())
                for c in list(row):
                    if re.sub(r'\d','',c.get('r')) not in keepcols:row.remove(c)
        if sn==8:
            for row in list(t.find(T('sheetData'))):t.find(T('sheetData')).remove(row)
        parts[f'xl/worksheets/sheet{sn}.xml']=xml(t)
    for k in list(parts):
        if k.startswith('xl/tables/'):
            t=E.fromstring(parts[k])
            for f in t.findall('m:tableColumns/m:tableColumn/m:calculatedColumnFormula',NS):f.getparent().remove(f)
            parts[k]=xml(t)
    parts.pop('xl/calcChain.xml',None)
    (P/'calculation-cells.json').write_text(json.dumps(live)+'\n');save(parts,W/'calculation.xlsx')
    print('Prepared calculation copy with',sum(map(len,live.values())),'live affected formulas.')

def cache():
    parts=load(W/'uncached.xlsx');live=json.loads((P/'calculation-cells.json').read_text());errors=[]
    results={(str(sn),addr):v for sn,addr,v in json.loads((W/'calculated-caches.json').read_text())}
    for sn,addresses in live.items():
        t=tree(parts,int(sn))
        for addr in addresses:
            v=results[(sn,addr)]
            if v is None or str(v).startswith('#'):errors.append([sn,addr,v])
            put(t,addr,v,True)
        parts[f'xl/worksheets/sheet{sn}.xml']=xml(t)
    if errors:
        (W/'errors.json').write_text(json.dumps(errors,indent=2));raise ValueError(str(errors[:15]))
    # Full-or-Strong metadata follows the newly calculated scoped Coverage rows.
    st=strings(parts);counts=Counter()
    for row in tree(parts,6).find(T('sheetData')):
        rn=row.get('r');oid=value(row.find(f'm:c[@r="A{rn}"]',NS),st);band=value(row.find(f'm:c[@r="M{rn}"]',NS),st)
        if band in ['Full','Strong']:counts[oid]+=1
    t=tree(parts,10)
    for rn,cid in [(15,'TR-014'),(16,'TR-015'),(24,'TR-023'),(413,'TR-280')]:put(t,f'W{rn}',counts[cid])
    for rn,height in [(15,150),(16,90),(24,150),(413,110)]:t.find(f'm:sheetData/m:row[@r="{rn}"]',NS).set('ht',str(height))
    parts['xl/worksheets/sheet10.xml']=xml(t)
    # Match the existing README's merged explanatory rows for the release note.
    t=tree(parts,1);sd=t.find(T('sheetData'));template=sd.find('m:row[@r="108"]',NS)
    merges=t.find(T('mergeCells'))
    for rn in [110,111,112,113]:
        row=sd.find(f'm:row[@r="{rn}"]',NS)
        row.set('ht','80' if rn!=110 else '24');row.set('customHeight','true')
        row.find(f'm:c[@r="A{rn}"]',NS).set('s',template.find('m:c[@r="A108"]',NS).get('s'))
        E.SubElement(merges,T('mergeCell'),ref=f'A{rn}:D{rn}')
    merges.set('count',str(len(merges)));t.find(T('dimension')).set('ref','A1:D113')
    parts['xl/worksheets/sheet1.xml']=xml(t)
    # Add the new offer's clickable URL using the existing hyperlink convention.
    relns='http://schemas.openxmlformats.org/package/2006/relationships'
    ridns='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    relpath='xl/worksheets/_rels/sheet10.xml.rels';rels=E.fromstring(parts[relpath])
    rid='rIdV13SecAITraining';url='https://www.comptia.org/en-us/certifications/secai/'
    E.SubElement(rels,'{'+relns+'}Relationship',Id=rid,Type=ridns+'/hyperlink',Target=url,TargetMode='External')
    parts[relpath]=xml(rels);t=tree(parts,10)
    E.SubElement(t.find(T('hyperlinks')),T('hyperlink'),ref='S413',display=url,attrib={'{'+ridns+'}id':rid})
    parts['xl/worksheets/sheet10.xml']=xml(t)
    save(parts,DST);projection(parts,W/'after-view.xlsx',True)
    (P/'recalculation.json').write_text(json.dumps({'engine':'Artifact Tool compact dependency model of affected coverage and summary results, with unchanged-catalogue aggregates as input controls; original native formulas/features preserved in output','formulas':sum(map(len,live.values())),'errors':errors,'nativeExcel':'Not available on this host; independently reconcile all saved Coverage results with catalogue importer.'},indent=2)+'\n')
    print('Saved',DST)

if __name__=='__main__':globals()[sys.argv[1]]()
