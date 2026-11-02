"""Read-only verification of the retirement overlay, active evidence and archives."""
from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
import hashlib,json,sys
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'training-planner/scripts'))
from catalogue_io import read_catalogue
hashfile=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
load=lambda p:json.loads((ROOT/p).read_text())
old=load('training-planner/catalogue-history/ff6d5a46d0450171.json')
new=load('training-planner/public/data/catalogue.json')
assert new['filename']=='AI_Era_Cyber_Training_Catalogue_v16.xlsx'
a=ROOT/'archive/catalogues'/old['filename'];b=ROOT/'catalogue'/new['filename']
assert hashfile(a)==old['sourceSha256'] and hashfile(b)==new['sourceSha256']
expected,checked=read_catalogue(b);assert expected==new and checked==9591
retired={c['id'] for c in new['retiredCourses']}
assert retired=={c['id'] for c in load('analysis/catalogue-freshness-review/inputs/review.json')['retire']}
assert new['courses']==[c for c in old['courses'] if c['id'] not in retired]
for key in ['requirements','needs','thresholds','buildItems','proposedTraining']:assert new[key]==old[key],key
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
t=lambda k:'{'+ns['m']+'}'+k
with ZipFile(a) as za,ZipFile(b) as zb:
    changes=[p for p in za.namelist() if za.read(p)!=zb.read(p)]
    allowed={'[Content_Types].xml','xl/workbook.xml','xl/_rels/workbook.xml.rels','xl/styles.xml','xl/worksheets/sheet1.xml','xl/worksheets/sheet10.xml','xl/worksheets/sheet11.xml','xl/tables/table5.xml','xl/tables/table10.xml'}
    assert set(changes)==allowed,changes
    for sn,col in [(10,'Z'),(11,'O')]:
        p=f'xl/worksheets/sheet{sn}.xml';before=E.fromstring(za.read(p));after=E.fromstring(zb.read(p))
        cells={c.get('r'):E.tostring(c) for c in after.findall('.//m:c',ns)}
        for c in before.findall('.//m:c',ns):assert cells[c.get('r')]==E.tostring(c),c.get('r')
        for c in after.findall('.//m:c[m:f]',ns):assert c.find(t('v')) is not None,c.get('r')
    for sn,colid in [(5,'25'),(10,'14')]:
        r=E.fromstring(zb.read(f'xl/tables/table{sn}.xml'))
        assert r.find('m:autoFilter/m:filterColumn',ns).get('colId')==colid
        assert r.find('m:autoFilter/m:filterColumn/m:filters/m:filter',ns).get('val')=='Active'
        assert r.find('m:tableColumns',ns)[-1].get('name')=='Lifecycle'
    for c in (c for p in zb.namelist() if p.startswith('xl/worksheets/') and p.endswith('.xml') for c in E.fromstring(zb.read(p)).findall('.//m:c[@t="e"]',ns)):
        raise AssertionError('Formula error '+c.get('r'))
    order=[E.QName(c).localname for c in E.fromstring(zb.read('xl/worksheets/retirements.xml'))]
    assert order.index('autoFilter')<order.index('pageMargins')
    x=E.fromstring(za.read('xl/styles.xml')).find(t('cellXfs'));y=E.fromstring(zb.read('xl/styles.xml')).find(t('cellXfs'))
    assert [E.tostring(v) for v in x]==[E.tostring(v) for v in list(y)[:len(x)]]
manifest=HERE/'historical-integrity.json'
if manifest.exists():
    for p,h in json.loads(manifest.read_text()).items():assert hashfile(ROOT/p)==h,p
report={'date':'2026-11-02','catalogueVersion':new['version'],'workbookSha256':new['sourceSha256'],'activeResources':len(new['courses']),'retiredResources':len(retired),'numericScores':sum(len(c['scores']) for c in new['courses']),'explicitUnassessedRows':sum(len(c['unassessed']) for c in new['courses']),'reconciledHistoricalCoverageRows':checked,'retainedCourseObjects':'Identical to v15','outcomesAndNeeds':'140 outcomes and 23 scoring groups unchanged','proposedInternalBrief':'Unchanged','originalAssessmentWorksheets':'Byte-identical; existing Offers/Tool track cells and style indices preserved','formulaErrors':0,'historicalFilesVerified':len(json.loads(manifest.read_text())) if manifest.exists() else 0}
if '--write' in sys.argv:(HERE/'workbook-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
