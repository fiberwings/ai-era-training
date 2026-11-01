"""Native workbook preservation around artifact-tool-authored cell edits.
Full-file artifact imports previously exhausted 4/12GB. Author bounded edits
with artifact-tool, transplant their typed values, recalculate with LibreOffice,
and transplant only calculated caches back to preserve native Excel features.
"""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
import sys,json,re,copy,hashlib,math
P=Path(__file__).resolve().parent;R=P.parent
sys.path.insert(0,str(R/'.catalogue-v8'))
from workbook_xml import tag,NS,xml,valcell,put,col
SRC=P/'before.xlsx'; DST=R/'AI_Era_Cyber_Training_Catalogue_v11.xlsx'
def load(path):
    with ZipFile(path) as z:return {n:z.read(n) for n in z.namelist()}
def save(parts,path):
    with ZipFile(path,'w',ZIP_DEFLATED) as z:
        for n,b in parts.items():z.writestr(n,b)
def strings(p):return [''.join(x.itertext()) for x in E.fromstring(p['xl/sharedStrings.xml'])] if 'xl/sharedStrings.xml' in p else []
def value(c,ss):
    if c is None:return None
    if c.get('t')=='inlineStr':return ''.join(c.find(tag('is')).itertext())
    v=c.findtext(tag('v'))
    if c.get('t')=='s':return ss[int(v)]
    if c.get('t') in [None,'n']:
        try:return float(v) if '.' in v or 'e' in v.lower() else int(v)
        except (TypeError,ValueError,AttributeError):return v
    return v
def tree(p,n):return E.fromstring(p[f'xl/worksheets/sheet{n}.xml'])
def projection(src,dest):
    p=load(src)
    for n in range(1,17):
        t=tree(p,n)
        if n not in [3,4]:
            t=E.Element(tag('worksheet'),nsmap={None:NS['m']});E.SubElement(t,tag('sheetData'))
        else:
            for c in t.findall('.//m:c[m:f]',NS):c.remove(c.find(tag('f')))
            for e in t.findall('m:tableParts',NS):t.remove(e)
        p[f'xl/worksheets/sheet{n}.xml']=xml(t)
        p.pop(f'xl/worksheets/_rels/sheet{n}.xml.rels',None)
    p={k:v for k,v in p.items() if not k.startswith('xl/tables/') and not k.startswith('xl/drawings/') and k!='xl/calcChain.xml'}
    save(p,dest)
