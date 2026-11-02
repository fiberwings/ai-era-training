"""Read-only workbook import and independent reconciliation. No Excel writes."""
import hashlib
import json
import math
from datetime import date, datetime
from pathlib import Path


def require(condition, message):
    if not condition:
        raise ValueError(message)


def numeric(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def records(workbook, sheet, required=()):
    require(sheet in workbook.sheetnames, 'Missing sheet: ' + sheet)
    it = workbook[sheet].iter_rows(values_only=True)
    headers = list(next(it))
    require(all(h in headers for h in required), f'{sheet}: missing columns {set(required) - set(headers)}')
    for row_number, values in enumerate(it, 2):
        if values and values[0] is not None:
            yield row_number, dict(zip(headers, values))


def reference(sheet, row):
    return {'sheet': sheet, 'row': row}


def links(value):
    return [s.strip() for s in str(value or '').splitlines() if s.strip().startswith(('https://', 'http://'))]


def date_text(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()[:10]
    if value:
        try:
            return date.fromisoformat(str(value)[:10]).isoformat()
        except ValueError:
            raise ValueError(f'Unusable assessment date: {value!r}. Recalculate and save Excel.')
    return ''


PROPOSED_HEADERS = ['Title', 'Owner', 'Learner hours', 'Delivery status', 'Teaching and practice',
    'Linked outcome IDs', 'Linked outcome details', 'Component', 'Category', 'Level', 'Specialism ID',
    'Tool', 'Tool tasks', 'Scenario', 'Scenario status', 'Internal item ID', 'Component ID', 'Scenario ID']


def validate_proposed_rows(rows):
    require(isinstance(rows, list), 'Invalid proposed-training rows')
    seen = set()
    for row in rows:
        require(isinstance(row, list) and len(row) == len(PROPOSED_HEADERS), 'Invalid proposed-training columns')
        require(all(isinstance(value, str) for i, value in enumerate(row) if i not in (2, 9)), 'Invalid proposed-training text')
        require(row[0].strip() and all(row[i].strip() for i in (15, 16, 17)), 'Proposed training needs title and original IDs')
        require(row[2] is None or numeric(row[2]) and row[2] >= 0, 'Invalid proposed-training hours')
        require(row[9] is None or numeric(row[9]) and row[9] in range(4), 'Invalid proposed-training level')
        require(row[3] in ('Proposed', 'In development', 'Ready') and row[14] in ('Draft', 'Reviewed', 'Finalised'), 'Invalid proposed-training status')
        key = (row[17], row[16], row[15])
        require(key not in seen, 'Duplicate proposed-training assignment: ' + row[0])
        seen.add(key)


def read_proposed_training(workbook):
    it = workbook['Proposed training'].iter_rows(values_only=True)
    require(list(next(it, [])) == PROPOSED_HEADERS, 'Proposed training: keep the original column headers')
    rows = []
    for values in it:
        if not any(value is not None for value in values):
            continue
        row = [value if value is not None or i in (2, 9) else '' for i, value in enumerate(values)]
        rows.append(row)
    validate_proposed_rows(rows)
    return {'formatVersion': 1, 'columns': PROPOSED_HEADERS, 'rows': rows}


def read_retirements(workbook, courses):
    """The register owns lifecycle; original course/score rows remain evidence."""
    if 'Retirements' not in workbook.sheetnames:
        return []
    result, seen = [], set()
    for row, r in records(workbook, 'Retirements', ('ID', 'Title', 'Retired on', 'Reason', 'Decision', 'Sources')):
        cid = r['ID']
        require(cid in courses and cid not in seen, f'Retirements row {row}: unknown or duplicate course {cid}')
        seen.add(cid)
        require(r['Title'] == courses[cid]['title'], f'Retirements row {row}: title differs from course record')
        require(all(isinstance(r[k], str) and r[k].strip() for k in ('Reason', 'Decision')), f'Retirements row {row}: missing reason or decision')
        retired_on = date_text(r['Retired on'])
        require(bool(retired_on), f'Retirements row {row}: missing retirement date')
        result.append(dict(id=cid, title=r['Title'], provider=courses[cid]['provider'], retiredOn=retired_on,
            reason=r['Reason'], decision=r['Decision'], sources=links(r['Sources']),
            source=reference('Retirements', row), originalSource=courses[cid]['source']))
    for sheet in ('Offers', 'Tool track'):
        for row, r in records(workbook, sheet, ('ID', 'Lifecycle')):
            expected = 'Retired' if r['ID'] in seen else 'Active'
            require(r['Lifecycle'] == expected, f'{sheet} row {row}: Lifecycle mismatch; recalculate and save Excel')
    return result


def validate_snapshot(data):
    require(isinstance(data, dict), 'Catalogue must be an object')
    for key in ('version', 'filename', 'thresholds', 'needs', 'requirements', 'courses', 'buildItems'):
        require(key in data, 'Missing catalogue field: ' + key)
    require(isinstance(data['version'], str) and bool(data['version']), 'Missing catalogue version')
    maps = {}
    for key in ('needs', 'requirements', 'courses'):
        rows = data[key]
        require(isinstance(rows, list) and bool(rows), 'Empty or invalid ' + key)
        require(all(isinstance(r.get('id'), str) and r['id'] for r in rows), 'Missing ID in ' + key)
        maps[key] = {r['id']: r for r in rows}
        require(len(maps[key]) == len(rows), 'Duplicate IDs in ' + key)
    for r in data['requirements']:
        require(r['need'] in maps['needs'], f"Unknown need for {r['id']}")
        require(type(r['rank']) is int and r['rank'] in range(4), f"Invalid level rank for {r['id']}; recalculate and save Excel")
    for c in data['courses']:
        require(isinstance(c.get('scores'), dict), f"Invalid scores for {c['id']}")
        for rid, s in c['scores'].items():
            require(rid in maps['requirements'], f'Unknown requirement {rid}')
            require(type(s.get('score')) is int and s['score'] in range(4), f"Invalid score for {c['id']}/{rid}")
        for rid in c.get('unassessed', {}):
            require(rid in maps['requirements'] and rid not in c['scores'], f'Conflicting assessment for {rid}')
    retired = data.get('retiredCourses', [])
    require(isinstance(retired, list), 'Invalid retired-course register')
    seen_retired = set()
    for c in retired:
        require(isinstance(c, dict) and isinstance(c.get('id'), str) and c['id'], 'Missing retired course ID')
        require(c['id'] not in maps['courses'] and c['id'] not in seen_retired, 'Active/retired course collision: ' + c['id'])
        seen_retired.add(c['id'])
        require(all(isinstance(c.get(k), str) and c[k].strip() for k in ('title', 'reason', 'decision')), 'Incomplete retirement record')
        require(bool(date_text(c.get('retiredOn'))), 'Missing retirement date')
        require('scores' not in c and 'unassessed' not in c, 'Retirement metadata must not supply active assessment scores')
    if 'proposedTraining' in data:
        proposed = data['proposedTraining']
        require(isinstance(proposed, dict) and proposed.get('formatVersion') == 1 and proposed.get('columns') == PROPOSED_HEADERS, 'Invalid proposed-training format')
        validate_proposed_rows(proposed.get('rows'))
    t = data['thresholds']
    require(all(numeric(t.get(k)) for k in ('partial', 'strong')) and 0 <= t['partial'] <= t['strong'] <= 1, 'Invalid coverage thresholds')


def reconcile(workbook, data):
    """Calculate from imported scores and compare to cached Excel outputs."""
    courses = {c['id']: c for c in data['courses']}
    checked, seen = 0, set()
    required = ('Offer ID', 'Need code', 'Level rank', 'In scope', 'Scored', 'Coverage %', 'Core gaps', 'At 3', 'Band')
    for row, r in records(workbook, 'Coverage', required):
        oid, need, rank = r['Offer ID'], r['Need code'], r['Level rank']
        where = f'Coverage row {row} ({oid}/{need})'
        require(oid in courses, where + ': unknown course')
        require((oid, need) not in seen, where + ': duplicate course/need')
        seen.add((oid, need))
        require(type(rank) is int and rank in range(4), where + ': missing/invalid cached level; recalculate and save Excel')
        reqs = [q for q in data['requirements'] if q['need'] == need and q['rank'] <= rank]
        require(bool(reqs), where + ': no applicable requirements')
        scores = courses[oid]['scores']
        values = [scores.get(q['id'], {}).get('score', 0) for q in reqs]
        pct = sum(values) / (3 * len(reqs))
        critical = sum(q['core'] and v == 0 for q, v in zip(reqs, values))
        count = sum(q['id'] in scores for q in reqs)
        band = ('Unassessed' if count == 0 else 'Full' if all(v == 3 for v in values) else
                'Strong' if pct >= data['thresholds']['strong'] and critical == 0 else
                'Partial' if pct >= data['thresholds']['partial'] else 'Weak')
        expected = {'Coverage %': pct, 'In scope': len(reqs), 'Scored': count, 'Core gaps': critical, 'At 3': values.count(3)}
        for field, value in expected.items():
            require(numeric(r[field]) and abs(r[field] - value) < 1e-10,
                    f'{where}: {field} mismatch (Excel {r[field]!r}, calculated {value}). Recalculate and save Excel.')
        require(r['Band'] == band, f'{where}: band mismatch (Excel {r["Band"]!r}, calculated {band})')
        checked += 1
    require(checked > 0, 'No Coverage rows could be reconciled')
    return checked


def read_catalogue(path):
    import openpyxl
    path = Path(path).resolve()
    before_hash = hashlib.sha256(path.read_bytes()).hexdigest()
    workbook = openpyxl.load_workbook(path, data_only=True, read_only=True)
    try:
        courses = []
        for i, r in records(workbook, 'Offers', ('ID', 'Title', 'Provider', 'Type', 'Duration', 'URL', 'Evidence', 'Sources')):
            courses.append(dict(id=r['ID'], provider=r['Provider'], title=r['Title'], type=r['Type'],
                tool=r.get('Product dependency') or '', format=r.get('Format'), duration=r['Duration'] or 'Not stated',
                cost=str(r.get('Indicative cost (USD)') or ''), level=r.get('Best-fit level') or 'Unknown',
                verification=r.get('Verified'), evidence=r['Evidence'],
                description=next((v or '' for k,v in r.items() if k and k.startswith('Content summary')), ''),
                coverageAtAssessment=r.get('Coverage at assessment (v8)', r.get('Coverage at assessment')) or '',
                limitations=r.get('Fit note (v8 source review)', r.get('Fit note')) or '',
                url=r['URL'] or '', sources=links(r['Sources']), review=r.get('Review status') or '',
                source=reference('Offers', i), scores={}, unassessed={}, track='general'))
        require('Tool track' in workbook.sheetnames, 'Missing sheet: Tool track')
        for i, r in enumerate(workbook['Tool track'].iter_rows(values_only=True), 1):
            if i == 1 or r[0] is None: continue
            courses.append(dict(id=r[0], provider=r[3], title=r[4], type=r[5], tool=r[1] or '', format=r[6],
                duration=r[7] or 'Not stated', cost=str(r[8] or ''), level='Unknown', verification=r[12],
                evidence='Not assessed against rubric', description=r[10] or '', coverageAtAssessment='',
                limitations='Tool-track metadata is not a requirement-level assessment.', url=r[13] or '', sources=[],
                review='', source=reference('Tool track',i), scores={}, unassessed={}, track='tool', wave=r[2]))
        by_id = {c['id']: c for c in courses}
        require(len(by_id) == len(courses), 'Duplicate course IDs')
        requirements, all_req_ids = [], set()
        for i, r in records(workbook, 'Rubric', ('Req ID', 'Need code', 'Status', 'Level rank', 'Core', 'Requirement', 'What a training must cover')):
            require(r['Req ID'] not in all_req_ids, 'Duplicate requirement ' + r['Req ID'])
            all_req_ids.add(r['Req ID'])
            if r['Status'] != 'Active': continue
            requirements.append(dict(id=r['Req ID'], need=r['Need code'], level=r.get('Level'), rank=r['Level rank'],
                core=r['Core']=='Yes', title=r['Requirement'], description=r['What a training must cover'], source=reference('Rubric',i)))
            note=r.get('Notes') or ''
            if note.startswith('Applicability: '):
                requirements[-1]['coreCondition']=note.removeprefix('Applicability: ').split('. Must-have')[0]
        active = {r['id'] for r in requirements}
        seen, dates = set(), []
        for i, r in records(workbook, 'Scores', ('Offer ID', 'Req ID', 'Score', 'Evidence (module, lab, timestamp)', 'Assessor', 'Date')):
            oid, rid, value = r['Offer ID'], r['Req ID'], r['Score']
            require(oid in by_id and rid in all_req_ids, f'Scores row {i}: unknown course/requirement {oid}/{rid}')
            require((oid, rid) not in seen, f'Duplicate score {oid}/{rid}')
            seen.add((oid, rid))
            if rid not in active: continue
            dt = date_text(r['Date'])
            if dt: dates.append(dt)
            item = dict(evidence=r['Evidence (module, lab, timestamp)'] or '', assessor=r['Assessor'], date=dt,
                        source=reference('Scores',i), status=r.get('Assessment status') or ('Unassessed' if value is None else 'Assessed'))
            for key, name in [('Prior score (v7)','priorScore'),('Source entry (full list in Offers)','sourceUrl'),('V8 change','change'),('Assessment change','change')]:
                if key in r: item[name] = r[key]
            require(item['status'] in ('Assessed', 'Unassessed'), f'Scores row {i}: unknown assessment status')
            if value is None:
                require(item['status'] == 'Unassessed', f'Scores row {i}: assessed score is blank')
                by_id[oid]['unassessed'][rid] = item
            else:
                require(numeric(value) and value in (0,1,2,3) and item['status']=='Assessed', f'Scores row {i}: invalid score/status')
                item['score'] = int(value)
                by_id[oid]['scores'][rid] = item
        needs = [dict(id=r['Code'], title=r['Need'], type=r['Type'], group=r['Group or macro role'], applies=r['Applies from'],
                     description=r['Summary'], source=reference('Needs',i))
                 for i,r in records(workbook,'Needs',('Code','Need','Type','Group or macro role','Applies from','Summary','Status')) if r['Status']=='Active']
        builds = []
        for i, r in enumerate(workbook['Build items'].iter_rows(values_only=True),1):
            if i > 1 and str(r[0]).startswith('B') and r[1]:
                builds.append(dict(id=r[0],title=r[1],description=r[2],note=r[5] or '',source=reference('Build items',i)))
        guide = list(workbook['Scoring guide'].values)
        thresholds = {r[0]:r[1] for r in guide if r[0] in ('Strong minimum','Partial minimum')}
        data = dict(schemaVersion=2,version=before_hash[:16],sourceSha256=before_hash,filename=path.name,
                    assessmentDate=max(dates) if dates else 'Not recorded',
                    thresholds=dict(strong=thresholds.get('Strong minimum'),partial=thresholds.get('Partial minimum')),
                    needs=needs,requirements=requirements,courses=courses,buildItems=builds,
                    scoringGuide=[list(r) for r in guide])
        if 'V8 audit' in workbook.sheetnames:
            for i, r in records(workbook,'V8 audit',('Offer ID','V8 decision and limitations')):
                require(r['Offer ID'] in by_id, 'Unknown audit course')
                by_id[r['Offer ID']]['audit'] = dict(note=r['V8 decision and limitations'],basis=r.get('Evidence / assessment basis'),
                    priorFit=r.get('Previous fit note (v7)'),priorCoverage=r.get('Previous coverage summary (v7)'),source=reference('V8 audit',i))
        if 'Proposed training' in workbook.sheetnames:
            data['proposedTraining'] = read_proposed_training(workbook)
        # Reconcile all original evidence before excluding retired courses from
        # active selection. Retired historical rows must not escape validation.
        validate_snapshot(data)
        checked = reconcile(workbook, data)
        retired = read_retirements(workbook, by_id)
        if retired:
            data['retiredCourses'] = retired
            retired_ids = {c['id'] for c in retired}
            data['courses'] = [c for c in data['courses'] if c['id'] not in retired_ids]
        # Identity includes importer schema and all imported metadata, not only XLSX bytes.
        identity = {k:v for k,v in data.items() if k != 'version'}
        data['version'] = hashlib.sha256(json.dumps(identity,sort_keys=True,ensure_ascii=False,default=str).encode('utf-8')).hexdigest()[:16]
        validate_snapshot(data)
    finally:
        workbook.close()
    require(hashlib.sha256(path.read_bytes()).hexdigest()==before_hash, 'Workbook changed during import. Save and retry.')
    return data, checked
