"""Prepare/assemble the v16 lifecycle overlay; preserve every original assessment cell.

Artifact Tool authors all new values, formulas and the retirement worksheet.
OOXML assembly avoids a full-workbook round trip that would rewrite unrelated
formula caches, tables, links and historical evidence.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
import copy, hashlib, json, re, sys

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
WORK = ROOT / '.work/catalogue/v16'
SOURCE = ROOT / 'catalogue/AI_Era_Cyber_Training_Catalogue_v15.xlsx'
if not SOURCE.exists(): SOURCE = ROOT / 'archive/catalogues/AI_Era_Cyber_Training_Catalogue_v15.xlsx'
TARGET = ROOT / 'catalogue/AI_Era_Cyber_Training_Catalogue_v16.xlsx'
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
T = lambda n: '{'+NS['m']+'}'+n
XMLNS = 'http://schemas.openxmlformats.org/package/2006/relationships'
DOCREL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
def load(p):
    with ZipFile(p) as z: return {n:z.read(n) for n in z.namelist()}
def save(parts,p):
    with ZipFile(p,'w',ZIP_DEFLATED) as z:
        for n,v in parts.items(): z.writestr(n,v)
def xml(t): return E.tostring(t,xml_declaration=True,encoding='UTF-8',standalone=True)
def strings(parts):
    return [''.join(x.itertext()) for x in E.fromstring(parts['xl/sharedStrings.xml'])] if 'xl/sharedStrings.xml' in parts else []
def inline(c,ss):
    if c.get('t')=='s':
        val=ss[int(c.findtext(T('v')))];c.remove(c.find(T('v')));c.set('t','inlineStr')
        E.SubElement(E.SubElement(c,T('is')),T('t')).text=val
    return c
def projection(parts,p,after=False):
    out=parts.copy()
    for name in list(out):
        if name.startswith('xl/worksheets/') and name.endswith('.xml') and '/_rels/' not in name:
            t=E.fromstring(out[name]);sd=t.find(T('sheetData'))
            keep={1,361,362,363} if name.endswith('sheet10.xml') else {1,90,91,92,93,94,95} if name.endswith('sheet11.xml') else {1,2,3,4} if name.endswith('sheet1.xml') else set()
            if name.endswith('retirements.xml'): keep=set(range(1,20))
            for row in list(sd):
                if int(row.get('r')) not in keep:sd.remove(row)
            for c in t.findall('.//m:c[m:f]',NS):c.remove(c.find(T('f')))
            for tag in ['tableParts','drawing','legacyDrawing','conditionalFormatting','dataValidations','hyperlinks']:
                for x in t.findall('m:'+tag,NS):t.remove(x)
            out[name]=xml(t)
    out={k:v for k,v in out.items() if not k.startswith(('xl/tables/','xl/drawings/','xl/worksheets/_rels/')) and k!='xl/calcChain.xml'}
    save(out,p)
def prepare():
    WORK.mkdir(parents=True,exist_ok=True)
    review=json.loads((ROOT/'analysis/catalogue-freshness-review/inputs/review.json').read_text())
    data=json.loads((ROOT/'training-planner/catalogue-history/ff6d5a46d0450171.json').read_text())
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==review['workbookSha256']
    byid={c['id']:c for c in data['courses']}
    rows=[]
    for d in review['retire']:
        c=byid[d['id']]
        rows.append([c['id'],c['title'],'2026-11-02',d['reason'],'User approved 2 November 2026', '\n'.join(review['sources'][s]['url'] for s in d['sources'])])
    inputs={'retirements':rows,'courses':[{'id':c['id'],'sheet':c['source']['sheet'],'row':c['source']['row']} for c in data['courses']],
      'readme':[
        ['A1','AI Era Cyber Training Catalogue v16'],
        ['A2','Current lifecycle release: 2 November 2026. 516 active resources (403 Offers and 113 Tool track), plus the saved AI use cases internal brief. 18 user-approved retirements.'],
        ['A3','Offers and Tool track default to Lifecycle = Active. Clear that filter to inspect retired records. Retirements records the approved IDs, reasons, date and sources. Historical rows, source references and assessment scores are retained.'],
        ['A4','Current apps import active resources only. Scores, Coverage, Paths, Path detail, Matrix and audit sheets preserve historical assessments/planning; they are not the active curriculum. The capability model and Recommended Training Pathways remain the curriculum authorities.'],
        ['A119','V16 — 2 November 2026: approved retirements'],
        ['A120','18 resources retired: model-specific o1/Llama editions, PaLM/Assistants/AutoGen editions, four AI-900 entries, four old OWASP editions and two historical references plus Practical GenAI. No scores or evidence have been reassessed.'],
        ['A121','Active resources retain 56,140 numerical outcome scores and 280 explicitly unassessed rows. All 140 outcomes and 23 scoring groups remain unchanged. Historical assessment sheets retain their original 58,100 scores and 9,591 course/need rows.']
      ]}
    (HERE/'inputs.json').write_text(json.dumps(inputs,ensure_ascii=False,indent=2)+'\n')
    projection(load(SOURCE),WORK/'before-view.xlsx')
    print('Prepared retirement inputs and a bounded baseline view.')
def merge_styles(parts,authored):
    old=E.fromstring(parts['xl/styles.xml']);new=E.fromstring(authored['xl/styles.xml']);maps={}
    for tag in ['fonts','fills','borders']:
        dst=old.find(T(tag));src=new.find(T(tag));maps[tag]=[]
        for el in src:
            maps[tag].append(len(dst));dst.append(copy.deepcopy(el))
        dst.set('count',str(len(dst)))
    nmap={};src=new.find(T('numFmts'))
    if src is not None:
        dst=old.find(T('numFmts'))
        if dst is None:dst=E.Element(T('numFmts'));old.insert(0,dst)
        nextid=max([163]+[int(x.get('numFmtId')) for x in dst])+1
        for el in src:
            nmap[int(el.get('numFmtId'))]=nextid;e=copy.deepcopy(el);e.set('numFmtId',str(nextid));dst.append(e);nextid+=1
        dst.set('count',str(len(dst)))
    dst=old.find(T('cellXfs'));offset=len(dst)
    for el in new.find(T('cellXfs')):
        e=copy.deepcopy(el)
        for attr,tag in [('fontId','fonts'),('fillId','fills'),('borderId','borders')]:e.set(attr,str(maps[tag][int(e.get(attr,'0'))]))
        if int(e.get('numFmtId','0')) in nmap:e.set('numFmtId',str(nmap[int(e.get('numFmtId'))]))
        e.set('xfId','0');dst.append(e)
    dst.set('count',str(len(dst)));parts['xl/styles.xml']=xml(old);return offset
def assemble():
    parts=load(SOURCE);auth=load(WORK/'authored.xlsx');ss=strings(auth)
    offset=merge_styles(parts,auth)
    # Retirements is first in the authored workbook and contains the approved source register.
    register=E.fromstring(auth['xl/worksheets/sheet1.xml'])
    for c in register.findall('.//m:c',NS):
        inline(c,ss)
        if c.get('s'):c.set('s',str(int(c.get('s'))+offset))
    for tag in ['drawing','tableParts']:
        for el in register.findall('m:'+tag,NS):register.remove(el)
    # OOXML requires autoFilter before pageMargins; Excel repairs out-of-order elements.
    register.insert(list(register).index(register.find(T('sheetData')))+1,E.Element(T('autoFilter'),ref='A1:F19'))
    parts['xl/worksheets/retirements.xml']=xml(register)
    wb=E.fromstring(parts['xl/workbook.xml']);sheets=wb.find(T('sheets'))
    rid='rIdRetirementsV16';E.SubElement(sheets,T('sheet'),name='Retirements',sheetId=str(max(int(x.get('sheetId')) for x in sheets)+1),attrib={'{'+DOCREL+'}id':rid})
    parts['xl/workbook.xml']=xml(wb)
    rels=E.fromstring(parts['xl/_rels/workbook.xml.rels']);E.SubElement(rels,'{'+XMLNS+'}Relationship',Id=rid,Type=DOCREL+'/worksheet',Target='worksheets/retirements.xml');parts['xl/_rels/workbook.xml.rels']=xml(rels)
    ct=E.fromstring(parts['[Content_Types].xml']);E.SubElement(ct,'{http://schemas.openxmlformats.org/package/2006/content-types}Override',PartName='/xl/worksheets/retirements.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml');parts['[Content_Types].xml']=xml(ct)
    retired={r[0] for r in json.loads((HERE/'inputs.json').read_text())['retirements']}
    for sn,an,table,column,end in [(10,2,5,'Z',418),(11,3,10,'O',118)]:
        t=E.fromstring(parts[f'xl/worksheets/sheet{sn}.xml']);a=E.fromstring(auth[f'xl/worksheets/sheet{an}.xml'])
        authored={c.get('r'):c for c in a.findall('.//m:c',NS)}
        origss=strings(parts)
        for row in t.find(T('sheetData')):
            rn=int(row.get('r'));c=copy.deepcopy(authored[f'{column}{rn}']);inline(c,ss)
            c.set('s','23' if rn==1 else row[0].get('s','0'));row.append(c)
            if rn>1:
                first=copy.deepcopy(row[0]);inline(first,origss);cid=''.join(first.find(T('is')).itertext())
                if cid in retired:row.set('hidden','1')
        newref=f'A1:{column}{end}';t.find(T('dimension')).set('ref',newref)
        cols=t.find(T('cols'));E.SubElement(cols,T('col'),min=str(26 if sn==10 else 15),max=str(26 if sn==10 else 15),width='16',customWidth='1')
        sheetpr=t.find(T('sheetPr'))
        if sheetpr is None:sheetpr=E.Element(T('sheetPr'));t.insert(0,sheetpr)
        sheetpr.set('filterMode','1')
        parts[f'xl/worksheets/sheet{sn}.xml']=xml(t)
        name=f'xl/tables/table{table}.xml';tt=E.fromstring(parts[name]);tt.set('ref',newref)
        af=tt.find(T('autoFilter'));af.set('ref',newref)
        for child in list(af):af.remove(child)
        fc=E.SubElement(af,T('filterColumn'),colId=str(25 if sn==10 else 14));E.SubElement(E.SubElement(fc,T('filters')),T('filter'),val='Active')
        cs=tt.find(T('tableColumns'));E.SubElement(cs,T('tableColumn'),id=str(len(cs)+1),name='Lifecycle');cs.set('count',str(len(cs)))
        parts[name]=xml(tt)
    # README edits were authored separately; existing styles/merges are preserved.
    a=E.fromstring(auth['xl/worksheets/sheet4.xml']);t=E.fromstring(parts['xl/worksheets/sheet1.xml']);sd=t.find(T('sheetData'));rows={int(r.get('r')):r for r in sd}
    for ac in a.findall('.//m:c',NS):
        address=ac.get('r');rn=int(re.search(r'\d+',address)[0]);row=rows.get(rn)
        if row is None:row=E.SubElement(sd,T('row'),r=str(rn),ht='70',customHeight='1');rows[rn]=row
        old=row.find('m:c[@r="'+address+'"]',NS);c=inline(copy.deepcopy(ac),ss);c.set('s',old.get('s') if old is not None else '3')
        if old is not None:row.replace(old,c)
        else:row.append(c)
        if rn in [2,3,4]:row.set('ht','72');row.set('customHeight','1')
    merges=t.find(T('mergeCells'));existing={x.get('ref') for x in merges}
    for rn in [119,120,121]:
        ref=f'A{rn}:D{rn}'
        if ref not in existing:E.SubElement(merges,T('mergeCell'),ref=ref)
    merges.set('count',str(len(merges)));t.find(T('dimension')).set('ref','A1:D121');parts['xl/worksheets/sheet1.xml']=xml(t)
    save(parts,TARGET);projection(parts,WORK/'after-view.xlsx',True)
    print('Assembled v16 lifecycle overlay; historical assessment cells and caches preserved.')
if __name__=='__main__':globals()[sys.argv[1]]()
