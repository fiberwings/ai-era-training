from pathlib import Path
import zipfile,re,xml.etree.ElementTree as E

build=Path(__file__).resolve().parent
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(build/'source.pptx') as source,zipfile.ZipFile(build/'authored.pptx') as authored,zipfile.ZipFile(build/'candidate.pptx','w',zipfile.ZIP_DEFLATED) as result:
    for name in source.namelist():
        content=source.read(name)
        if name=='ppt/slides/slide1.xml':
            original=E.fromstring(content)
            xml=authored.read(name).decode('utf-8-sig')
            shapes=re.findall(r'<p:sp\b[^>]*>.*?</p:sp>',xml,re.S)
            added=[s for s in shapes if any(f'name="{n}"' in s for n in ['prepared-by','version-date'])]
            assert len(added)==2
            maximum=max(int(x.get('id')) for x in original.findall('.//p:cNvPr',ns))
            for i,shape in enumerate(added,1):
                shape=re.sub(r'(<p:cNvPr\s+id=")[^"]+',lambda m:m[1]+str(maximum+i),shape,count=1)
                content=content.replace(b'</p:spTree>',shape.encode()+b'</p:spTree>')
            check=E.fromstring(content)
            text=' '.join(check.itertext())
            assert 'Prepared by Marco Ceci - GBIS ASIA CISO' in text
            assert 'Version 1, 18 October 2026' in text
            assert 'DRAFT FOR DISCUSSION' in text
        result.writestr(name,content)
print('All pre-existing content preserved. Only two text shapes added to slide 1.')
