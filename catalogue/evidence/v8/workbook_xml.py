"""Preserve native OOXML after artifact-tool full-workbook import exhausted 4/12 GB heaps.
Only changed worksheets/table extents are rewritten; untouched ZIP members are copied.
Formula caches are independently calculated and subsequently checked by LibreOffice.
"""
import json, pathlib, copy, re, zipfile, collections, math
from lxml import etree as E
R=pathlib.Path(__file__).resolve().parent
M='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
CT='http://schemas.openxmlformats.org/package/2006/content-types'
NS={'m':M};tag=lambda s:'{'+M+'}'+s
def xml(t):return E.tostring(t,xml_declaration=True,encoding='UTF-8',standalone=True)
def col(n):
    s=''
    while n:n,j=divmod(n-1,26);s=chr(65+j)+s
    return s
def valcell(addr,value,style='5',formula=None):
    c=E.Element(tag('c'),r=addr,s=str(style))
    if formula:E.SubElement(c,tag('f')).text=formula.removeprefix('=')
    if value is None:return c
    if isinstance(value,(int,float)):
        c.set('t','n');E.SubElement(c,tag('v')).text=str(value)
    elif formula:
        c.set('t','str');E.SubElement(c,tag('v')).text=str(value)
    else:
        c.set('t','inlineStr');E.SubElement(E.SubElement(c,tag('is')),tag('t')).text=str(value)
    return c
def put(t,addr,value,formula=None,style=None):
    rownum=int(re.search(r'\d+',addr).group());sd=t.find(tag('sheetData'))
    row=sd.find(f"m:row[@r='{rownum}']",NS)
    if row is None:row=E.SubElement(sd,tag('row'),r=str(rownum))
    old=row.find(f"m:c[@r='{addr}']",NS)
    c=valcell(addr,value,style or (old.get('s','5') if old is not None else '5'),formula)
    if old is not None:row.replace(old,c)
    else:row.append(c)
    return c
def setcache(c,value):
    for v in list(c):
        if v.tag in [tag('v'),tag('is')]:c.remove(v)
    c.set('t','n' if isinstance(value,(int,float)) else 'str')
    E.SubElement(c,tag('v')).text=str(value) if value is not None else ''
