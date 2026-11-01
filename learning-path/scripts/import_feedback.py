"""Convert a Microsoft Forms XLSX/CSV export to learner-app feedback JSON.

Standard library only. Reads cached cell values; never evaluates formulas.
Question titles must match the placeholders documented in the app.
"""
import argparse
import csv
import datetime as dt
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import zipfile

FIELDS = ['COURSE_ID', 'COURSE_TITLE', 'GROUP_ID', 'GROUP_NAME', 'CATALOGUE_VERSION',
          'COMPLETED_ON', 'USEFULNESS', 'DIFFICULTY', 'ACTUAL_HOURS', 'COMMENT', 'RESPONSE_ID']
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def read_xlsx(source):
    with zipfile.ZipFile(source) as archive:
        if sum(i.file_size for i in archive.infolist()) > 80 * 1024 * 1024:
            raise ValueError('Expanded workbook exceeds the 80 MB limit.')
        names = archive.namelist()
        shared = []
        if 'xl/sharedStrings.xml' in names:
            xml = ET.fromstring(archive.read('xl/sharedStrings.xml'))
            shared = [''.join(x.itertext()) for x in xml.findall('m:si', NS)]
        # Resolve the workbook's first sheet via its relationship, rather than
        # assuming a worksheet filename or extracting archive paths to disk.
        wb = ET.fromstring(archive.read('xl/workbook.xml'))
        sheet = wb.find('m:sheets/m:sheet', NS)
        if sheet is None:
            raise ValueError('No worksheet found.')
        relid = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        relationships = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
        target = next((r.get('Target') for r in relationships if r.get('Id') == relid), None)
        if not target:
            raise ValueError('Worksheet relationship is missing.')
        member = target.lstrip('/') if target.startswith('/') else 'xl/' + target
        if '..' in member.split('/') or member not in names:
            raise ValueError('Unsupported worksheet location.')
        xml = ET.fromstring(archive.read(member))
        rows = []
        for row in xml.findall('m:sheetData/m:row', NS):
            values = {}
            for cell in row.findall('m:c', NS):
                ref = cell.get('r', '')
                match = re.match(r'^([A-Z]+)\d+$', ref)
                if not match:
                    raise ValueError('Invalid cell address.')
                col = 0
                for char in match[1]:
                    col = col * 26 + ord(char) - 64
                if col > 1000:
                    raise ValueError('Too many workbook columns.')
                value = cell.find('m:v', NS)
                text = value.text or '' if value is not None else ''
                kind = cell.get('t')
                if kind == 's':
                    text = shared[int(text)]
                elif kind == 'inlineStr':
                    text = ''.join(t.text or '' for t in cell.findall('.//m:t', NS))
                values[col - 1] = text
            if values:
                rows.append([values.get(i, '') for i in range(max(values) + 1)])
            if len(rows) > 10001:
                raise ValueError('Split response exports into files of at most 10,000 responses.')
        if not rows:
            raise ValueError('The workbook is empty.')
        headers = [str(h).strip() for h in rows[0]]
        if len(headers) != len(set(headers)):
            raise ValueError('Duplicate column titles.')
        return [dict(zip(headers, row + [''] * (len(headers) - len(row)))) for row in rows[1:]]


def convert(rows):
    responses = {}
    for index, row in enumerate(rows, 2):
        if not any(row.values()):
            continue
        missing = [key for key in FIELDS if key not in row]
        if missing:
            raise ValueError('Missing question columns: ' + ', '.join(missing))
        rating = float(row['USEFULNESS'])
        hours = float(row['ACTUAL_HOURS']) if str(row['ACTUAL_HOURS']).strip() else None
        if rating not in [1, 2, 3, 4, 5] or row['DIFFICULTY'] not in ['Too basic', 'About right', 'Too advanced']:
            raise ValueError(f'Invalid rating or difficulty in row {index}.')
        if hours is not None and not (0 <= hours <= 10000):
            raise ValueError(f'Invalid hours in row {index}.')
        for key in ['COURSE_ID', 'COURSE_TITLE', 'GROUP_ID', 'GROUP_NAME', 'CATALOGUE_VERSION', 'RESPONSE_ID']:
            if not str(row[key]).strip():
                raise ValueError(f'Missing {key} in row {index}.')
        date = str(row['COMPLETED_ON'])
        if date and not re.fullmatch(r'\d{4}-\d{2}-\d{2}', date):
            try:
                date = (dt.datetime(1899, 12, 30) + dt.timedelta(days=float(date))).date().isoformat()
            except (ValueError, OverflowError):
                raise ValueError(f'Invalid completion date in row {index}.') from None
        comment = str(row['COMMENT'])
        if len(comment) > 1200:
            raise ValueError(f'Comment exceeds 1200 characters in row {index}.')
        f = dict(id=str(row['RESPONSE_ID']), courseId=str(row['COURSE_ID']), courseTitle=str(row['COURSE_TITLE']),
                 groupId=str(row['GROUP_ID']), groupName=str(row['GROUP_NAME']), catalogueVersion=str(row['CATALOGUE_VERSION']),
                 completedOn=date, usefulness=int(rating), difficulty=str(row['DIFFICULTY']), actualHours=hours, comment=comment)
        responses[f['id']] = f
    return {'schema': 'ai-learning-feedback/1', 'feedback': list(responses.values())}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve():
        parser.error('Choose a separate output file; the source is read-only.')
    if args.source.stat().st_size > 30 * 1024 * 1024:
        parser.error('Source exceeds 30 MB.')
    if args.source.suffix.lower() == '.xlsx':
        rows = read_xlsx(args.source)
    elif args.source.suffix.lower() == '.csv':
        with args.source.open(encoding='utf-8-sig', newline='') as stream:
            rows = list(csv.DictReader(stream))
    else:
        parser.error('Use a .xlsx or UTF-8 .csv Forms export.')
    result = convert(rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Converted {len(result['feedback'])} unique feedback responses to {args.output.name}")


if __name__ == '__main__':
    main()
