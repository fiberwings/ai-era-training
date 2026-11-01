"""Independent Excel and package checks for the browser's exported workbook."""
import sys
from pathlib import Path
from zipfile import ZipFile
import openpyxl

original, exported = map(Path, sys.argv[1:])
with ZipFile(original) as before, ZipFile(exported) as after:
    assert after.testzip() is None
    changed = {name for name in before.namelist() if before.read(name) != after.read(name)}
    has_proposals = 'xl/worksheets/proposed1.xml' in before.namelist()
    assert changed == ({'xl/worksheets/proposed1.xml'} if has_proposals else {'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', '[Content_Types].xml'}), changed
    added = set(after.namelist()) - set(before.namelist())
    assert added == (set() if has_proposals else {'xl/worksheets/proposed1.xml'}), added
    # Every original worksheet, formula cache, style, table and relationship is intact.
w = openpyxl.load_workbook(exported, read_only=False, data_only=False)
s = w['Proposed training']
original_workbook = openpyxl.load_workbook(original, read_only=True, data_only=False)
existing = list(original_workbook['Proposed training'].values)[1:] if has_proposals else []
assert s.max_row == 3 + len(existing) and s.max_column == 18
assert list(s.values)[1:1+len(existing)] == existing
# Check the added fixture records with the original positional assertions below.
original_filter = s.auto_filter.ref
if existing:
    s.delete_rows(2, len(existing))
assert s['A2'].value == '=Literal title & review' and s['A2'].data_type == 's'
assert s['B2'].value == 'Trainer\nCo-owner'
assert s['C2'].value == 0 and s['C2'].data_type == 'n'
assert s['C3'].value is None
assert s['D2'].value == 'In development' and s['D3'].value == 'Ready'
assert s['E2'].value == 'Line one\nLine two <practice> "quotes"'
assert s['F2'].value == 'N1.1\nN2.1'
assert s['H2'].value == 'Foundation' and s['H3'].value == 'L1 Entry'
assert s['P2'].value == s['P3'].value == 'excel-roundtrip'
assert s['Q2'].value == 'foundation' and s['Q3'].value == 'l1'
assert s.freeze_panes == 'B2' and original_filter == f'A1:R{3+len(existing)}'
assert s['A1'].fill.fgColor.rgb == 'FF1F3A5F'
assert s['A2'].alignment.wrap_text and len(s.data_validations.dataValidation) == 2
print('Native Excel records, types, formatting and all original workbook parts verified.')
# The maintenance importer retains proposals without adding assessment credit.
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from catalogue_io import read_catalogue
import json
catalogue, checked = read_catalogue(exported)
assert checked > 0
baseline = json.loads((Path(__file__).resolve().parents[1] / 'public/data/catalogue.json').read_text())
proposals = catalogue.pop('proposedTraining')
assert len(proposals['rows']) == len(existing)+2 and proposals['rows'][len(existing)][2] == 0
baseline.pop('proposedTraining', None)
for key in ['version','sourceSha256','filename']:
    catalogue.pop(key, None); baseline.pop(key, None)
assert catalogue == baseline
