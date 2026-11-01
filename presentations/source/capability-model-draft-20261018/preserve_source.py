from pathlib import Path
import zipfile,re,xml.etree.ElementTree as E

build=Path(__file__).resolve().parent
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(build/'source.pptx') as source,zipfile.ZipFile(build/'authored.pptx') as authored,zipfile.ZipFile(build/'candidate.pptx','w',zipfile.ZIP_DEFLATED) as result:
    changed=[]
    for name in source.namelist():
        content=source.read(name)
        if re.fullmatch(r'ppt/slides/slide\d+\.xml',name):
            original=E.fromstring(content)
            assert not any(x.get('name')=='draft-for-discussion' for x in original.findall('.//p:cNvPr',ns))
            xml=authored.read(name).decode('utf-8-sig')
            shapes=re.findall(r'<p:sp\b[^>]*>.*?</p:sp>',xml,re.S)
            added=[s for s in shapes if 'name="draft-for-discussion"' in s]
            assert len(added)==1,(name,len(added))
            maximum=max(int(x.get('id')) for x in original.findall('.//p:cNvPr',ns))
            shape=re.sub(r'(<p:cNvPr\s+id=")[^"]+',lambda m:m[1]+str(maximum+1),added[0],count=1)
            # Inject only the newly authored editable text shape. Every existing object remains untouched.
            content=content.replace(b'</p:spTree>',shape.encode()+b'</p:spTree>')
            check=E.fromstring(content)
            matches=[x for x in check.findall('.//p:sp',ns) if x.find('p:nvSpPr/p:cNvPr',ns).get('name')=='draft-for-discussion']
            assert len(matches)==1
            assert ''.join(matches[0].itertext())=='DRAFT FOR DISCUSSION'
            colors=[x.get('val') for x in matches[0].findall('.//a:srgbClr',ns)]
            assert colors and all(c in ['C62828','FF6B6B'] for c in colors)
            changed.append(name)
        result.writestr(name,content)
    assert len(changed)==10
    print('Preserved existing content and added one red disclaimer on every slide.')
