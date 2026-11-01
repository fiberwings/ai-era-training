"""Rebuild this research assessment; never writes the catalogue or app inputs."""
from pathlib import Path
import csv
import hashlib
import html
import json
import re
from collections import Counter, defaultdict
from statistics import mean

BASE = Path(__file__).resolve().parents[1]
ROOT = BASE.parents[1]
cat = json.loads((ROOT / 'training-planner/catalogue-history/6db669ed065cab54.json').read_text())
cross = json.loads((BASE / 'inputs/capability-crosswalk-v12.json').read_text())
sources = json.loads((BASE / 'inputs/sources.json').read_text())
assert cat['version'] == cross['catalogueVersion'] == '6db669ed065cab54'
assert (cross['modelVersion'], cross['modelRevision']) == (2, 3)
baseline_workbook = ROOT / 'archive/catalogues/AI_Era_Cyber_Training_Catalogue_v12.xlsx'
if not baseline_workbook.exists():
    baseline_workbook = ROOT / 'catalogue/AI_Era_Cyber_Training_Catalogue_v12.xlsx'
assert hashlib.sha256(baseline_workbook.read_bytes()).hexdigest() == cat['sourceSha256']
req = cross['requirements']
ids = {r['id'] for r in req}
assert len(req) == len(ids) == 140
assert len({r['need'] for r in req}) == 23
assert {r['id']:r['description'] for r in req} == {r['id']:r['description'] for r in cat['requirements']}
source_ids = {s['id'] for s in sources['sources']}
def split_refs(text): return re.split(r',(?=[IS]\d)', text)
decisions = {'SecAI': {}, 'ISC2': {}}
with (BASE / 'inputs/assessment.tsv').open() as f:
    for d in csv.DictReader(f, delimiter='\t'):
        assert d['outcome'] in ids and d['offer'] in decisions
        assert d['outcome'] not in decisions[d['offer']]
        d['score'] = int(d['score'])
        assert 0 <= d['score'] <= 3
        assert all(s.split(':')[0] in source_ids for s in split_refs(d['sources']))
        decisions[d['offer']][d['outcome']] = d
for offer, ds in decisions.items():
    for r in req:
        if r['id'] not in ds:
            ds[r['id']] = {'score':0, 'sources':'S0,S1,S2,S3,S4' if offer == 'SecAI' else 'I0,I1,I2,I3,I4,I5,I6',
                          'decision':f"No sufficiently specific public teaching evidence found for {r['title'].lower()}. Zero records the reviewed evidence gap, not proven absence from paid lessons."}
assert all(len(ds) == 140 for ds in decisions.values())
scores = {o:{rid:d['score'] for rid,d in ds.items()} for o,ds in decisions.items()}
scores['Both'] = {rid:max(scores[o][rid] for o in decisions) for rid in ids}

def metric(rows, sc):
    groups = defaultdict(list)
    for r in rows:
        groups[r['need']].append(r)
    core = [r for r in rows if r['core']]
    counts = Counter(sc[r['id']] for r in rows)
    core_counts = Counter(sc[r['id']] for r in core)
    return {
        'outcomes':len(rows), 'needs':len(groups), 'core':len(core),
        'coverage':100*mean(mean(sc[r['id']]/3 for r in rs) for rs in groups.values()) if rows else 0,
        'core_depth':100*mean(sc[r['id']]/3 for r in core) if core else 0,
        'touched':sum(sc[r['id']] >= 1 for r in rows),
        'taught_partial_or_full':sum(sc[r['id']] >= 2 for r in rows),
        'full':counts[3], 'core_touched':len(core)-core_counts[0],
        'core_taught':core_counts[2]+core_counts[3], 'core_full':core_counts[3],
        'core_zero':core_counts[0], 'score_counts':dict(sorted(counts.items()))}

components = {'Foundation':[r for r in req if r['component']=='Foundation']}
components.update({f'L{n} shared':[r for r in req if r['component']=='Agentic level' and r['agenticLevel']==n] for n in (1,2,3)})
components['Role specialisms'] = [r for r in req if r['component']=='Role specialism']
assert sum(len(rs) for rs in components.values()) == 140
metrics = {
    'date':sources['reviewDate'], 'catalogue':cat['version'], 'model':'2 revision 3',
    'formula':'Mean of need percentages; each need = sum outcome scores / (3 * outcome count). Combined = outcome-wise maximum.',
    'overall':{o:metric(req,sc) for o,sc in scores.items()},
    'components':{name:{o:metric(rs,sc) for o,sc in scores.items()} for name,rs in components.items()},
    'needs':{n['id']:{'title':n['title'], **{o:metric([r for r in req if r['need']==n['id']],sc) for o,sc in scores.items()}} for n in cat['needs']},
    'conditional_core':[{'id':r['id'],'condition':r['coreCondition']} for r in req if r['core'] and r['coreCondition']],
    'foundation_core_gaps':{o:[{'id':r['id'],'score':sc[r['id']],'title':r['title']} for r in components['Foundation'] if r['core'] and sc[r['id']]<3] for o,sc in scores.items()}
}
for n in metrics['needs'].values():
    for o in scores:
        m=n[o]
        m['band']='Full' if m['coverage']==100 else 'Strong' if m['coverage']>=70 and not m['core_zero'] else 'Partial' if m['coverage']>=30 else 'Weak'
