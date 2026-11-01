from pathlib import Path
import zipfile,xml.etree.ElementTree as E
build=Path(__file__).resolve().parent
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(build/'source.pptx') as source,zipfile.ZipFile(build/'authored.pptx') as authored,zipfile.ZipFile(build/'candidate.pptx','w',zipfile.ZIP_DEFLATED) as result:
    root=E.fromstring(authored.read('ppt/slides/slide1.xml'))
    selected=[s for s in root.findall('.//p:sp',ns) if s.find('p:nvSpPr/p:cNvPr',ns).get('name')=='prepared-by']
    assert len(selected)==1
    new_text=''.join(t.text or '' for t in selected[0].findall('.//a:t',ns))
    assert new_text=='Marco Ceci - GBIS Asia CISO'
    for name in source.namelist():
        content=source.read(name)
        if name=='ppt/slides/slide1.xml':
            old=b'Prepared by Marco Ceci - GBIS ASIA CISO'
            assert content.count(old)==1
            content=content.replace(old,new_text.encode())
        result.writestr(name,content)
print('Preserved the presentation package with only the requested text changed.')
