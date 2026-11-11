import copy
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.request import urlopen
from urllib.error import HTTPError
from http.server import ThreadingHTTPServer

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from catalogue_io import read_catalogue, validate_snapshot, reconcile
from refresh_catalogue import refresh, encode, atomic_write, changes


def fixture(version='a'*16):
    return dict(version=version,filename='example.xlsx',assessmentDate='2026-10-15',thresholds={'strong':.7,'partial':.3},
        needs=[{'id':'N1'}],requirements=[{'id':'N1.1','need':'N1','rank':0,'core':True}],
        courses=[{'id':'C1','title':'Example','scores':{'N1.1':{'score':0}},'unassessed':{}}],buildItems=[])


class RefreshTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name);self.target=self.root/'public/data/catalogue.json'
        self.old=fixture();atomic_write(self.target,encode(self.old))
        self.new=fixture('b'*16);self.new['courses'][0]['scores']['N1.1']['score']=2

    def test_check_then_publish_and_repeat(self):
        with patch('refresh_catalogue.read_catalogue',return_value=(self.new,1)):
            before=self.target.read_bytes()
            refresh('input.xlsx',root=self.root,check=True)
            self.assertEqual(self.target.read_bytes(),before)
            refresh('input.xlsx',root=self.root)
            self.assertEqual(json.loads(self.target.read_bytes()),self.new)
            published=self.target.read_bytes()
            refresh('input.xlsx',root=self.root)
            self.assertEqual(self.target.read_bytes(),published)
            self.assertEqual(sorted(p.name for p in self.root.iterdir()),['public'])

    def test_invalid_source_keeps_active_data_and_releases_lock(self):
        before=self.target.read_bytes()
        with patch('refresh_catalogue.read_catalogue',side_effect=ValueError('stale formulas')):
            with self.assertRaisesRegex(ValueError,'stale formulas'):refresh('bad.xlsx',root=self.root)
        self.assertEqual(self.target.read_bytes(),before)
        self.assertFalse((self.root/'.catalogue-refresh.lock').exists())

    def test_atomic_failure_keeps_old_file(self):
        before=self.target.read_bytes()
        with patch('refresh_catalogue.os.replace',side_effect=OSError('locked')):
            with self.assertRaises(OSError):atomic_write(self.target,b'incomplete')
        self.assertEqual(self.target.read_bytes(),before)
        self.assertEqual(list(self.target.parent.glob('.refresh-*')),[])

    def test_lock_refuses_overlapping_run(self):
        (self.root/'.catalogue-refresh.lock').touch()
        with self.assertRaisesRegex(ValueError,'Another refresh'):refresh('input.xlsx',root=self.root)

    def test_zero_and_unassessed_are_distinct_and_reported(self):
        other=copy.deepcopy(self.old)
        other['courses'][0]['scores']={}
        other['courses'][0]['unassessed']={'N1.1':{'status':'Unassessed'}}
        validate_snapshot(other)
        report=changes(self.old,other)
        self.assertEqual(report['changedCourses'][0]['scoreChanges'],[{'requirement':'N1.1','before':0,'after':None}])
        other['courses'][0]['scores']={'N1.1':{'score':0}}
        with self.assertRaisesRegex(ValueError,'Conflicting'):validate_snapshot(other)

    def test_duplicate_invalid_and_unknown_scores_rejected(self):
        for change in ('duplicate','boolean','unknown'):
            data=fixture()
            if change=='duplicate':data['courses'].append(copy.deepcopy(data['courses'][0]))
            elif change=='boolean':data['courses'][0]['scores']['N1.1']['score']=True
            else:data['courses'][0]['scores']['missing']={'score':2}
            with self.assertRaises(ValueError):validate_snapshot(data)


class WorkbookTests(unittest.TestCase):
    def test_live_snapshot_matches_current_workbook(self):
        live=json.loads((ROOT/'public/data/catalogue.json').read_text())
        data,_=read_catalogue(ROOT.parent/'catalogue'/live['filename'])
        self.assertEqual(data['version'],live['version'],'Workbook edited but not published: run catalogue/scripts/rebuild.mjs')

    def test_stale_or_missing_formula_cache_rejected(self):
        class Sheet:
            def iter_rows(self,values_only=True):
                return iter([['Offer ID','Need code','Level rank','In scope','Scored','Coverage %','Core gaps','At 3','Band'],
                             ['C1','N1',0,1,1,None,1,0,'Weak']])
        class Book(dict):sheetnames=['Coverage']
        with self.assertRaisesRegex(ValueError,'Recalculate'):
            reconcile(Book(Coverage=Sheet()),fixture())


class ServerTests(unittest.TestCase):
    def test_assets_mime_security_and_no_directory_listing(self):
        spec=importlib.util.spec_from_file_location('planner_server',ROOT/'server.py')
        module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
        server=ThreadingHTTPServer(('127.0.0.1',0),module.Handler)
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        try:
            base='http://127.0.0.1:'+str(server.server_port)
            for path,mime in [('/','text/html'),('/app.js','text/javascript'),('/vendor/highs.wasm','application/wasm')]:
                with urlopen(base+path) as response:
                    self.assertIn(mime,response.headers['Content-Type'])
                    self.assertEqual(response.headers['Cache-Control'],'no-cache')
                    self.assertIn("worker-src 'self'",response.headers['Content-Security-Policy'])
                    response.read()
            for path in ['/vendor/','/../README.md','/%2e%2e/README.md']:
                with self.assertRaises(HTTPError) as caught:urlopen(base+path)
                self.assertEqual(caught.exception.code,404)
        finally:server.shutdown();server.server_close();thread.join()


if __name__=='__main__':unittest.main()
