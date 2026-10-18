"""Small native-format extracts for artifact-tool visual verification only."""
from workbook_xml import *
import sys
file=pathlib.Path(sys.argv[1]);sheetnum=int(sys.argv[2]);rows=[int(i) for i in sys.argv[3].split(',')];out=sys.argv[4]
with zipfile.ZipFile(file) as z:
    root=E.fromstring(z.read(f'xl/worksheets/sheet{sheetnum}.xml'))
    sd=root.find(tag('sheetData'));selected=[]
    for dest,orig in enumerate(rows,1):
        r=copy.deepcopy(sd.find(f"m:row[@r='{orig}']",NS));r.set('r',str(dest))
        for c in r:
            c.set('r',re.sub(r'\d+',str(dest),c.get('r')))
            f=c.find(tag('f'))
            if f is not None:c.remove(f)
        selected.append(r)
    sd.clear();sd.extend(selected)
    for name in ['conditionalFormatting','dataValidations','tableParts','drawing','legacyDrawing','hyperlinks','extLst']:
        for e in root.findall(tag(name)):root.remove(e)
    merges=root.find(tag('mergeCells'))
    if merges is not None:
        for merge in list(merges):
            a,b=merge.get('ref').split(':');ar=int(re.search(r'\d+',a).group());br=int(re.search(r'\d+',b).group())
            if ar in rows and br in rows:
                merge.set('ref',re.sub(r'\d+',str(rows.index(ar)+1),a)+':'+re.sub(r'\d+',str(rows.index(br)+1),b))
            else:merges.remove(merge)
        merges.set('count',str(len(merges)))
    for v in root.findall('m:sheetViews/m:sheetView',NS):
        for p in list(v):v.remove(p)
    root.find(tag('dimension')).set('ref',f'A1:P{len(rows)}')
    wb=E.Element(tag('workbook'),nsmap={None:M,'r':REL});s=E.SubElement(wb,tag('sheets'))
    E.SubElement(s,tag('sheet'),name='Preview',sheetId='1',attrib={'{'+REL+'}id':'rId1'})
    rels=f'<Relationships xmlns="{PKG}"><Relationship Id="rId1" Type="{REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="{REL}/styles" Target="styles.xml"/><Relationship Id="rId3" Type="{REL}/sharedStrings" Target="sharedStrings.xml"/></Relationships>'
    typ=f'<Types xmlns="{CT}"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>'
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as target:
        target.writestr('[Content_Types].xml',typ);target.writestr('xl/workbook.xml',xml(wb));target.writestr('xl/_rels/workbook.xml.rels',rels)
        target.writestr('_rels/.rels',f'<Relationships xmlns="{PKG}"><Relationship Id="rId1" Type="{REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        target.writestr('xl/worksheets/sheet1.xml',xml(root))
        for n in ['styles.xml','sharedStrings.xml']:target.writestr('xl/'+n,z.read('xl/'+n))
print(out)
