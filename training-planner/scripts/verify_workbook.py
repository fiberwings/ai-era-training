"""Verify the active snapshot against its source workbook without writing files."""
import argparse
import json
from pathlib import Path
from catalogue_io import read_catalogue, require

if __name__=='__main__':
    root=Path(__file__).resolve().parents[1]
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('workbook',nargs='?')
    args=p.parse_args()
    current=json.loads((root/'public/data/catalogue.json').read_text(encoding='utf-8'))
    expected,checked=read_catalogue(args.workbook or root.parent/'catalogue'/current['filename'])
    require(current==expected,'Active snapshot differs from this workbook; use refresh_catalogue.py')
    print(f'Active snapshot matches workbook; reconciled {checked} course/need results.')
