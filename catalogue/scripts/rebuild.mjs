#!/usr/bin/env node
// Rebuild the catalogue snapshot and the apps after a workbook change.
// Cross-platform (Windows, macOS, Linux): needs Node.js 20+ and Python 3 with openpyxl.
//
//   node catalogue/scripts/rebuild.mjs <workbook.xlsx> --check     validate only; nothing changes
//   node catalogue/scripts/rebuild.mjs <workbook.xlsx> --preview   build a throwaway learner app in .work/
//   node catalogue/scripts/rebuild.mjs <workbook.xlsx> [options]   publish and rebuild everything
//
// Publish options:
//   --yes                     update the pathways' catalogue snapshot without asking
//   --app-version X.Y.Z       set the learner app version (learning-path/config.json) and today's date
//   --planner-version X.Y.Z   set the planner release (training-planner/public/release.js) and today's date
//   --skip-tests              skip the regression tests
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rel = (...p) => path.join(root, ...p);
const isWindows = process.platform === 'win32';
const today = new Date().toISOString().slice(0, 10);
const PATHWAYS = rel('recommended-pathways', 'Recommended-Training-Pathways.json');
const CATALOGUE = rel('training-planner', 'public', 'data', 'catalogue.json');
const LEARNER_CONFIG = rel('learning-path', 'config.json');
const PLANNER_RELEASE = rel('training-planner', 'public', 'release.js');
const LEGACY_DEFAULT = rel('training-planner', 'public', 'data', 'default-scenario.json');

// ---------- arguments ----------
const argv = process.argv.slice(2);
const flags = new Set(['--check', '--preview', '--yes', '--skip-tests', '--help', '-h']);
const valued = new Set(['--app-version', '--planner-version']);
const opts = {};
let workbook = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (flags.has(a)) opts[a] = true;
  else if (valued.has(a)) {
    const v = argv[++i];
    if (!v || !/^\d+\.\d+\.\d+$/.test(v)) fail(`${a} needs a version like 1.6.4`);
    opts[a] = v;
  } else if (a.startsWith('-')) fail(`Unknown option ${a}. Use --help.`);
  else if (workbook) fail('Give only one workbook path.');
  else workbook = a;
}
if (opts['--help'] || opts['-h'] || !workbook) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 13)
    .map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(workbook || opts['--help'] || opts['-h'] ? 0 : 1);
}
if (opts['--check'] && opts['--preview']) fail('Use either --check or --preview, not both.');
const mode = opts['--check'] ? 'check' : opts['--preview'] ? 'preview' : 'publish';
workbook = path.resolve(workbook);

// ---------- helpers ----------
function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}
function step(title) { console.log(`\n── ${title}`); }
function readJSON(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function run(cmd, args, what, capture = false) {
  const r = spawnSync(cmd, args, {cwd: root, stdio: ['inherit', capture ? 'pipe' : 'inherit', 'inherit'], encoding: 'utf8',
    env: {...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8'}});
  if (r.error) fail(`${what}: could not start ${cmd} (${r.error.message})`);
  if (capture) process.stdout.write(r.stdout);
  if (r.status !== 0) {
    if (published) console.error(`\nFiles were already updated. To put everything back, either discard the changes with Git, or run this script\nagain with the previous workbook (${previousWorkbook}).`);
    fail(`${what} failed (exit code ${r.status}). Fix the problem above and run this again.`);
  }
  return r.stdout;
}
const node = (args, what) => run(process.execPath, args, what);
const python = (args, what, capture) => run(py[0], [...py.slice(1), ...args], what, capture);
function writeJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); }
function testFiles(dir) {
  return fs.readdirSync(rel(dir)).filter(f => f.endsWith('.test.mjs')).sort().map(f => path.join(dir, f));
}
async function confirm(question) {
  if (opts['--yes']) return true;
  if (!process.stdin.isTTY) return false;
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});
  const answer = (await rl.question(`${question} [y/N] `)).trim().toLowerCase();
  rl.close();
  return answer === 'y' || answer === 'yes';
}
function findPython() {
  const candidates = isWindows ? [['py', '-3'], ['python'], ['python3']] : [['python3'], ['python']];
  for (const c of candidates) {
    // The Windows Store "python" stub exits non-zero, so it is skipped here.
    const r = spawnSync(c[0], [...c.slice(1), '-c', 'import sys;print(sys.version_info[0])'], {encoding: 'utf8'});
    if (!r.error && r.status === 0 && r.stdout.trim() === '3') return c;
  }
  fail('Python 3 was not found. Install it from python.org (tick "Add python.exe to PATH") and try again.');
}

