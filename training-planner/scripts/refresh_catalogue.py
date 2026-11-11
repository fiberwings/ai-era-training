"""Validate, report and atomically publish the catalogue snapshot. Git keeps previous versions."""
import argparse
import json
import os
import sys
import tempfile
from pathlib import Path
from catalogue_io import read_catalogue, validate_snapshot, require

ROOT = Path(__file__).resolve().parents[1]


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def encode(data):
    return json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode('utf-8')


def atomic_write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    name = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.refresh-', delete=False) as f:
            name = f.name
            f.write(content); f.flush(); os.fsync(f.fileno())
        os.replace(name, path)
    finally:
        if name and os.path.exists(name): os.unlink(name)


def changes(old, new):
    old_courses = {c['id']:c for c in (old or {}).get('courses',[])}
    new_courses = {c['id']:c for c in new['courses']}
    report = dict(fromVersion=(old or {}).get('version'),toVersion=new['version'],filename=new['filename'],
                  addedCourses=sorted(new_courses.keys()-old_courses.keys()),removedCourses=sorted(old_courses.keys()-new_courses.keys()),
                  changedCourses=[], changedRequirements=[],thresholdsChanged=(old or {}).get('thresholds') != new['thresholds'])
    for cid in sorted(new_courses.keys() & old_courses.keys()):
        a,b = old_courses[cid],new_courses[cid]
        fields = [k for k in ('title','provider','type','tool','format','duration','cost','level','evidence','description','limitations','url','sources','review','audit') if a.get(k)!=b.get(k)]
        score_changes=[]
        for rid in sorted(a['scores'].keys() | b['scores'].keys()):
            before,after = a['scores'].get(rid,{}),b['scores'].get(rid,{})
            if before.get('score')!=after.get('score'):
                score_changes.append(dict(requirement=rid,before=before.get('score'),after=after.get('score')))
        evidence_changed = any(a['scores'].get(r,{}).get('evidence')!=b['scores'].get(r,{}).get('evidence') for r in a['scores'].keys() | b['scores'].keys())
        if fields or score_changes or evidence_changed or a.get('unassessed',{})!=b.get('unassessed',{}):
            report['changedCourses'].append(dict(id=cid,fields=fields,scoreChanges=score_changes,evidenceChanged=evidence_changed))
    for key, target in [('requirements','changedRequirements'),('needs','changedNeeds')]:
        aa={r['id']:r for r in (old or {}).get(key,[])};bb={r['id']:r for r in new[key]}
        report[target]=[dict(id=k,before=aa.get(k),after=bb.get(k)) for k in sorted(aa.keys()|bb.keys()) if aa.get(k)!=bb.get(k)]
    return report


def refresh(source, root=ROOT, check=False):
    root=Path(root);target=root/'public/data/catalogue.json'
    lock=root/'.catalogue-refresh.lock'
    root.mkdir(parents=True,exist_ok=True)
    try: fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY)
    except FileExistsError: raise ValueError(f'Another refresh may be running. If it has stopped, remove {lock} and retry.')
    try:
        os.close(fd)
        old=read_json(target) if target.exists() else None
        data,checked=read_catalogue(source)
        report=changes(old,data)
        report.update(checkedCoverageRows=checked,assessedScores=sum(len(c['scores']) for c in data['courses']),
                      unassessedRows=sum(len(c.get('unassessed',{})) for c in data['courses']),courses=len(data['courses']))
        print(f"{data['filename']} · {data['version']} · assessment {data['assessmentDate']}")
        print(f"{len(data['courses'])} resources; {report['assessedScores']} numeric scores; {report['unassessedRows']} explicit unassessed rows")
        print(f"Changes: {len(report['addedCourses'])} added, {len(report['removedCourses'])} removed, {len(report['changedCourses'])} changed courses")
        for c in report['changedCourses']:
            print(f"  {c['id']}: {', '.join(c['fields']) or 'no field changes'}; {len(c['scoreChanges'])} score changes")
        if checked is not None: print(f'Validated {checked} course/need coverage rows against Excel.')
        if check:
            print('Check only: active catalogue unchanged.');return report
        if old==data:
            print('Already up to date; no files changed.');return report
        atomic_write(target,encode(data))
        print(f'Published {target}. Previous snapshots are in Git history.')
        return report
    finally:
        lock.unlink(missing_ok=True)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('workbook',help='Saved .xlsx workbook')
    parser.add_argument('--check',action='store_true',help='Validate and summarise without publishing')
    args=parser.parse_args()
    try: refresh(args.workbook,check=args.check)
    except ModuleNotFoundError as e:
        print(f'Missing dependency: {e.name}. Run: python -m pip install -r requirements.txt',file=sys.stderr);sys.exit(1)
    except (ValueError,OSError,KeyError,TypeError) as e:
        print('Refresh failed; active catalogue was not replaced: '+str(e),file=sys.stderr);sys.exit(1)


if __name__=='__main__': main()
