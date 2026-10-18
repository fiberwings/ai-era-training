import base64
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from build_standalone import build_html, bundle_modules, script_json, main


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(); self.scripts = {}; self.current = None; self.external = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script':
            self.current = attrs.get('id', 'app'); self.scripts[self.current] = ''
        if attrs.get('src') or (tag == 'link' and attrs.get('href')):
            self.external.append(attrs)

    def handle_endtag(self, tag):
        if tag == 'script': self.current = None

    def handle_data(self, data):
        if self.current: self.scripts[self.current] += data


class StandaloneTests(unittest.TestCase):
    def test_complete_package_preserves_data_and_binary(self):
        html = build_html().decode('utf-8')
        page = Page(html)
        self.assertFalse(page.external)
        self.assertEqual(len(page.scripts), 5)
        for name in ('catalogue', 'default-scenario'):
            expected = json.loads((ROOT / 'public/data' / (name + '.json')).read_text())
            self.assertEqual(json.loads(page.scripts['embedded-' + name]), expected)
        worker = json.loads(page.scripts['embedded-worker'])
        binary = re.search(r'atob\("([A-Za-z0-9+/=]+)"\)', worker)[1]
        self.assertEqual(base64.b64decode(binary), (ROOT / 'public/vendor/highs.wasm').read_bytes())
        self.assertNotIn('importScripts(', worker)
        self.assertNotRegex(worker, r'\bimport\s*\(')
        self.assertIn("connect-src 'none'", html)
        self.assertNotIn('@import', html)
        self.assertIn('Permission is hereby granted', json.loads(page.scripts['embedded-solver-license']))

    def test_workbook_text_cannot_break_out_of_script(self):
        value = {'title': '</script><script>alert(1)</script>', 'text': '\u2028\u2029<&'}
        page = Page('<script id="data" type="application/json">' + script_json(value) + '</script>')
        self.assertEqual(list(page.scripts), ['data'])
        self.assertEqual(json.loads(page.scripts['data']), value)

    def test_new_unsupported_import_fails_loudly(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)
            (path / 'example.js').write_text("import thing from './other.js';\n")
            with self.assertRaisesRegex(ValueError, 'Unsupported module syntax'):
                bundle_modules(path, 'example.js')

    def test_packaging_failure_keeps_existing_distribution(self):
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / 'Planner.html'; output.write_text('previous usable version')
            with patch('sys.argv', ['build_standalone.py', '--output', str(output)]), \
                 patch('build_standalone.build_html', side_effect=ValueError('missing asset')):
                self.assertEqual(main(), 1)
            self.assertEqual(output.read_text(), 'previous usable version')


if __name__ == '__main__': unittest.main()
