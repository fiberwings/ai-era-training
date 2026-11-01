import importlib.util
from pathlib import Path
import tempfile
import unittest
import zipfile
from xml.sax.saxutils import escape

spec = importlib.util.spec_from_file_location('feedback_import', Path(__file__).parents[1] / 'scripts/import_feedback.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class FeedbackImportTests(unittest.TestCase):
    def row(self):
        return dict(zip(module.FIELDS, ['TR-001', 'Example course', 'entry', 'AI-assisted work', 'version-1',
                                       '2026-10-30', '4', 'About right', '1.5', 'Useful & practical', 'response-1']))

    def test_types_and_deduplication(self):
        result = module.convert([self.row(), {**self.row(), 'USEFULNESS': '5'}])
        self.assertEqual(len(result['feedback']), 1)
        self.assertEqual(result['feedback'][0]['usefulness'], 5)
        self.assertEqual(result['feedback'][0]['actualHours'], 1.5)
        self.assertNotIn('Email', result['feedback'][0])

    def test_bad_values_and_optional_fields(self):
        with self.assertRaises(ValueError):
            module.convert([{**self.row(), 'USEFULNESS': '6'}])
        with self.assertRaises(ValueError):
            module.convert([{**self.row(), 'RESPONSE_ID': ''}])
        with self.assertRaises(ValueError):
            module.convert([{**self.row(), 'ACTUAL_HOURS': 'NaN'}])
        row = module.convert([{**self.row(), 'ACTUAL_HOURS': '', 'COMMENT': ''}])['feedback'][0]
        self.assertIsNone(row['actualHours'])

    def test_reads_first_worksheet_from_relationship_without_changing_source(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'forms.xlsx'
            rows = []
            for index, values in enumerate([module.FIELDS, list(self.row().values())], 1):
                cells = [f'<c r="{chr(65+i)}{index}" t="inlineStr"><is><t>{escape(value)}</t></is></c>' for i, value in enumerate(values)]
                rows.append(f'<row r="{index}">{"".join(cells)}</row>')
            with zipfile.ZipFile(path, 'w') as archive:
                archive.writestr('xl/workbook.xml', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Responses" sheetId="3" r:id="rId3"/></sheets></workbook>')
                archive.writestr('xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="rId3" Target="worksheets/sheet3.xml"/></Relationships>')
                archive.writestr('xl/worksheets/sheet3.xml', '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + ''.join(rows) + '</sheetData></worksheet>')
            before = path.read_bytes()
            result = module.convert(module.read_xlsx(path))
            self.assertEqual(result['feedback'][0]['comment'], 'Useful & practical')
            self.assertEqual(path.read_bytes(), before)


if __name__ == '__main__':
    unittest.main()
