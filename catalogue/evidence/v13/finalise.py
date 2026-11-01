"""Verify retained choices and package the tested catalogue release."""
from pathlib import Path
import hashlib, json, zipfile

ROOT = Path(__file__).resolve().parents[3]
def read(p): return json.loads((ROOT/p).read_text())
def write(p, data): (ROOT/p).write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
def sha(raw): return hashlib.sha256(raw).hexdigest()

cat = read('training-planner/public/data/catalogue.json')
verification = read('catalogue/evidence/v13/verification.json')
assert cat['version'] == verification['snapshot']
assert sha((ROOT/'catalogue'/cat['filename']).read_bytes()) == cat['sourceSha256'] == verification['sha256']
for name, ignored in [('default-scenario', {'catalogueVersion','assumptions'}),
                      ('component-starter', {'catalogueVersion','catalogueIdentity'})]:
    before = read(f'.work/catalogue/v13/{name}-before.json')
    after = read(f'training-planner/public/data/{name}.json')
    assert {k:v for k,v in before.items() if k not in ignored} == {k:v for k,v in after.items() if k not in ignored}
model_before = (ROOT/'.work/catalogue/v13/model-before.md').read_text()
model_after = (ROOT/'capability-framework/Agentic-Era_Workforce_Capability_Model.md').read_text()
assert model_before.rsplit('Assessment source:',1)[0] == model_after.rsplit('Assessment source:',1)[0]

packages = []
for app, version, source, dest, member in [
    ('Training Planner','2.1.1','training-planner/Training-Planner.html','training-planner/2.1.1/Training-Planner.zip','Training-Planner.html'),
    ('My AI Learning Path','1.3.2','learning-path/index.html','learning-path/1.3.2/My-AI-Learning-Path.zip','index.html')]:
    raw = (ROOT/source).read_bytes()
    assert cat['version'].encode() in raw and cat['filename'].encode() in raw
    path = ROOT/'releases'/dest
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
        archive.writestr(member,raw)
    with zipfile.ZipFile(path) as archive:
        assert archive.testzip() is None and archive.namelist() == [member] and archive.read(member) == raw
    packages.append(dict(app=app, version=version, releaseDate='2026-11-01', package=dest,
                         sha256=sha(path.read_bytes()), source=source, member=member, memberSha256=sha(raw)))
write('releases/manifest.json', dict(packagedOn='2026-11-01', catalogueVersion=cat['version'],
      catalogueWorkbook=cat['filename'], modelVersion=2, modelRevision=3,
      defaults='Selections, overrides and budgets retained; catalogue identity reviewed and refreshed',packages=packages))
write('catalogue/evidence/v13/release-verification.json', dict(
    catalogue=cat['version'],workbookSha256=cat['sourceSha256'],
    regressionChecks=dict(plannerJavaScript=72,plannerPython=17,learnerJavaScript=65,learnerPython=3,failed=0),
    testNotes=['Planner Python server test passed with temporary loopback-port permission.',
               'Historical Anthropic preservation check now compares its frozen v12 snapshot; current Anthropic outcome checks remain on the live catalogue.'],
    browser=dict(method='Computer Use browser, local HTTP previews',
                 planner='2.1.1; TR-280 details show 140 outcomes, 5 full, 89 partial/mentioned, 46 zero; 60h planning time and provisional evidence limits.',
                 learner='1.3.2; 529 resources, v13; ISC2 bundle search/detail shows six courses, 16h, revised evidence, costs and limits.',
                 consoleErrors=[],savedCourseSelectionsChanged=False),
    retainedDefaultsVerified=True,modelBodyUnchanged=True,modelVersion=2,modelRevision=3,
    packagesVerified=True,nativeExcel='Unavailable; original formulas retained and all 9476 saved Coverage results independently reconciled.'))
print('Retained choices and model verified; both release packages match their rebuilt apps.')
