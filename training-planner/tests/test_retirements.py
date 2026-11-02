import copy
import json
from pathlib import Path
import sys
import unittest
import openpyxl

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from catalogue_io import read_retirements, validate_snapshot

class RetirementTests(unittest.TestCase):
    def fixture(self):
        w=openpyxl.Workbook();w.remove(w.active)
        w.create_sheet('Retirements').append(['ID','Title','Retired on','Reason','Decision','Sources'])
        w['Retirements'].append(['C1','Course','2026-11-02','Superseded','User approved','https://example.com'])
        for name in ('Offers','Tool track'):
            w.create_sheet(name).append(['ID','Lifecycle'])
        w['Offers'].append(['C1','Retired']);w['Tool track'].append(['C2','Active'])
        courses={i:dict(id=i,title='Course',provider='Provider',source={'sheet':'Offers','row':2}) for i in ('C1','C2')}
        return w,courses

    def test_register_rejects_stale_caches_duplicate_unknown_and_unapproved_rows(self):
        for change in ('cache','duplicate','unknown','decision','title','date'):
            with self.subTest(change=change):
                w,c=self.fixture()
                if change=='cache':w['Offers']['B2']='Active'
                if change=='duplicate':w['Retirements'].append([c.value for c in w['Retirements'][2]])
                if change=='unknown':w['Retirements']['A2']='MISSING'
                if change=='decision':w['Retirements']['E2']=''
                if change=='title':w['Retirements']['B2']='Different course'
                if change=='date':w['Retirements']['C2']=None
                with self.assertRaises(ValueError):read_retirements(w,c)

    def test_register_returns_only_metadata_and_snapshot_disallows_reintroduced_credit(self):
        w,c=self.fixture();records=read_retirements(w,c)
        self.assertEqual([r['id'] for r in records],['C1'])
        self.assertNotIn('scores',records[0])
        data=json.loads((ROOT/'public/data/catalogue.json').read_text())
        validate_snapshot(data)
        for change in ('collision','scores','duplicate'):
            d=copy.deepcopy(data)
            if change=='collision':d['retiredCourses'][0]['id']=d['courses'][0]['id']
            if change=='scores':d['retiredCourses'][0]['scores']={}
            if change=='duplicate':d['retiredCourses'].append(d['retiredCourses'][0])
            with self.assertRaises(ValueError):validate_snapshot(d)