def build():
    D=json.loads((R/'original.json').read_text());C=json.loads((R/'compiled.json').read_text())
    src=R.parent/'AI_Era_Cyber_Training_Catalogue_v7.xlsx'
    with zipfile.ZipFile(src) as z:parts={n:z.read(n) for n in z.namelist()}
    trees={i:E.fromstring(parts[f'xl/worksheets/sheet{i}.xml']) for i in [1,2,3,4,5,6,10]}
    oldscore=trees[5].find('m:sheetData/m:row[@r="2"]',NS)
    sf={re.sub(r'\d','',c.get('r')):c.find(tag('f')).text for c in oldscore if c.find(tag('f')) is not None}
    ss={re.sub(r'\d','',c.get('r')):c.get('s','5') for c in oldscore}
    scoreheaders=D['Scores'][0]+['Assessment status','Prior score (v7)','Source entry (full list in Offers)','V8 change']
    st=trees[5];sd=st.find(tag('sheetData'));sd.clear()
    hd=E.SubElement(sd,tag('row'),r='1',ht='32',customHeight='true')
    for i,h in enumerate(scoreheaders,1):hd.append(valcell(f'{col(i)}1',h,'23'))
    scoreblock={}
    for idx,r in enumerate(C['records'],2):
        scoreblock.setdefault(r['offer'],[idx,idx])[1]=idx
        height=max(45,min(409,math.ceil(len(r['evidence'])/84)*13+7))
        row=E.SubElement(sd,tag('row'),r=str(idx),ht=str(height),customHeight='true')
        vals=[r['offer'],r['title'],r['req'],r['need'],r['requirement'],r['score'],r['evidence'],
              'AI desk review v8',46310,r['rank'],r['core'],'Active',r['status'],r['prior'],r['source'],r['change']]
        for j,v in enumerate(vals,1):row.append(valcell(f'{col(j)}{idx}',v,ss.get(col(j),'5'),sf.get(col(j))))
    st.find(tag('dimension')).set('ref',f'A1:P{len(C["records"])+1}')
    cols=st.find(tag('cols'))
    # Separate the two adjacent headers visually without changing the established layout.
    for c in cols:
        if c.get('min')=='4' and c.get('max')=='4':c.set('width','14')
    for i,w in [(13,17),(14,15),(15,55),(16,25)]:E.SubElement(cols,tag('col'),min=str(i),max=str(i),width=str(w),customWidth='true')
    for dv in st.findall('m:dataValidations/m:dataValidation',NS):
        cc=dv.get('sqref')[0];dv.set('sqref',f'{cc}2:{cc}{len(C["records"])+1001}')
    for cf in st.findall('m:conditionalFormatting',NS):
        cc=cf.get('sqref')[0];cf.set('sqref',f'{cc}2:{cc}{len(C["records"])+1}')
        for f in cf.findall('m:cfRule/m:formula',NS):
            if 'COUNTIFS($A:$A' in (f.text or ''):
                # Avoid whole-column scans in the expanded table, retaining duplicate checks.
                f.text=f.text.replace('$A:$A',f'$A$2:$A${len(C["records"])+1}').replace('$C:$C',f'$C$2:$C${len(C["records"])+1}')
    ct=trees[6];template=ct.find('m:sheetData/m:row[@r="2"]',NS)
    cs={re.sub(r'\d','',c.get('r')):c.get('s','5') for c in template}
    cf={re.sub(r'\d','',c.get('r')):c.find(tag('f')).text for c in template if c.find(tag('f')) is not None}
    cf['H']=cf['H'][:-2]+',Scores[Score],"<>"))'
    cf['M']='IF(Coverage[[#This Row],[Scored]]=0,"Unassessed",'+cf['M']+')'
    sd=ct.find(tag('sheetData'));header=copy.deepcopy(sd[0]);sd.clear();sd.append(header)
    for idx,r in enumerate(C['coverage'],2):
        row=E.SubElement(sd,tag('row'),r=str(idx),ht='36',customHeight='true')
        vals=[r[k] for k in ['offer','title','need','name','level','rank','scope','scored','pct','core','gaps','at3','band','note']]
        for j,v in enumerate(vals,1):row.append(valcell(f'{col(j)}{idx}',v,cs.get(col(j),'5'),cf.get(col(j))))
    ct.find(tag('dimension')).set('ref',f'A1:N{len(C["coverage"])+1}')
    for x in ct.findall('m:conditionalFormatting',NS):x.set('sqref',f'M2:M{len(C["coverage"])+1}')
    for x in ct.findall('m:dataValidations/m:dataValidation',NS):
        cc=x.get('sqref')[0];x.set('sqref',f'{cc}2:{cc}{len(C["coverage"])+1001}')
    # Table sizes and metadata; keep table identities and styles intact.
    for path,raw in list(parts.items()):
        if not path.startswith('xl/tables/') or not path.endswith('.xml'):continue
        t=E.fromstring(raw);name=t.get('name')
        if name not in ['Scores','Coverage']:continue
        end=f'P{len(C["records"])+1}' if name=='Scores' else f'N{len(C["coverage"])+1}'
        t.set('ref','A1:'+end);t.find(tag('autoFilter')).set('ref','A1:'+end)
        tc=t.find(tag('tableColumns'))
        if name=='Scores':
            for i,h in enumerate(scoreheaders[12:],13):E.SubElement(tc,tag('tableColumn'),id=str(i),name=h)
            tc.set('count','16')
        for c in tc:
            f=c.find(tag('calculatedColumnFormula'))
            if f is not None and name=='Coverage' and c.get('name') in ['Scored','Band']:f.text=cf['H' if c.get('name')=='Scored' else 'M']
        parts[path]=xml(t)
    # Refresh dependent formula caches without changing native formulas.
    reqrecords=collections.defaultdict(list)
    for r in C['records']:reqrecords[r['req']].append(r['score'])
    reqstats={q:(max([v for v in vs if v is not None],default=0),vs.count(3),vs.count(2)) for q,vs in reqrecords.items()}
    for i,r in enumerate(D['Rubric'][1:],2):
        for cc,v in zip(['L','M','N'],reqstats[r[0]]):setcache(trees[4].find(f"m:sheetData/m:row/m:c[@r='{cc}{i}']",NS),v)
    for i,r in enumerate(D['Needs'][1:],2):
        qs=[x for x in D['Rubric'][1:] if x[1]==r[0] and x[8]=='Active']
        values=[sum(reqstats[q[0]][0]==3 for q in qs),sum(reqstats[q[0]][0]<2 for q in qs),
                sum(c['need']==r[0] and c['band'] in ['Full','Strong'] for c in C['coverage']),
                sum(c['need']==r[0] and c['band']=='Partial' for c in C['coverage'])]
        for cc,v in zip(['K','L','M','N'],values):setcache(trees[3].find(f"m:sheetData/m:row/m:c[@r='{cc}{i}']",NS),v)
    audits={a['offer']:a for a in C['audits']}
    for i,o in enumerate(D['Offers'][1:],2):
        a=audits[o[0]]
        put(trees[10],f'O{i}','All 23 needs assessed; evidenced: '+a['positive_needs'] if a['assessed'] else 'All 23 needs reviewed — unassessed (source unavailable)')
        put(trees[10],f'V{i}',a['summary'])
        put(trees[10],f'W{i}',a['fullstrong'])
        put(trees[10],f'X{i}','V8 (15 Oct 2026): '+a['note']+' Prior fit note retained in V8 audit.')
        put(trees[10],f'Y{i}',a['sources'])
    # Old synopsis remains explicitly historical; v8 changes are in the fit note and audit.
    put(trees[10],'V1','Coverage at assessment (v8)',style='23')
    put(trees[10],'X1','Fit note (v8 source review)',style='23')
    # Table headers must continue matching the worksheet headers.
    for path,raw in list(parts.items()):
        if path.startswith('xl/tables/') and path.endswith('.xml'):
            t=E.fromstring(raw)
            if t.get('name')=='Offers':
                for x in t.find(tag('tableColumns')):
                    if x.get('id')=='22':x.set('name','Coverage at assessment (v8)')
                    if x.get('id')=='24':x.set('name','Fit note (v8 source review)')
                parts[path]=xml(t)
    rd=trees[1]
    put(rd,'A1','AI-era cyber training catalogue — draft v8',style='1')
    put(rd,'A8','Scores — all 308 Offers × all 140 active requirements. Filter Need code and Assessment status. Blank scores are explicitly unassessed; prior scores and source references are retained.')
    put(rd,'A20','Review Coverage, Scores and V8 audit against the current Needs/Rubric. Matrix is historical and has not been rebuilt. Reviewer decisions on Offers are preserved.')
    put(rd,'A52','1. Review every active requirement against the exact offering and its authoritative syllabus/synopsis; do not omit a need merely because its scores are below 2.')
    put(rd,'A53','2. Record 0–3 plus evidence; use blank with Unassessed status when authoritative content is unavailable. Zero means not evidenced in reviewed material. Coverage counts numeric assessments only.')
    extra=[
        ('Changes from v7 — 15 Oct 2026',None),
        ('Scope', '308 Offers; 23 needs; 140 active requirements. Tool track and original v7 are unchanged.'),
        ('Why assessments were missing','V7 only recorded a need when at least one requirement scored 2 or more. V8 records every Offer/requirement pair, including mention-only and explicit-zero assessments.'),
        ('V8 assessment rows',C['stats']['score_rows']),
        ('Numeric assessments',C['stats']['numeric_assessments']),
        ('Unassessed requirements',280),
        ('New positive assessments',C['stats']['New positive assessment']),
        ('Existing scores changed',C['stats']['Changed score']),
        ('Source exceptions','TR-017 and TR-045 remain unassessed: no sufficiently authoritative course synopsis was accessible. Do not interpret their arithmetic zero as confirmed no coverage.'),
        ('Scoring limits','Desk review of public provider syllabi, lecture synopses and official publications; no claim of course completion or inspection of gated lessons. Existing evidenced scores were retained where not contradicted. Scores of 3 retain the whole-requirement and practice rules.'),
        ('Exams versus teaching','Eight exam/credential-only records now have zero taught coverage. Their v7 objective-based scores remain in Scores/Prior score. Optional preparation is not assumed included.'),
        ('Target level','Coverage preserves existing target levels unless newly evidenced teaching at score ≥2 requires a higher level. New needs use the higher of best-fit level and the need introduction level. Scores always includes all levels.'),
        ('Read the evidence','V8 audit records per-offer changes, source URLs, limitations and the previous fit note/summary. Offers content summaries retain their explicit 13 Oct date; current additions are in Fit note and Scores.'),
        ('Preservation','Source IDs, rubric text and Core flags, durations, prices, reviewer decisions, tool track, Matrix and Build items were retained. Existing empty Paths remain empty; no training plan was reselected.'),
        ('Interpretation','A score of 0 means not evidenced in this catalogue/source review, not that no training exists. Unassessed resources remain an uncertainty. Full/Strong/Partial/Weak thresholds are unchanged.'),
    ]
    # README is a wide merged narrative: append full-width rows using established styles.
    merged=rd.find(tag('mergeCells'))
    for j,(label,value) in enumerate(extra,74):
        put(rd,f'A{j}',label if value is None else f'{label}: {value}',style='23' if value is None else '5')
        row=rd.find(f"m:sheetData/m:row[@r='{j}']",NS);row.set('ht','45' if j in [76,82,83,84,85,86,87,88] else '30');row.set('customHeight','true')
        if merged is not None:E.SubElement(merged,tag('mergeCell'),ref=f'A{j}:D{j}')
    if merged is not None:merged.set('count',str(len(merged)))
    rd.find(tag('dimension')).set('ref',f'A1:D{73+len(extra)}')
    put(rd,'A69','Numeric scores recorded (excludes unassessed blanks)')
    summary={'B67':sum(s[0]==3 for s in reqstats.values()),'B68':sum(s[0]<2 for s in reqstats.values()),'B69':C['stats']['numeric_assessments'],
             'B70':len(C['coverage']),'B71':C['stats']['fullstrong']}
    for addr,v in summary.items():setcache(rd.find(f"m:sheetData/m:row/m:c[@r='{addr}']",NS),v)
    guide=trees[2]
    put(guide,'A2','All Offers are reviewed against all active requirements. Apply the unchanged 0–3 rubric and band thresholds below; unavailable evidence is left blank and labelled Unassessed.')
    put(guide,'C5','No teaching or mention evidenced in the reviewed course synopsis/source. This is not a claim that no such training exists.')
    # New audit: concise metrics at the left, detailed rationale and historic data to the right.
    audit=E.Element(tag('worksheet'),nsmap={None:M,'r':REL})
    E.SubElement(audit,tag('dimension'),ref='A1:O309')
    views=E.SubElement(audit,tag('sheetViews'));view=E.SubElement(views,tag('sheetView'),workbookViewId='0',showGridLines='false')
    E.SubElement(view,tag('pane'),xSplit='2',ySplit='1',topLeftCell='C2',activePane='bottomRight',state='frozen')
    E.SubElement(audit,tag('sheetFormatPr'),defaultRowHeight='45')
    cols=E.SubElement(audit,tag('cols'))
    widths=[14,56,44,14,14,16,15,16,16,17,90,75,90,90,20]
    for i,w in enumerate(widths,1):E.SubElement(cols,tag('col'),min=str(i),max=str(i),width=str(w),customWidth='true')
    sd=E.SubElement(audit,tag('sheetData'))
    headers=['Offer ID','Title','Evidence / assessment basis','Scored / 140','Positive scores','New positives','Changed scores','New zeros','Retained scores','Full / Strong needs','V8 decision and limitations','Authoritative source references','Previous fit note (v7)','Previous coverage summary (v7)','Reviewed on']
    row=E.SubElement(sd,tag('row'),r='1',ht='34',customHeight='true')
    for i,h in enumerate(headers,1):row.append(valcell(f'{col(i)}1',h,'23'))
    for i,a in enumerate(C['audits'],2):
        vals=[a[k] for k in ['offer','title','basis','assessed','positive','newpositive','changed','newzero','retained','fullstrong','note','sources','old_fit','old_summary']]+['2026-10-15']
        lines=max(sum(max(1,math.ceil(len(line)/(widths[j]-3))) for line in str(v or '').split('\n')) for j,v in enumerate(vals))
        row=E.SubElement(sd,tag('row'),r=str(i),ht=str(min(409,max(76,lines*13+8))),customHeight='true')
        for j,v in enumerate(vals,1):row.append(valcell(f'{col(j)}{i}',v,'25' if 4<=j<=10 else '5'))
    E.SubElement(audit,tag('autoFilter'),ref='A1:O309')
    E.SubElement(audit,tag('pageMargins'),left='.3',right='.3',top='.5',bottom='.5',header='.2',footer='.2')
    E.SubElement(audit,tag('pageSetup'),orientation='landscape',paperSize='9',fitToWidth='1',fitToHeight='0')
    parts['xl/worksheets/sheet16.xml']=xml(audit)
    wb=E.fromstring(parts['xl/workbook.xml'])
    E.SubElement(wb.find(tag('sheets')),tag('sheet'),name='V8 audit',sheetId='16',state='visible',attrib={'{'+REL+'}id':'rIdV8Audit'})
    cp=wb.find(tag('calcPr'));cp.set('calcMode','auto');cp.set('fullCalcOnLoad','1');cp.set('forceFullCalc','1')
    parts['xl/workbook.xml']=xml(wb)
    rels=E.fromstring(parts['xl/_rels/workbook.xml.rels'])
    E.SubElement(rels,'{'+PKG+'}Relationship',Id='rIdV8Audit',Type=REL+'/worksheet',Target='worksheets/sheet16.xml')
    parts['xl/_rels/workbook.xml.rels']=xml(rels)
    types=E.fromstring(parts['[Content_Types].xml'])
    E.SubElement(types,'{'+CT+'}Override',PartName='/xl/worksheets/sheet16.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml')
    parts['[Content_Types].xml']=xml(types)
    for i,t in trees.items():parts[f'xl/worksheets/sheet{i}.xml']=xml(t)
    out=R.parent/'AI_Era_Cyber_Training_Catalogue_v8.xlsx'
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for name,raw in parts.items():z.writestr(name,raw)
    print(out, out.stat().st_size)
if __name__=='__main__':build()
