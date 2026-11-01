"""Assemble Artifact Tool-authored cells without round-tripping native features."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
from collections import Counter
import re,json,copy,sys
ROOT=Path(__file__).resolve().parents[3]
P=Path(__file__).resolve().parent
W=ROOT/'.work/catalogue/v14'
SRC=ROOT/'catalogue/AI_Era_Cyber_Training_Catalogue_v13.xlsx'
if not SRC.exists():SRC=ROOT/'archive/catalogues/AI_Era_Cyber_Training_Catalogue_v13.xlsx'
DST=ROOT/'catalogue/AI_Era_Cyber_Training_Catalogue_v14.xlsx'
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
_row_cache={}
def row_index(t):
    if t not in _row_cache:_row_cache[t]={row.get('r'):row for row in t.find(T('sheetData'))}
    return _row_cache[t]
def put(t,addr,v,cache=False):
    rn=re.search(r'\d+',addr)[0];sd=t.find(T('sheetData'));rows=row_index(t);row=rows.get(rn)
    if row is None:row=E.SubElement(sd,T('row'),r=rn);rows[rn]=row
    c=row.find(f'm:c[@r="{addr}"]',NS)
    if c is None:c=E.SubElement(row,T('c'),r=addr)
    for x in list(c):
        if not(cache and x.tag==T('f')):c.remove(x)
    c.attrib.pop('t',None)
    if v is None:return
    if isinstance(v,(int,float)):E.SubElement(c,T('v')).text=str(v)
    elif cache:c.set('t','str');E.SubElement(c,T('v')).text=str(v)
    else:c.set('t','inlineStr');s=E.SubElement(c,T('is'));E.SubElement(s,T('t')).text=str(v)
def clone_row(t,old,new):
    sd=t.find(T('sheetData'));rows=row_index(t);row=copy.deepcopy(rows[str(old)]);row.set('r',str(new))
    for c in row:c.set('r',re.sub(r'\d+',str(new),c.get('r')))
    sd.append(row);rows[str(new)]=row;return row
def extend(parts,sn,table,end):
    tp=f'xl/tables/table{table}.xml';t=E.fromstring(parts[tp]);old=t.get('ref');new=re.sub(r'\d+$',str(end),old);t.set('ref',new)
    if t.find(T('autoFilter')) is not None:t.find(T('autoFilter')).set('ref',new)
    parts[tp]=xml(t);t=tree(parts,sn);t.find(T('dimension')).set('ref',new)
    oldend=int(re.search(r'\d+$',old)[0])
    for x in t.findall('m:conditionalFormatting',NS)+t.findall('m:dataValidations/m:dataValidation',NS):
        if x.get('sqref'):x.set('sqref',re.sub(rf'(?<=[A-Z]){oldend}(?=\s|$)',str(end),x.get('sqref')))
    parts[f'xl/worksheets/sheet{sn}.xml']=xml(t)
def projection(parts,path,after=False):
    parts=parts.copy()
    for sn in range(1,17):
        t=tree(parts,sn);sd=t.find(T('sheetData'))
        keep={1,413}|(set(range(414,419)) if after else set())
        if sn==6:keep={1}|(set(range(9478,9483)) if after else {9477})
        for row in list(sd):
            if not(sn in [6,10] and int(row.get('r')) in keep):sd.remove(row)
        for c in t.findall('.//m:c[m:f]',NS):c.remove(c.find(T('f')))
        for name in ['tableParts','drawing','legacyDrawing','conditionalFormatting','dataValidations','hyperlinks']:
            for x in t.findall('m:'+name,NS):t.remove(x)
        parts[f'xl/worksheets/sheet{sn}.xml']=xml(t);parts.pop(f'xl/worksheets/_rels/sheet{sn}.xml.rels',None)
    parts={k:v for k,v in parts.items() if not k.startswith(('xl/tables/','xl/drawings/')) and k!='xl/calcChain.xml'}
    save(parts,path)
def apply():
    parts=load(SRC);a=load(W/'authored.xlsx');ss=strings(a);authored=[]
    for row in tree(a,1).find(T('sheetData')):
        if row.get('r')=='1':continue
        cs={re.sub(r'\d','',c.get('r')):value(c,ss) for c in row};authored.append([int(cs['A']),cs['B'],cs.get('C')])
    assert authored==json.loads((P/'edits.json').read_text())
    ts={sn:tree(parts,sn) for sn in [1,5,6,10]}
    for rn in range(414,419):
        row=clone_row(ts[10],413,rn);row.set('ht','150')
    for rn in range(58093,58793):clone_row(ts[5],58092,rn)
    for rn in range(9478,9593):clone_row(ts[6],9477,rn)
    for sn,addr,v in authored:put(ts[sn],addr,v)
    merges=ts[1].find(T('mergeCells'));template=cells(ts[1])['A113']
    for rn in range(115,119):
        row=ts[1].find(f'm:sheetData/m:row[@r="{rn}"]',NS);row.set('ht','24' if rn==115 else '80');row.set('customHeight','true')
        row.find(f'm:c[@r="A{rn}"]',NS).set('s',template.get('s'))
        E.SubElement(merges,T('mergeCell'),ref=f'A{rn}:D{rn}')
    merges.set('count',str(len(merges)));ts[1].find(T('dimension')).set('ref','A1:D118')
    for sn,t in ts.items():parts[f'xl/worksheets/sheet{sn}.xml']=xml(t)
    extend(parts,10,5,418);extend(parts,5,8,58792);extend(parts,6,2,9592)
    save(parts,W/'uncached.xlsx');projection(load(SRC),W/'before-view.xlsx')
    print('Assembled 5 Offers, 700 Scores and 115 Coverage rows; original formulas/features retained.')
def cache():
    parts=load(W/'uncached.xlsx');results=json.loads((W/'calculated-caches.json').read_text())
    ts={sn:tree(parts,sn) for sn in {int(r[0]) for r in results}}
    for sn,addr,v in results:
        assert v is not None and not str(v).startswith('#'),(sn,addr,v)
        put(ts[int(sn)],addr,v,True)
    for sn,t in ts.items():parts[f'xl/worksheets/sheet{sn}.xml']=xml(t)
    counts=Counter();ss=strings(parts)
    for row in tree(parts,6).find(T('sheetData')):
        rn=row.get('r');cid=value(row.find(f'm:c[@r="A{rn}"]',NS),ss)
        if value(row.find(f'm:c[@r="M{rn}"]',NS),ss) in ['Full','Strong']:counts[cid]+=1
    t=tree(parts,10)
    for rn,cid in enumerate(['TR-281','TR-282','TR-283','TR-284','TR-285'],414):put(t,f'W{rn}',counts[cid])
    relpath='xl/worksheets/_rels/sheet10.xml.rels';rels=E.fromstring(parts[relpath]);ridns='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    for rn,c in enumerate(json.loads((P/'sources.json').read_text())['selected'],414):
        rid='rIdV14'+c['id'];E.SubElement(rels,'{http://schemas.openxmlformats.org/package/2006/relationships}Relationship',Id=rid,Type=ridns+'/hyperlink',Target=c['url'],TargetMode='External')
        E.SubElement(t.find(T('hyperlinks')),T('hyperlink'),ref=f'S{rn}',display=c['url'],attrib={'{'+ridns+'}id':rid})
    parts[relpath]=xml(rels);parts['xl/worksheets/sheet10.xml']=xml(t)
    save(parts,DST);projection(parts,W/'after-view.xlsx',True)
    print('Saved',DST.name,'with',len(results),'recalculated dependency results.')
if __name__=='__main__':globals()[sys.argv[1]]()
