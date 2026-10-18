"""Package the catalogue, UI and HiGHS solver into one offline HTML file.

Optional --workbook first runs the validated refresh workflow. No Node or npm.
The published HTML is replaced atomically only after packaging succeeds.
"""
import argparse
import base64
import json
import re
import sys
from pathlib import Path

from catalogue_io import validate_snapshot
from refresh_catalogue import ROOT, atomic_write, read_json, refresh


def script_json(value):
    # Prevent workbook text or bundled JS from closing an HTML script element.
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False).replace(
        '<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


def bundle_modules(public, entry):
    """Bundle our named-import/declaration-export subset with isolated scopes.

    This intentionally rejects unsupported module syntax rather than producing a
    subtly broken distribution. No third-party JS transformer is required.
    """
    parts = ['const __modules = Object.create(null);']
    done, visiting = set(), set()
    imports = re.compile(r"^import\s+\{([\w\s,]+)\}\s+from\s+['\"]\./([\w-]+\.js)['\"];[ \t]*$", re.M)
    exports = re.compile(r'^export (?:async )?(?:function|const|let)\s+(\w+)', re.M)

    def visit(name):
        if name in done: return
        if name in visiting: raise ValueError('Circular module import: ' + name)
        visiting.add(name)
        source = (public / name).read_text(encoding='utf-8')
        for match in imports.finditer(source): visit(match[2])
        source = imports.sub(lambda m: 'const {' + m[1] + '} = __modules[' + json.dumps(m[2]) + '];', source)
        names = exports.findall(source)
        source = re.sub(r'^export (?=(?:async )?(?:function|const|let)\s)', '', source, flags=re.M)
        if re.search(r'^\s*(?:import|export)\b', source, re.M):
            raise ValueError('Unsupported module syntax in ' + name)
        if '</script' in source.lower(): raise ValueError('Unsafe inline script text in ' + name)
        if name == 'app.js':
            parts.append('(async () => {\n' + source + '\n})().catch(error => {\n'
                         "document.getElementById('app').textContent = 'The planner could not start: ' + error.message;\n"
                         'console.error(error);\n});')
        else:
            parts.append('__modules[' + json.dumps(name) + '] = (() => {\n' + source +
                         '\nreturn {' + ','.join(names) + '};\n})();')
        visiting.remove(name); done.add(name)

    visit(entry)
    return '\n'.join(parts)


def bundle_css(public, name, visiting=None):
    visiting = set() if visiting is None else visiting
    if name in visiting: raise ValueError('Circular CSS import: ' + name)
    visiting.add(name)
    source = (public / name).read_text(encoding='utf-8')
    source = re.sub(r"@import url\(['\"]\./([\w-]+\.css)['\"]\);",
                    lambda m: bundle_css(public, m[1], visiting), source)
    visiting.remove(name)
    if re.search(r'@import|url\s*\(|</style', source, re.I):
        raise ValueError('Unbundled or unsafe CSS reference in ' + name)
    return source


def build_html(root=ROOT):
    public = Path(root) / 'public'
    data = read_json(public / 'data/catalogue.json')
    validate_snapshot(data)
    seed = read_json(public / 'data/default-scenario.json')
    wasm = base64.b64encode((public / 'vendor/highs.wasm').read_bytes()).decode('ascii')
    worker = ((public / 'vendor/highs.js').read_text(encoding='utf-8') + '\n' +
              bundle_modules(public, 'optimisation.js') + '\n' +
              'let solver;\nself.onmessage = async ({data}) => {\ntry {\n'
              'solver ??= await Module({wasmBinary: Uint8Array.from(atob(' + json.dumps(wasm) + '), c => c.charCodeAt(0))});\n'
              'self.postMessage({result: __modules["optimisation.js"].solveProblem(solver, data, 15)});\n'
              '} catch (error) { self.postMessage({error:error.message}); }\n};')
    html = (public / 'index.html').read_text(encoding='utf-8')
    style_tag = '<link rel="stylesheet" href="./styles.css">'
    script_tag = '<script type="module" src="./app.js"></script>'
    if html.count(style_tag) != 1 or html.count(script_tag) != 1:
        raise ValueError('Unexpected index.html entry points; update the packager')
    # Block network requests even if a future runtime change accidentally tries one.
    # Links remain usable because connect-src does not restrict user navigation.
    csp = ("default-src 'none'; script-src 'unsafe-inline' 'wasm-unsafe-eval'; "
           "style-src 'unsafe-inline'; worker-src blob:; child-src blob:; "
           "connect-src 'none'; img-src data:; base-uri 'none'; form-action 'none'")
    html = html.replace(style_tag, '<meta http-equiv="Content-Security-Policy" content="' + csp + '">\n<style>' + bundle_css(public, 'styles.css') + '</style>')
    payloads = {'catalogue': data, 'default-scenario': seed, 'worker': worker,
                'solver-license': (public / 'vendor/LICENSE').read_text(encoding='utf-8')}
    embedded = '\n'.join('<script type="application/json" id="embedded-' + key + '">' +
                         script_json(value) + '</script>' for key, value in payloads.items())
    html = html.replace(script_tag, embedded + '\n<script>\n' + bundle_modules(public, 'app.js') + '\n</script>')
    return html.encode('utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workbook', help='Validate and refresh this saved .xlsx before packaging')
    parser.add_argument('--output', type=Path, default=ROOT / 'Training-Planner.html')
    args = parser.parse_args()
    try:
        if args.workbook: refresh(args.workbook)
        content = build_html()
        # A mistaken output path must never overwrite a workbook or source file.
        output = args.output.resolve()
        if output.suffix.lower() != '.html' or output == (ROOT / 'public/index.html').resolve():
            raise ValueError('Choose a separate .html output file, outside public/index.html')
        if not output.exists() or output.read_bytes() != content: atomic_write(output, content)
        print(f'Ready: {output} ({len(content)/1024/1024:.1f} MiB)')
        print('Open this HTML directly in a desktop browser. Send just this file to recipients.')
        print('Plans are separate: export scenario JSON to back up or transfer your decisions.')
    except (ValueError, OSError, KeyError, TypeError, ModuleNotFoundError) as error:
        print('HTML packaging failed: ' + str(error), file=sys.stderr)
        print('The previous HTML remains unchanged. If a workbook refresh succeeded above, the local-server snapshot has already been updated.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__': sys.exit(main())