assert all(scores['Both'][rid]>=scores[o][rid] for rid in ids for o in decisions)
out = BASE / 'outputs'
out.mkdir(exist_ok=True)
(out/'metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')
with (out/'outcome-assessment.csv').open('w',newline='') as f:
    fields=['id','need','component','agenticLevel','title','description','core','coreCondition','SecAI_score','SecAI_sources','SecAI_decision','ISC2_score','ISC2_sources','ISC2_decision','Both_score']
    w=csv.DictWriter(f,fieldnames=fields); w.writeheader()
    for r in req:
        row={k:r[k] for k in fields[:8]}
        for o in decisions:
            row.update({f'{o}_{k}':decisions[o][r['id']][k] for k in ['score','sources','decision']})
        row['Both_score']=scores['Both'][r['id']]; w.writerow(row)

e=html.escape
def pct(x): return f'{x:.1f}%'
def fraction(m,key): return f"{m[key]}/{m['core']} ({100*m[key]/m['core']:.0f}%)"
def table(headers, rows):
    return '<div class="scroll"><table><thead><tr>'+''.join(f'<th>{h}</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(f'<td>{v}</td>' for v in row)+'</tr>' for row in rows)+'</tbody></table></div>'
def refs(text):
    return ', '.join(f'<a href="#source-{e(s.split(":")[0])}">{e(s)}</a>' for s in split_refs(text))
overall=metrics['overall']
comparison=table(['Metric','SecAI+ training route','ISC2 certificate','Both, deduplicated'],[
    ['Whole-framework coverage',*[pct(overall[o]['coverage']) for o in scores]],
    ['Must-haves taught at least partly (score ≥2)',*[fraction(overall[o],'core_taught') for o in scores]],
    ['Must-haves fully covered (score 3)',*[fraction(overall[o],'core_full') for o in scores]],
    ['Must-haves with no specific evidence (score 0)',*[fraction(overall[o],'core_zero') for o in scores]],
    ['All outcomes taught at least partly',*[f"{overall[o]['taught_partial_or_full']}/140" for o in scores]],
    ['Need groups Strong / Full',*[f"{sum(n[o]['band'] in ('Strong','Full') for n in metrics['needs'].values())}/23" for o in scores]],
    ['Full-course duration','30–60 hours','16 hours','46–76 hours'],
    ['Observed US price before tax','$508 training; $628 with exam + retake','$640; $512 members','$1,140–1,268 for SecAI bundle + ISC2'],
])
component_table=table(['Component (non-cumulative)','Outcomes / must-haves','SecAI+','ISC2','Both'],[
    [name,f"{next(iter(ms.values()))['outcomes']} / {next(iter(ms.values()))['core']}",*[pct(ms[o]['coverage']) for o in scores]] for name,ms in metrics['components'].items()])
needs_table=table(['Need','SecAI+ coverage / band','ISC2 coverage / band','SecAI+ core ≥2','ISC2 core ≥2','Both coverage'],[
    [f"<strong>{nid}</strong> {e(n['title'])}",*[f"{pct(n[o]['coverage'])} · {n[o]['band']}" for o in decisions],*[f"{n[o]['core_taught']}/{n[o]['core']}" for o in decisions],pct(n['Both']['coverage'])] for nid,n in metrics['needs'].items()])
course_table=table(['ISC2 course','Hours','Specific evidence and limits'],[
    [f'<a href="{s["url"]}">{e(s["title"].split(" — ")[0].replace("ISC2 ",""))}</a>',h,e(s['note'])]
    for s,h in zip([s for s in sources['sources'] if s['id'] in ['I1','I2','I3','I4','I5','I6']],[3,3,2,4,2,2])])
audit=''
for n in cat['needs']:
    rows=[]
    for r in req:
        if r['need'] != n['id']: continue
        cells=[f"<strong>{r['id']}{' ★' if r['core'] else ''}</strong><br>{e(r['title'])}<p class='small'>{e(r['description'])}</p>"]
        for o in decisions:
            d=decisions[o][r['id']]
            cells.append(f"<b class='score s{d['score']}'>{d['score']}/3</b> {e(d['decision'])}<p class='small'>{refs(d['sources'])}</p>")
        rows.append(cells)
    audit+=f"<details><summary>{n['id']} — {e(n['title'])}</summary>{table(['Framework outcome','SecAI+','ISC2'],rows)}</details>"
source_register=''.join(f'<li id="source-{s["id"]}"><b>{s["id"]}</b> <a href="{s["url"]}">{e(s["title"])}</a><p>{e(s["note"])}</p></li>' for s in sources['sources'])
conditional='; '.join(f"{r['id']}: {r['condition']}" for r in metrics['conditional_core'])
foundation=metrics['components']['Foundation']
core_table=table(['Foundation must-haves','SecAI+','ISC2','Both'],[
    ['At least mentioned (≥1)',*[fraction(foundation[o],'core_touched') for o in scores]],
    ['Taught at least partly (≥2)',*[fraction(foundation[o],'core_taught') for o in scores]],
    ['Fully covered (=3)',*[fraction(foundation[o],'core_full') for o in scores]],
    ['No specific evidence (=0)',*[fraction(foundation[o],'core_zero') for o in scores]],
])
body=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>SecAI+ and ISC2 — framework review</title>
<style>body{{font:16px/1.5 system-ui,sans-serif;color:#1b293d;background:#f4f6f9;margin:0}}main{{max-width:1180px;margin:auto;background:white;padding:38px}}h1{{font-size:30px;line-height:1.2}}h2{{font-size:22px;margin-top:34px}}a{{color:#075fa3}}.eyebrow,.small{{font-size:13px;color:#516174}}.lead{{font-size:19px}}.note{{border-left:4px solid #397a9e;background:#eff6fa;padding:14px 18px}}table{{border-collapse:collapse;width:100%;font-size:14px;margin:12px 0}}th{{background:#17334b;color:white;text-align:left}}th,td{{padding:10px 12px;border-bottom:1px solid #dae2e9;vertical-align:top}}tbody tr:nth-child(even){{background:#f6f8fa}}.scroll{{overflow:auto}}details{{border:1px solid #dce3ea;border-radius:5px;margin:10px 0;padding:10px 14px}}summary{{cursor:pointer;font-weight:650}}.score{{white-space:nowrap}}.s0{{color:#697482}}.s1{{color:#805c00}}.s2{{color:#1e65a1}}.s3{{color:#14734d}}li{{margin:14px 0}}@media(max-width:700px){{main{{padding:20px}}table{{min-width:640px}}}}@media print{{body{{background:white}}main{{padding:0}}details{{break-inside:avoid}}}}</style><main>
<p class="eyebrow">Research assessment · 1 November 2026 · Catalogue v12 · Model 2 revision 3</p>
<h1>SecAI+ and Building AI Strategy against the full framework</h1>
<p class="lead"><b>SecAI+ is the stronger technical foundation. ISC2 is a shorter introduction with stronger explicit teaching on overconfidence and workforce adaptation. Neither completes Foundation or supplies the agentic operating skills required at L2/L3.</b></p>
<p class="note">These are <b>documented curriculum coverage estimates</b>, not learner competence. All 140 outcomes across 23 needs were reviewed. Scores are based on public teaching specifications; paid lessons and assessment questions were not inspected. A zero means no sufficiently specific evidence found. The score is sensitive to the detail a provider publishes.</p>
{comparison}
<p class="small">SecAI+ means CY0-001-aligned training, using CertMaster Perform as the purchasing route. The exam alone earns no teaching credit. Partner outlines corroborate topic and activity detail; their exact labs are not guaranteed in every delivery. Prices observed on <a href="https://www.comptia.org/en-us/certifications/secai/">CompTIA</a> and <a href="https://www.isc2.org/professional-development/certificates/build-ai-strategy">ISC2</a>; region and tax can change the payable amount.</p>
<h2>Coverage by framework component</h2>{component_table}
<p class="small">Foundation excludes N4.7/N5.7; L2 includes N4.7; agent-engineering additions remain role specialisms. Component figures average their applicable original needs, not raw outcome counts. Shared L1/L2/L3 rows are additions, not complete cumulative learning paths. Role-specialism row uses the 76 outcomes assigned primarily there; reused vendor-evaluation outcomes remain in L3 and count once globally. Tool training needs local platform selection and is not a 24th scored need.</p>
{core_table}
<p><b>Key must-have gaps:</b> agent anatomy and the complete safety stack; independent verification of impersonation; bank rules; task delegation with success criteria; trustworthy supervision and intervention; reusable Skills; benchmark cases and repeatable evaluation. Some are touched, but mention is not completion. Neither route publicly demonstrates full practical coverage of the N6–N14/R outcomes.</p>
<p><b>Buying both:</b> the outcome-wise maximum gives {pct(overall['Both']['coverage'])} whole-framework coverage, only {overall['Both']['coverage']-overall['SecAI']['coverage']:.1f} percentage points above SecAI+ alone, for another 16 hours. ISC2's distinctive contribution is human judgement and organizational adaptation. A focused supplement on those topics is more efficient than treating the full certificates as consecutive mandatory training.</p>
<h2>What was reviewed</h2>
<p><b>SecAI+:</b> official Overview, training comparison, expanded product descriptions, Resources/FAQs and CertMaster learning pages; all 15 objectives across the four domains of the publisher's 13-page specification; the full six-module teaching outline and an authorized provider's named activities/labs. See S0–S4 below. The public exam specification still contains pre-launch logistics; current official product details take precedence for exam format and price. Exam objectives describe assessed scope; teaching and activity sources establish the training interpretation. Fine-grained self-paced delivery remains provisional.</p>
<p><b>ISC2:</b> bundle details and all six linked included-course pages, including product details, learning experience, learning outcomes, audience, prerequisites and completion information. Related products outside the six-course bundle were not credited. Each course includes learning activities and assessment; four explicitly name case-study activities. Unspecified exercises do not establish every practical outcome.</p>
{course_table}
<h2>All 23 needs</h2>
<p class="small">Core ≥2 means at least partial teaching, not full satisfaction. Full requires every applicable outcome at 3; Strong ≥70% and no must-have at zero; Partial ≥30%; otherwise Weak.</p>{needs_table}
<h2>Catalogue implications</h2>
<p>ISC2's bundle is already <b>TR-014</b>; <b>TR-015</b> is its AI for Cybersecurity component and must not receive duplicate credit. Its current recorded whole-framework coverage is 3.7%; this deeper public-page review supports 13.6%. <b>TR-023</b> is the SecAI+ exam, while <b>TR-155</b> is a separate Pluralsight preparation path. Neither is interchangeable with the official CertMaster Perform offer assessed here. The new evidence warrants revisiting TR-014 and assessing official training as a distinct record. Existing records, assessments and app snapshots have not been changed.</p>
<p><b>Recommended use:</b> choose SecAI+ for experienced cyber staff needing broad AI-security grounding; choose ISC2 for a lighter strategic introduction, particularly human oversight and workforce change. Add targeted bank-context training and hands-on agent use, supervision, Skills and evaluation. These additions need their own assessed evidence before they earn coverage.</p>
<h2>Method and audit</h2>
<p>0 = no specific public teaching evidence; 1 = mention/touch; 2 = taught but incomplete or lacking required practice; 3 = the complete outcome supported. Knowledge outcomes can reach 3 without labs; practical outcomes require suitable exercise evidence. No practical outcome was given 3 merely because the course has labs or case studies. Whole-framework coverage is the equal-weight mean of 23 need percentages. Within each need: sum of scores ÷ (3 × outcome count). Combined coverage uses each outcome's best score, never addition.</p>
<p>Must-have fractions use outcome counts, with the denominator shown. All conditional must-haves are included for this full-framework comparison: {e(conditional)}. Individual role pathways should apply their actual conditions. Coverage of all specialisms is a breadth comparison, not a demand that every employee study all of them.</p>
<p><a href="outcome-assessment.csv">Download all 140 outcome decisions (CSV)</a> · <a href="metrics.json">Calculated metrics (JSON)</a>. ★ denotes a must-have. Open a need below for the exact requirement, score, reasoning and source reference.</p>
{audit}
<h2>Source register</h2><p class="small">Accessed 1 November 2026. Source references after a colon identify objective, module or page, not a separate course. No reviews or marketing claims were used as proof of curriculum completion.</p><ol>{source_register}</ol>
</main></html>'''
(out/'review.html').write_text(body)
print(json.dumps({'overall':metrics['overall'],'components':{k:{o:round(v['coverage'],1) for o,v in ms.items()} for k,ms in metrics['components'].items()},'foundation_core':{o:{k:v for k,v in ms.items() if k.startswith('core')} for o,ms in foundation.items()}},indent=2))