// ---------- environment checks ----------
step('Checking tools');
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 20) fail(`Node.js 20 or later is needed (found ${process.version}).`);
const py = findPython();
const openpyxl = spawnSync(py[0], [...py.slice(1), '-c', 'import openpyxl'], {encoding: 'utf8'});
if (openpyxl.status !== 0) fail(`The Python Excel reader is missing. Run:\n  ${py.join(' ')} -m pip install -r training-planner/requirements.txt`);
if (!fs.existsSync(workbook)) fail(`Workbook not found: ${workbook}`);
if (!/\.xlsx$/i.test(workbook)) fail('The workbook must be a saved .xlsx file.');
const lockFile = path.join(path.dirname(workbook), '~$' + path.basename(workbook));
if (fs.existsSync(lockFile)) console.warn('! The workbook looks open in Excel. Make sure you saved it after recalculating.');
if (mode === 'publish' && !opts['--skip-tests'] && !fs.existsSync(rel('training-planner', 'node_modules', 'highs')))
  fail('The planner test dependency is missing. Run:\n  npm ci --prefix training-planner\n(or add --skip-tests)');
// Windows Git can check files out with CRLF line endings, which makes the generated-file checks report false differences.
const sample = fs.readFileSync(rel('recommended-pathways', 'Recommended-Training-Pathways.md'), 'utf8');
if (sample.includes('\r\n')) console.warn('! Files are checked out with Windows (CRLF) line endings, so a "Stale generated artifact" check may fail.\n  Fix: run "git config --global core.autocrlf false" and clone the repository again.');
const activeCatalogue = readJSON(CATALOGUE);
const before = {catalogue: activeCatalogue.version, pathways: readJSON(PATHWAYS).catalogueVersion,
  legacy: readJSON(LEGACY_DEFAULT).catalogueVersion};
const previousWorkbook = path.join('catalogue', activeCatalogue.filename);
let published = false;
const shown = path.relative(root, workbook);
console.log(`Node ${process.version} · ${py.join(' ')} · workbook ${shown.startsWith('..') ? workbook : shown}`);

// ---------- 1. validate ----------
step('1. Validating the workbook (nothing is changed)');
const checkOutput = python(['training-planner/scripts/refresh_catalogue.py', workbook, '--check'], 'Workbook validation', true);
const next = checkOutput.match(/ · ([a-f0-9]{16,64}) · assessment /)?.[1];
if (!next) fail('Could not read the new snapshot ID from the validation output.');
if (mode === 'check') {
  console.log('\n✔ The workbook is valid. Nothing was changed.');
  process.exit(0);
}

// ---------- preview ----------
if (mode === 'preview') {
  const dir = rel('.work', 'catalogue-preview');
  fs.mkdirSync(dir, {recursive: true});
  const snapshot = path.join(dir, 'catalogue.json');
  const output = path.join(dir, 'learning-path', 'index.html');
  step('2. Importing the workbook into .work/ (the live catalogue is not touched)');
  python(['-c', [
    'import sys',
    "sys.path.insert(0, 'training-planner/scripts')",
    'from catalogue_io import read_catalogue',
    'from refresh_catalogue import encode',
    'data, _ = read_catalogue(sys.argv[1])',
    "open(sys.argv[2], 'wb').write(encode(data))",
    "print('Preview snapshot', data['version'])",
  ].join('\n'), workbook, snapshot], 'Preview import');
  step('3. Building a preview learner app');
  node(['learning-path/scripts/build.mjs', '--catalogue', snapshot, '--output', output], 'Preview learner build');
  console.log(`\n✔ Preview ready. Open this file in your browser:\n  ${output}`);
  console.log('  It shows the current recommendations against the new workbook. It is for checking only; do not distribute it.');
  console.log('  Note: browser storage is per file location, so personal progress from the live app will not appear there.');
  process.exit(0);
}

// ---------- 2. confirm ----------
// Ask before anything is written, so answering "no" leaves every file unchanged.
step('2. Confirming the update');
const pinned = [['Recommended pathways (used by the learner app)', before.pathways],
  ['Planner retained 2027 default plan', before.legacy]];
const changing = next !== before.catalogue || pinned.some(([, v]) => v !== next);
if (!changing) {
  console.log(`Everything already uses snapshot ${next}. Rebuilding to confirm the outputs are current.`);
} else {
  console.log(`Active catalogue snapshot:  ${before.catalogue} → ${next}`);
  for (const [name, v] of pinned) console.log(`${name}: ${v} → ${next}`);
  console.log('\nThe current recommendations and the 2027 default will be published against the new catalogue.');
  console.log('Check the change counts above. If a selected course was removed, the rebuild will stop and say which.');
  if (!await confirm('Publish the new catalogue and rebuild the apps?')) {
    if (!process.stdin.isTTY && !opts['--yes']) console.log('There is no terminal to ask in; add --yes to go ahead without asking.');
    console.log('\nNothing was changed. Use --preview to look at the learner app with this workbook first.');
    process.exit(0);
  }
}

