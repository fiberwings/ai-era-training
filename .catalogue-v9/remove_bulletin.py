"""Remove TR-127 and its records, preserving native workbook parts and formulas.

The full workbook exceeds artifact-tool's verified import capacity (v8 audit:
4/12 GB heap exhaustion). Use the established targeted OOXML workflow and
artifact-tool native-format previews, plus independent formula reconciliation.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from collections import Counter, defaultdict
import bisect, hashlib, json, re, shutil
from lxml import etree as E

ROOT=Path(__file__).resolve().parents[1]; OUT=Path(__file__).resolve().parent
SRC=ROOT/'AI_Era_Cyber_Training_Catalogue_v8.xlsx'
DST=ROOT/'AI_Era_Cyber_Training_Catalogue_v9.xlsx'
NSURI='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
NS={'m':NSURI}; tag=lambda n:'{'+NSURI+'}'+n
xml=lambda t:E.tostring(t,xml_declaration=True,encoding='UTF-8',standalone=True)

with ZipFile(SRC) as z:parts={n:z.read(n) for n in z.namelist()}
original=parts.copy(); ss=E.fromstring(parts['xl/sharedStrings.xml'])
strings=[''.join(t.itertext()) for t in ss]
def value(c):
    if c is None:return None
    if c.get('t')=='inlineStr':return ''.join(c.find(tag('is')).itertext())
    v=c.findtext(tag('v'))
    if c.get('t')=='s':return strings[int(v)]
    if c.get('t')=='n' or c.get('t') is None:
        try:return float(v) if '.' in v else int(v)
        except (ValueError,TypeError):return v
    return v
def rowval(row,col):return value(row.find(f'm:c[@r="{col}{row.get("r")}"]',NS))
def put(t,addr,v):
    sd=t.find(tag('sheetData'));rn=re.search(r'\d+',addr).group();row=sd.find(f'm:row[@r="{rn}"]',NS)
    if row is None:row=E.SubElement(sd,tag('row'),r=rn,ht='45',customHeight='true')
    c=row.find(f'm:c[@r="{addr}"]',NS)
    if c is None:c=E.SubElement(row,tag('c'),r=addr,s='5')
    for child in list(c):
        if child.tag in (tag('v'),tag('is')):c.remove(child)
    if isinstance(v,(int,float)):
        c.set('t','n');E.SubElement(c,tag('v')).text=str(v)
    else:
        c.set('t','inlineStr');E.SubElement(E.SubElement(c,tag('is')),tag('t')).text=str(v)
    return c

trees={i:E.fromstring(parts[f'xl/worksheets/sheet{i}.xml']) for i in [1,3,4,5,6,10,14,16]}
removed={}; targets={5:'Scores',6:'Coverage',10:'Offers',16:'V8 audit'}
for num,name in targets.items():
    tree=trees[num];sd=tree.find(tag('sheetData'));deletes=sorted(int(r.get('r')) for r in sd if rowval(r,'A')=='TR-127')
    assert len(deletes)=={5:140,6:23,10:1,16:1}[num],(name,deletes)
    removed[name]=deletes
    def shift_addr(addr):
        return re.sub(r'(\$?[A-Z]{1,3}\$?)(\d+)',lambda m:m[1]+str(int(m[2])-bisect.bisect_left(deletes,int(m[2]))),addr)
    for row in list(sd):
        old=int(row.get('r'))
        if old in deletes:sd.remove(row);continue
        new=old-bisect.bisect_left(deletes,old);row.set('r',str(new))
        for c in row:c.set('r',re.sub(r'\d+',str(new),c.get('r')))
    # Worksheet ranges, filters, hyperlink anchors and validation extents move with rows.
    for el in tree.iter():
        for attr in ['ref','sqref']:
            if attr in el.attrib:
                if el.tag==tag('hyperlink') and int(re.search(r'\d+',el.get(attr)).group()) in deletes:
                    el.getparent().remove(el);break
                el.set(attr,' '.join(shift_addr(x) for x in el.get(attr).split()))
        if el.tag==tag('formula') and el.text:el.text=shift_addr(el.text)
    for path,raw in list(parts.items()):
        if path.startswith('xl/tables/') and path.endswith('.xml'):
            t=E.fromstring(raw)
            if t.get('name')==name:
                t.set('ref',shift_addr(t.get('ref')))
                for f in t.findall('m:autoFilter',NS):f.set('ref',shift_addr(f.get('ref')))
                parts[path]=xml(t)

# Recalculate only dependent summary caches. Surviving score and coverage
# formulas/values are unchanged: their keys and requirement denominators survive.
score_values=defaultdict(list)
for row in trees[5].find(tag('sheetData')):
    if row.get('r')!='1':score_values[rowval(row,'C')].append(rowval(row,'F'))
stats={rid:(max([v for v in vs if isinstance(v,(int,float))],default=0),vs.count(3),vs.count(2)) for rid,vs in score_values.items()}
for row in trees[4].find(tag('sheetData')):
    rid=rowval(row,'A')
    if rid in stats:
        for col,v in zip(['L','M','N'],stats[rid]):put(trees[4],col+row.get('r'),v)
coverage=[]
for row in trees[6].find(tag('sheetData')):
    if row.get('r')!='1':coverage.append((rowval(row,'C'),rowval(row,'M')))
reqs=defaultdict(list)
for row in trees[4].find(tag('sheetData')):
    if rowval(row,'I')=='Active':reqs[rowval(row,'B')].append(rowval(row,'A'))
for row in trees[3].find(tag('sheetData')):
    need=rowval(row,'A')
    if need not in reqs:continue
    vals=[sum(stats[q][0]==3 for q in reqs[need]),sum(stats[q][0]<2 for q in reqs[need]),
          sum(n==need and b in ['Full','Strong'] for n,b in coverage),sum(n==need and b=='Partial' for n,b in coverage)]
    for col,v in zip(['K','L','M','N'],vals):put(trees[3],col+row.get('r'),v)
readme=trees[1]
put(readme,'A1','AI-era cyber training catalogue — draft v9')
put(readme,'A8','Scores — all 307 Offers × all 140 active requirements. Filter Need code and Assessment status. Blank scores are explicitly unassessed; prior scores and source references are retained.')
for addr,v in {'B67':sum(v[0]==3 for v in stats.values()),'B68':sum(v[0]<2 for v in stats.values()),
               'B69':sum(isinstance(x,(int,float)) for vs in score_values.values() for x in vs),'B70':len(coverage),
               'B71':sum(b in ['Full','Strong'] for _,b in coverage)}.items():put(readme,addr,v)
for rn,text in [(89,'Changes in v9 — 16 Oct 2026'),
                (90,'Removed TR-127 (CERTFR-2026-ACT-016) from Offers, Scores, Coverage and the retained V8 audit. Corporate-scope decision: personal-assistant workstation risks are unnecessary for this organisation’s training plan. No replacement or other course-score change.'),
                (91,'Current scope: 307 Offers and 117 Tool track resources; 140 active requirements; 42,700 numeric assessments plus 280 explicitly unassessed rows; 7,061 course/need coverage rows. V8 is preserved as the historical source. Prior v8 change statistics above remain historical.')]:
    put(readme,f'A{rn}',text)
    E.SubElement(readme.find(tag('mergeCells')),tag('mergeCell'),ref=f'A{rn}:D{rn}')
readme.find(tag('mergeCells')).set('count',str(len(readme.find(tag('mergeCells')))))
readme.find(tag('dimension')).set('ref','A1:D91')
# Log the catalogue decision without retaining it as an active learning resource.
log=trees[14];rn=86
for col,v in zip('ABCDE',['CERTFR-2026-ACT-016 — agentic workstation risk bulletin','CERT-FR','Removed from active catalogue (v9)','TR-127','16 Oct 2026: excluded at the project owner’s request. Personal-assistant workstation scope is unnecessary for the corporate training programme.']):put(log,f'{col}{rn}',v)
log.find(tag('dimension')).set('ref','A1:E86')
put(readme,'B37',len(trees[10].find(tag('sheetData')))-1)
put(readme,'B41',len(log.find(tag('sheetData')))-1)
for path,raw in list(parts.items()):
    if path.startswith('xl/tables/') and path.endswith('.xml'):
        t=E.fromstring(raw)
        if t.get('name')=='Screening':
            t.set('ref','A1:E86');t.find(tag('autoFilter')).set('ref','A1:E86');parts[path]=xml(t)
for i,t in trees.items():parts[f'xl/worksheets/sheet{i}.xml']=xml(t)
with ZipFile(DST,'w',ZIP_DEFLATED) as z:
    for n,b in parts.items():z.writestr(n,b)
report={'removedCourse':'TR-127','reason':'Personal-assistant workstation scope unnecessary for the corporate training programme, per project owner.',
        'date':'2026-10-16','source':SRC.name,'output':DST.name,'sourceSha256':hashlib.sha256(SRC.read_bytes()).hexdigest(),
        'removedRows':{k:len(v) for k,v in removed.items()},'changedParts':[n for n,b in parts.items() if b!=original.get(n)],
        'preservedParts':len([n for n,b in parts.items() if b==original.get(n)])}
(OUT/'change-record.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