mode=sys.argv[1]
if mode=='prepare':
    p=load(SRC);ss=strings(p);d=json.loads((P/'before.json').read_text());changes=json.loads((P/'requirements.json').read_text());req={q['id']:q for q in changes['requirements']}; edits=[]
    def add(n,addr,v):edits.append([n,addr,v])
    rubric=tree(p,4); notes=changes['notes']; serial=46313
    for old in d['requirements']:
        q=old['id'];rn=old['source']['row']
        if q=='N5.2':add(4,f'I{rn}','Retired');add(4,f'E{rn}',None)
        else:
            new=req[q]
            for field,cc in [('title','F'),('description','G'),('core','E')]:
                if new[field]!=old[field]:add(4,f'{cc}{rn}',('Yes' if new[field] else None) if field=='core' else new[field])
        if q in notes:add(4,f'H{rn}',notes[q])
        if q in notes or q in ['N5.1','N6.4','R3.1.2','R4.1.3']:add(4,f'J{rn}',serial)
    nr=req['N5.8'];row=[nr['id'],'N5',None,'Base','Yes',nr['title'],nr['description'],notes['N5.8'],'Active',serial,None,None,None,None]
    for j,v in enumerate(row,1):
        if j not in [3,11,12,13,14]:add(4,f'{col(j)}142',v)
    add(3,'B6','AI security risks and threats');add(3,'F6','Cyber risk overview, AI-enabled social engineering and intrusion, examples of attacks on the bank\'s AI, and defensive implications. N5.7 adds specialist threat tracking.')
    records=json.loads((P/'reassessments.json').read_text());course={c['id']:c for c in d['courses']};appended=57542
    for a in records:
        c=course[a['course']];q=a['requirement'];r=req[q]
        old=c['scores'].get(q) or c['unassessed'].get(q)
        if old:rn=old['source']['row']
        else:rn=appended;appended+=1
        updates={'A':c['id'],'C':q,'F':a['score'],'G':a['evidence'],'H':'AI evidence review v11','I':serial,'M':'Unassessed' if a['score'] is None else 'Assessed','O':a['sourceUrl'],'P':f'V11 reassessment; prior v10 score: {a["priorScore"] if a["priorScore"] is not None else "not assessed"}'}
        # Preserve the existing Prior score (v7) column; v10 scores are in P and the archive.
        for cc,v in updates.items():add(5,f'{cc}{rn}',v)
    add(1,'A1','AI-era cyber training catalogue — v11')
    add(1,'A8','Scores — 411 Offers × 140 active outcomes, plus preserved retired N5.2 evidence. Blank scores remain explicitly unassessed. V11 reassesses four new or substantively changed outcomes.')
    add(2,'C23','A must-have is essential to achieving the objective safely and effectively at the assigned depth. Conditional essentials are identified in Rubric Notes. Strong requires no applicable must-have at zero; a mention can clear that gate but does not establish competence.')
    add(2,'A2','All Offers are reviewed against active outcomes. V11 preserves the 0–3 rubric and band thresholds. Knowledge needs require suitable depth; skill needs require practice for score 3. Retired outcomes are excluded from active calculations.')
    readme=[
      'Changes in v11 — approved must-have review, 18 October 2026',
      'N5.1 merges AI-enabled social engineering and deepfake impersonation. N5.2 is retired and maps to N5.1; its historical scores remain inspectable. N5.8 is a new cyber security risk overview for all Foundation learners. N5.4 bank-specific examples and N4 general responsible-use requirements are unchanged.',
      'N6.4 is Accountability; N8 Skill terminology and all N8 outcomes remain unchanged. Essential flags now prioritise safe delegation, retesting, error analysis, monitoring/stopping, inventory, value, accountability, incident playbooks, evidence and harness measurement. See Rubric Core and Notes.',
      'Conditional essentials: N11.3 when automated judges are used; R6.1.2 when assurance uses AI; R3.1.3 for multi-agent testing; N14.7 for leadership; R9.1.2 for delegated-identity integration. Course Coverage evaluates the full historical need scope including conditional essentials; the planner applies actual profile activities and responsibilities.',
      'Reassessment: all 411 Offers reviewed for N5.1, N5.8, R3.1.2 and R4.1.3 against the retained public-syllabus evidence and selected primary-source checks. 1,636 numeric decisions and 8 explicitly unassessed decisions. Tool-track metadata remains unassessed. Changed outcome scores are not inherited automatically.',
      'Current active scope remains 140 outcomes across 23 equally weighted needs. Numeric active scores: 57,260; unassessed active rows: 280. There are 141 rubric rows including retired N5.2 and 57,951 score records including its historical evidence. N5.2 and N5.8 are separate IDs, never a silent ID reuse.',
      'Previous catalogue v10 and annual plan v2 are archived unchanged. The model document and planner use the approved applicability. Excel Paths and Matrix retain historical rank-based views and are not the authority for role applicability. Recalculated annual plan v3 is the current delivery proposal; proposed internal work earns no assessment credit.',
    ]
    for rn,v in enumerate(readme,102):add(1,f'A{rn}',v)
    # Make historical course summaries explicit; current calculations are in Coverage.
    for c in d['courses']:
        if c['track']=='general':add(10,f'V{c["source"]["row"]}', 'Historical pre-v11 snapshot: '+c['coverageAtAssessment']+' | Current v11 results: Coverage sheet.')
    (P/'edits.json').write_text(json.dumps(edits));projection(SRC,P/'before-view.xlsx')
    print(json.dumps({'typedCellEdits':len(edits),'newScoreLastRow':appended-1}))
