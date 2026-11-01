from pathlib import Path
import copy
import json
import re
import zipfile
import xml.etree.ElementTree as E

P = Path(__file__).resolve().parent
NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
for prefix, uri in NS.items():
    E.register_namespace(prefix, uri)

with zipfile.ZipFile(P / 'source.pptx') as source, zipfile.ZipFile(P / 'authored.pptx') as authored:
    payload = {name: source.read(name) for name in source.namelist()}
    added = set(authored.namelist()) - set(source.namelist())
    assert len(added) >= 8, added
    payload.update({name: authored.read(name) for name in added})

    root = E.fromstring(payload['ppt/presentation.xml'])
    fresh = E.fromstring(authored.read('ppt/presentation.xml'))
    slist = root.find('p:sldIdLst', NS)
    new_slides = list(fresh.find('p:sldIdLst', NS))[-2:]
    assert len(slist) == 10
    for element in new_slides:
        slist.append(copy.deepcopy(element))
    payload['ppt/presentation.xml'] = E.tostring(root, encoding='utf-8', xml_declaration=True)

    rel_path = 'ppt/_rels/presentation.xml.rels'
    rels = E.fromstring(payload[rel_path])
    required = {item.get('{'+NS['r']+'}id') for item in new_slides}
    for element in E.fromstring(authored.read(rel_path)):
        if element.get('Id') in required:
            rels.append(copy.deepcopy(element))
    E.register_namespace('', 'http://schemas.openxmlformats.org/package/2006/relationships')
    payload[rel_path] = E.tostring(rels, encoding='utf-8', xml_declaration=True)

    ctype = E.fromstring(payload['[Content_Types].xml'])
    known = {(item.tag, item.get('PartName'), item.get('Extension')) for item in ctype}
    for element in E.fromstring(authored.read('[Content_Types].xml')):
        key = (element.tag, element.get('PartName'), element.get('Extension'))
        if key not in known:
            ctype.append(copy.deepcopy(element))
    E.register_namespace('', 'http://schemas.openxmlformats.org/package/2006/content-types')
    payload['[Content_Types].xml'] = E.tostring(ctype, encoding='utf-8', xml_declaration=True)
    payload['docProps/app.xml'] = re.sub(rb'(<ap:(?:Slides|Notes)>)[0-9]+', rb'\g<1>12', payload['docProps/app.xml'])

    # Every original slide, note, relationship, layout, master and media part is retained byte for byte.
    allowed = {'ppt/presentation.xml', rel_path, '[Content_Types].xml', 'docProps/app.xml'}
    preserved = [name for name in source.namelist() if name not in allowed]
    assert all(payload[name] == source.read(name) for name in preserved)

    with zipfile.ZipFile(P / 'candidate.pptx', 'w', zipfile.ZIP_DEFLATED) as output:
        for name, data in payload.items():
            output.writestr(name, data)

    print(json.dumps({'slides': len(slist), 'preserved_parts': len(preserved), 'added_parts': sorted(added)}))