// ---------- 3. publish snapshot ----------
step('3. Publishing the catalogue snapshot');
published = true;
python(['training-planner/scripts/refresh_catalogue.py', workbook], 'Catalogue refresh');
const catalogue = readJSON(CATALOGUE);
if (catalogue.version !== next) fail(`The published snapshot ${catalogue.version} is not the one validated (${next}). Was the workbook changed meanwhile?`);

// ---------- 4. framework and pinned plans ----------
step('4. Rebuilding the capability framework and updating the pinned plans');
node(['training-planner/scripts/build_capability_model.mjs'], 'Capability model build');
node(['training-planner/scripts/build_component_starter.mjs'], 'Component starter build');
const scenario = readJSON(PATHWAYS);
if (scenario.catalogueVersion !== catalogue.version) {
  scenario.catalogueVersion = catalogue.version;
  scenario.catalogueIdentity = {version: catalogue.version, filename: catalogue.filename,
    sourceSha256: catalogue.sourceSha256, assessmentDate: catalogue.assessmentDate};
  writeJSON(PATHWAYS, scenario);
  console.log('Updated recommended-pathways/Recommended-Training-Pathways.json.');
}
const legacy = readJSON(LEGACY_DEFAULT);
if (legacy.catalogueVersion !== catalogue.version) {
  legacy.catalogueVersion = catalogue.version;
  writeJSON(LEGACY_DEFAULT, legacy);
  console.log('Updated training-planner/public/data/default-scenario.json.');
}

// ---------- 5. versions ----------
step('5. Release versions');
if (opts['--app-version']) {
  const config = readJSON(LEARNER_CONFIG);
  config.appVersion = opts['--app-version'];
  config.releaseDate = today;
  writeJSON(LEARNER_CONFIG, config);
  console.log(`Learner app ${config.appVersion} (${today}).`);
} else console.log(`Learner app version unchanged (${readJSON(LEARNER_CONFIG).appVersion}).`);
if (opts['--planner-version']) {
  const text = fs.readFileSync(PLANNER_RELEASE, 'utf8');
  const updated = text.replace(/version: '[^']*'/, `version: '${opts['--planner-version']}'`).replace(/date: '[^']*'/, `date: '${today}'`);
  if (updated === text) fail('Could not find the version fields in training-planner/public/release.js.');
  fs.writeFileSync(PLANNER_RELEASE, updated);
  console.log(`Planner ${opts['--planner-version']} (${today}).`);
} else console.log('Planner version unchanged.');

// ---------- 6. apps ----------
step('6. Building the planner, pathways guide and learner app');
python(['training-planner/scripts/build_standalone.py'], 'Planner build');
node(['recommended-pathways/scripts/build.mjs'], 'Pathways build');
node(['recommended-pathways/scripts/build.mjs', '--check'], 'Pathways check');
node(['learning-path/scripts/build.mjs'], 'Learner app build');

// ---------- 7. tests ----------
if (opts['--skip-tests']) step('7. Tests skipped');
else {
  step('7. Running the regression tests');
  node(['--test', ...testFiles('training-planner/tests')], 'Planner tests');
  python(['-m', 'unittest', 'discover', '-s', 'training-planner/tests', '-p', 'test_*.py'], 'Planner Python tests');
  node(['--test', ...testFiles('learning-path/tests')], 'Learner tests');
  python(['-m', 'unittest', 'discover', '-s', 'learning-path/tests', '-p', 'test_*.py'], 'Learner Python tests');
}

// ---------- summary ----------
console.log('\n✔ Rebuild complete.');
console.log(`  Catalogue snapshot ${catalogue.version} (${catalogue.filename}) is live in the planner, pathways and learner app.`);
console.log('  Check the result in learning-path/index.html and training-planner/Training-Planner.html.');
if (changing) {
  const reminders = [];
  if (!opts['--app-version']) reminders.push('Raise the learner app version: rerun with --app-version X.Y.Z (or edit learning-path/config.json).');
  if (!opts['--planner-version']) reminders.push('Raise the planner version: rerun with --planner-version X.Y.Z (or edit training-planner/public/release.js).');
  reminders.push('Review the recommendations against the new catalogue; raise the pathways version in its JSON "publication" section if you republish them.');
  reminders.push('Update the version references in README.md, AGENTS.md and docs/PROJECT_CONTEXT.md, then commit.');
  console.log('\nStill to do:\n' + reminders.map(r => `  • ${r}`).join('\n'));
}