elif mode=='apply':
    p=load(SRC);a=load(P/'authored.xlsx');ss=strings(a)
    # Artifact-authored patch rows: source sheet index, address, typed value.
    w=E.fromstring(a['xl/workbook.xml']);sheets=w.find(tag('sheets'));idx=next(i+1 for i,s in enumerate(sheets) if s.get('name')=='Edits')
    edits=[]
    for row in tree(a,idx).find(tag('sheetData')):
        if row.get('r')=='1':continue
        cs={re.sub(r'\d','',c.get('r')):value(c,ss) for c in row}
        edits.append([int(cs['A']),cs['B'],cs.get('C')])
    assert edits==json.loads((P/'edits.json').read_text()),'Authored patch differs from intended edits'
    trees={n:tree(p,n) for n in set(x[0] for x in edits)}
    # Extend native rows using the existing table formula/style template.
    for n,end in [(4,142),(5,57952)]:
        sd=trees[n].find(tag('sheetData'));template=copy.deepcopy(sd[1]);start=int(sd[-1].get('r'))+1
        for rn in range(start,end+1):
            row=copy.deepcopy(template);row.set('r',str(rn))
            for c in row:
                c.set('r',re.sub(r'\d+',str(rn),c.get('r')))
                for child in list(c):
                    if child.tag!=tag('f'):c.remove(child)
                c.attrib.pop('t',None)
            sd.append(row)
    rowmaps={n:{int(row.get('r')):row for row in t.find(tag('sheetData'))} for n,t in trees.items()}
    def fastput(n,addr,v,formula=None):
        rn=int(re.search(r'\d+',addr)[0]);row=rowmaps[n].get(rn)
        if row is None:
            row=E.SubElement(trees[n].find(tag('sheetData')),tag('row'),r=str(rn));rowmaps[n][rn]=row
        old=row.find(f'm:c[@r="{addr}"]',NS);c=valcell(addr,v,old.get('s','5') if old is not None else '5',formula)
        if old is None:row.append(c)
        else:row.replace(old,c)
    for n,addr,v in edits:fastput(n,addr,v)
    # Restored formula columns on newly appended records; never hardcode lookups.
    for n,cols,start,end in [(4,['C','K','L','M','N'],142,142),(5,['B','D','E','J','K','L'],57542,57952)]:
        template=tree(p,n).find('m:sheetData/m:row[@r="2"]',NS)
        for cc in cols:
            f=template.find(f'm:c[@r="{cc}2"]/m:f',NS).text
            for rn in range(start,end+1):fastput(n,f'{cc}{rn}',None,formula=f)
    for n in [1,3,4,5]:
        for row in trees[n].find(tag('sheetData')):
            rn=int(row.get('r'))
            if n==1 and rn>=102:row.set('ht',str(30 if rn==102 else 80));row.set('customHeight','true')
            if n==4 and rn in [26,142]:row.set('ht',str(70 if rn==26 else 90));row.set('customHeight','true')
            if n==5 and any(x[0]==5 and x[1]==f'G{rn}' for x in []):pass
        if n==1:
            mc=trees[n].find(tag('mergeCells'))
            for rn in range(102,109):E.SubElement(mc,tag('mergeCell'),ref=f'A{rn}:D{rn}')
            mc.set('count',str(len(mc)))
    for n,extent in [(1,'A1:D108'),(4,'A1:N142'),(5,'A1:P57952')]:trees[n].find(tag('dimension')).set('ref',extent)
    for path,raw in list(p.items()):
        if not path.startswith('xl/tables/'):continue
        t=E.fromstring(raw)
        if t.get('name') in ['Rubric','Scores']:
            extent='A1:N142' if t.get('name')=='Rubric' else 'A1:P57952'
            t.set('ref',extent);t.find(tag('autoFilter')).set('ref',extent);p[path]=xml(t)
    for n,t in trees.items():
        if n in [4,5]:
            end=142 if n==4 else 57952
            for x in t.findall('m:conditionalFormatting',NS)+t.findall('m:dataValidations/m:dataValidation',NS):
                for att in ['sqref']:
                    x.set(att,re.sub(r'(?<=:)([A-Z]+)\d+',lambda m:m[1]+str(end),x.get(att)))
        p[f'xl/worksheets/sheet{n}.xml']=xml(t)
    # Clear caches on a separate calculation copy. Preserve originals and native parts.
    save(p,DST);(P/'recalc-in').mkdir(exist_ok=True);(P/'recalc-out').mkdir(exist_ok=True)
    for name,raw in list(p.items()):
        if not re.fullmatch(r'xl/worksheets/sheet\d+.xml',name):continue
        t=E.fromstring(raw)
        for c in t.findall('.//m:c[m:f]',NS):
            for v in list(c):
                if v.tag in [tag('v'),tag('is')]:c.remove(v)
        p[name]=xml(t)
    save(p,P/'recalc-in'/DST.name);print('Published native edit and prepared uncached recalculation copy')
elif mode=='cache':
    p=load(DST);calc=load(P/'recalc-out'/DST.name);ss=strings(calc);count=0;errors=[]
    from workbook_xml import setcache
    for n in range(1,17):
        t=tree(p,n);cs={c.get('r'):c for c in tree(calc,n).findall('.//m:c',NS)}
        for c in t.findall('.//m:c[m:f]',NS):
            out=cs.get(c.get('r'));v=value(out,ss)
            if out is not None and out.get('t')=='e':errors.append([n,c.get('r'),v])
            setcache(c,v);count+=1
        p[f'xl/worksheets/sheet{n}.xml']=xml(t)
    assert not errors,errors[:20]
    # Fit revised rubric notes and outcomes without altering native column styles.
    t=tree(p,4);ss=strings(p);changed={int(re.search(r'\d+',addr)[0]) for n,addr,v in json.loads((P/'edits.json').read_text()) if n==4}
    for row in t.find(tag('sheetData')):
        rn=int(row.get('r'))
        if rn not in changed:continue
        vals={re.sub(r'\d','',c.get('r')):str(value(c,ss) or '') for c in row}
        height=max(30,math.ceil(len(vals.get('F',''))/33)*13+5,math.ceil(len(vals.get('G',''))/100)*13+5,math.ceil(len(vals.get('H',''))/45)*13+5)
        row.set('ht',str(height));row.set('customHeight','true')
    p['xl/worksheets/sheet4.xml']=xml(t)
    save(p,DST);projection(DST,P/'after-view.xlsx')
    (P/'recalculation.json').write_text(json.dumps({'engine':'LibreOffice from uncached copy; only caches transferred into native workbook','formulas':count,'errors':errors},indent=2))
    print(count,'formula caches recalculated; no errors')
