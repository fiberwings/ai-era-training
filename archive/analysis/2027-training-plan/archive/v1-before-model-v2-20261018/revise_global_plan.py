"""Prepare the global curricula and a scoped in-house learning design.

Read-only with respect to the catalogue. Run before analyse.mjs and build_report.py.
The archived baseline is intentional: repeated runs produce the same design.
"""
import copy, json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE.parents[1]/'training-planner/public/data/catalogue.json').read_text())
OPTIONS = json.loads((HERE/'archive/before-global-in-house-option/options.json').read_text())
EXCLUSIONS = {
    'TR-128': 'National-agency AI-systems companion note; outside the global curriculum. Available for local review.',
    'TR-129': 'National-agency agentic-AI note; outside the global curriculum. Available for local review.',
    'TR-125': 'National-agency guidance in French; outside the common global curriculum. Available for local review.'
}
for option in OPTIONS:
    option['assumptions'] = option['assumptions'].split(' V9 corporate-scope revision')[0]
    option['assumptions'] += ' Global curriculum: nationally framed guidance is not assigned as common training. TR-125, TR-128 and TR-129 are excluded; globally applicable technical frameworks are retained. Jurisdiction-specific obligations belong in relevant local-role supplements, with separate time allowances.'
    option['excluded'] = sorted(set(option.get('excluded', []) + list(EXCLUSIONS)))
    for cohort, ids in option.get('selected', {}).items():
        option['selected'][cohort] = [i for i in ids if i not in EXCLUSIONS]
    for layer, ids in option.get('allow', {}).items():
        option['allow'][layer] = [i for i in ids if i not in EXCLUSIONS]
    for items in option['internal'].values():
        for item in items:
            item['outcomes'] = item['outcomes'].replace(' Teach the bank-approved environment; no personal-assistant workstation bulletin is assigned.', '')

hybrid = copy.deepcopy(OPTIONS[1])
hybrid['id'] = 'option-4'
hybrid['name'] = '2027 Option 4 — Quality core and in-house capability'
hybrid['assumptions'] += ' Targeted in-house modules teach the actual work, platforms, controls and operating model. The N14 workflow workshop replaces INT-2478 in the Expert and leadership paths. Planned internal coverage is unassessed; it never adds points to course coverage. Foundation internal learning is 4h; Practitioner internal learning is 8h; Technical Expert 12h; Governance Expert 8h; Leadership 6h; specialists 4h. Expert pathways are alternatives. Development effort is separate from learner time.'
for cohort in ['technical', 'governance', 'leadership']:
    hybrid['selected'][cohort] = [i for i in hybrid['selected'][cohort] if i != 'INT-2478']
    hybrid.setdefault('rationale', {})[cohort] = 'Use specialist external teaching, with an internal workshop for actual workflow allocation, autonomy, supervision and adoption. INT-2478 is replaced; its assessed coverage is not transferred.'
hybrid['allow']['allLayers'] = [i for i in hybrid['allow']['allLayers'] if i != 'INT-2478']
hybrid['excluded'] = sorted(set(hybrid['excluded'] + ['INT-2478']))

def reqs(*needs):
    return [r['id'] for r in DATA['requirements'] if r['need'] in needs]

design = []
def module(code, title, cohort, hours, linked, owner, why, agenda, evidence, prerequisites, build, wave):
    item = dict(code=code, title=title, cohort=cohort, hours=hours, requirements=linked,
                owner=owner, why=why, agenda=agenda, evidence=evidence,
                prerequisites=prerequisites, buildHoursEstimate=build, wave=wave, status='Proposed')
    design.append(item)
    return dict(title=f'{code} · {title}', owner=owner, hours=hours, requirements=linked,
                outcomes=f'{agenda} Evidence: {evidence}', status='Proposed')

hybrid['internal']['all'] = [
    module('IH-01', 'What our people are doing with AI', 'all', 1.5, reqs('N1'),
           'Cyber AI adoption lead + champions from all six functions',
           'N1 needs credible examples from colleagues, evidence of results and a clear distinction between available tools and emerging capabilities.',
           '10m orientation; 35m two colleague-led case demonstrations including a failure and its correction; 15m an emerging or restricted-pilot demonstration; 15m domain application; 15m knowledge check and reflection. Use a short case gallery to represent all six functions without six separate lectures.',
           'N1.1: explain one own-domain and one neighbouring-domain use case, including limitations. N1.2: distinguish production, restricted pilot and horizon examples. N1.3: propose two or three changes to own work and identify retained human accountability.',
           'Case owners provide verified examples, permission to demonstrate them, evidence of results and current tool-access status.', [24,40], 'Q1'),
    module('IH-02', 'Our approved tools, agent architecture and boundaries', 'all', 1.5,
           reqs('N2') + ['N4.1','N4.2','N4.4','N4.6','N6.5','N6.6','N6.7'],
           'AI platform owner + IAM + IDP + security architecture',
           'Only internal owners can establish the approved platforms, data routes, identities, access limits and escalation mechanisms.',
           '25m model, modality and agent walkthrough; 25m approved platforms, data flow and connector permissions; 20m approval, logs and stop controls; 20m access/data-boundary decisions. Use one real approved architecture with a simplified diagram.',
           'Label model, harness, tools and controls; select the permitted platform for a data class; distinguish available access from a pilot; locate the correct approval, stop and escalation route.',
           'Current platform inventory, data-handling rules, approved access routes, accessible demonstration and reviewed diagrams.', [20,32], 'Q1'),
    module('IH-03', 'Safe use in my job — coached case and Gate 1', 'all', 1,
           ['N3.1','N3.5','N3.6','N3.7','N4.1','N4.2','N4.6','N6.1','N6.2','N6.3','N6.4','N6.8'],
           'Domain training lead + IDP/policy reviewer',
           'A local exercise tests judgement against the bank rules after the external foundation, without repeating general AI-awareness content.',
           '15m coached case; 30m individual safe-use scenario; 15m feedback. Use approved or synthetic data and a task representative of the learner’s function.',
           'Reject an unsafe data/tool choice, detect a planted unsupported claim or injection, verify the output and record accountability. Safety-critical decisions must pass.',
           'Independent answer key, domain case variants, accessible format and calibrated assessor checklist.', [12,20], 'Q1–Q2')
]
hybrid['internal']['practitioner'] = [
    module('IH-04', 'Supervise and recover an agent on our platform', 'practitioner', 2, reqs('N7')+['N4.7','N8.4'],
           'Domain operations owner + AI platform team',
           'Supervision depends on the actual console, action permissions, logs, approvals and recovery runbook.',
           '30m workflow and permissions; 60m trace-review and planted-error lab; 30m stop, revoke, rollback and manual-fallback exercise.',
           'Delegate within an approved action class, inspect permissions and changes, identify planted failures, stop/revoke safely and produce an accountable handover.',
           'Stable approved sandbox or realistic simulation, seeded traces and a tested recovery path.', [24,40], 'Q2'),
    module('IH-05', 'Create, own and retire a shared Skill', 'practitioner', 2, reqs('N8')+['N9.4'],
           'Domain automation champion + Skill-library owner + IAM',
           'The catalogue has no evidenced teaching for Skill maintenance and shared-library ownership; internal conventions must be taught directly.',
           '30m worked example and third-party vetting; 60m create a focused Skill and safe connector specification; 30m peer review, ownership, monthly review and deprecation.',
           'Submit a trigger, steps, expected output, failure modes and tests; name an owner and review/deprecation rule; justify connector permissions and provenance.',
           'Agreed Skill template, library workflow, ownership rules, approved connector list and model-change notification route.', [16,24], 'Q2'),
    module('IH-06', 'Domain test cases and release checks', 'practitioner', 2, reqs('N9'),
           'Domain evaluation lead',
           'Useful benchmark answers and known faults come from the function’s own work; a generic course cannot supply the approved cases.',
           '30m independent answers and known faults; 60m build and run five representative cases with pass/fail checks; 30m simulate a model/Skill change and submit results to the domain evaluation process.',
           'Versioned cases, known faults and acceptance checks; rerun record; contribution to the shared domain evidence store.',
           'Labelled cases, approved data, a simple supported evaluation harness and result-submission format.', [16,24], 'Q2'),
    module('IH-07', 'Agent-supervisor observed sign-off', 'practitioner', 2, reqs('N7','N8','N9')+['N4.7'],
           'Domain Expert assessor + tool owner',
           'Course completion cannot establish safe operational supervision in this environment.',
           '75m observed task with injected faults and a connector change; 30m independent challenge; 15m feedback and scope-of-authority record.',
           'Pass each safety-critical action and justify an evidence-based release decision. Record permitted action classes and any remediation.',
           'Assessor calibration and test cases withheld from coached practice.', [12,20], 'Q2')
]

workflow_why = 'N14 concerns real workflow allocation, approval gates, workload and accountability. A workshop with the actual process owner is more actionable than generic organisational-redesign teaching.'
workflow_evidence = 'An approved before/after workflow, human/agent task split, supervision ratio hypothesis, autonomy limits supported by evaluation, value baseline, owner and refresh plan.'
hybrid['internal']['technical'] = [
    module('IH-08T','Workflow and supervision design studio','technical',3,reqs('N14'),
           'Process owner + technical lead + operational supervisor',workflow_why,
           '45m map current work; 60m redesign tasks and approval points; 45m review evaluation evidence and supervision load; 30m agree measures and ownership.',workflow_evidence,
           'One candidate workflow, operational baseline and access to the process owner.',[12,20],'Q3'),
    module('IH-09T','Build, evaluate and secure a scoped agent','technical',7,reqs('N10','N11','N12')+['N5.7'],
           'AI engineering + AppSec + domain evaluation lead',
           'The capstone must exercise approved architecture, identities, deployment controls and bank-specific test evidence.',
           '2h configure an existing approved scaffold; 2h tests and human-label calibration; 2h attack, recovery and production-monitoring rehearsal; 1h evidence dossier. Reuse one project across the pathway.',
           'Versioned implementation and test cases, human-checked judge results, working controls, attack/recovery trace, monitoring and ownership record.',
           'Prepared scaffold and sandbox; Python readiness. Seven hours assumes adaptation of a scaffold, not a production build from scratch.',[28,44],'Q3'),
    module('IH-10T','Independent technical challenge','technical',2,reqs('N10','N11','N12','N14')+['N5.7'],
           'Independent technical assessor',
           'An independent test establishes the demonstrated scope and residual gaps.',
           '75m reproduce an unseen failure and recovery; 30m design/evidence challenge; 15m feedback and permitted-scope record.',
           'Reproducible test evidence and pass on all critical controls within the authorised action class.',
           'Calibrated challenge pack distinct from practice.',[8,12],'Q4')
]
hybrid['internal']['governance'] = [
    module('IH-08G','Workflow, supervision and accountability studio','governance',2,reqs('N14'),
           'Process owner + AI risk lead',workflow_why,
           '30m current workflow; 45m autonomy/approval design; 30m value and oversight measures; 15m ownership agreement.',workflow_evidence,
           'Use the same workflow and shared studio template as technical colleagues.',[4,8],'Q3'),
    module('IH-09G','Bank AI-risk and assurance evidence case','governance',4,reqs('N11','N13')+['N5.7'],
           'AI risk lead + assurance lead + domain evaluator',
           'Risk acceptance, vendor approval and control ownership depend on the internal governance process.',
           '1h inventory and risk scenario; 1h control/vendor dossier; 1h independent-test and judge-evidence review; 1h risk decision and escalation. Map local obligations only for the role and jurisdictions concerned.',
           'Traceable risk decision, control evidence, vendor challenge, human-labelled evaluation sample and named residual-risk owner.',
           'Approved templates, risk appetite, review forum and a redacted vendor/use-case dossier.',[20,32],'Q3'),
    module('IH-10G','Independent governance challenge','governance',2,reqs('N11','N13','N14'),
           'Independent risk/assurance assessor',
           'Assess whether the learner can challenge evidence and defend a decision.',
           '75m evidence challenge; 30m reviewer calibration; 15m feedback and decision-rights record.',
           'Defend the risk decision with test evidence, recognise weak automated evaluation and specify unresolved conditions.',
           'Challenge dossier and calibrated assessors.',[8,12],'Q4')
]
hybrid['internal']['leadership'] = [
    module('IH-08L','Operating-model and tool-selection decision studio','leadership',2,reqs('N11','N13','N14'),
           'CIO strategy lead + process owners + AI risk lead',workflow_why,
           '30m workflow/value baseline; 45m vendor and autonomy decision; 30m supervision capacity and junior-skill retention; 15m ownership and next evidence request.',
           workflow_evidence+' Challenge at least one vendor claim and one weak evaluation result.',
           'Common studio template, vendor evidence and budget/role constraints.',[4,8],'Q1'),
    module('IH-09L','Quarterly evidence and adoption forums','leadership',4,reqs('N11','N13','N14'),
           'CIO + domain heads + evaluation lead',
           'Leaders need repeated decisions using actual adoption and control evidence.',
           'Four 1h forums: baseline and test-set quality; autonomy and judge validation; production drift/value; refresh and accountability. Include a short coached lesson before the decision.',
           'Four decision records connecting evaluation results to adoption, supervision capacity, permissions and investment.',
           'Quarterly portfolio evidence, human-labelled samples and attendance by accountable owners.',[12,20],'Q1–Q4')
]

# Keep four hours per specialty. These are separate role branches, not a common assignment.
for cohort, items in hybrid['internal'].items():
    if cohort in ['all','practitioner','technical','governance','leadership']:continue
    for item in items:
        item['outcomes'] = '1h internal runbook/control walkthrough; 2h coached role-specific exercise; 1h observed challenge and feedback. '+item['outcomes']
        item['status']='Proposed'

OPTIONS.append(hybrid)
(HERE/'options.json').write_text(json.dumps(OPTIONS,indent=2,ensure_ascii=False))
(HERE/'global-exclusions.json').write_text(json.dumps(EXCLUSIONS,indent=2))
(HERE/'in-house-design.json').write_text(json.dumps(dict(
    status='Proposed; no internal module has an assessed teaching score', modules=design,
    buildEstimateBasis='Initial planning allowances in person-hours for a reusable pilot pack, including SME design, instructional design, review and pilot repair; not vendor quotes. Exclude learner time, delivery, translations, travel, platform engineering and ongoing updates. Shared N14 template design counted once in IH-08T; governance/leadership rows are adaptations.',
    specialistBuildEstimatePerBranch=[12,20],
    casesAre='Candidate briefs, not claims about existing deployments',
    cases=[
        dict(function='Cyber Defence Centre',candidate='Alert enrichment and incident chronology',evidence='Show source traceability, a missed/incorrect signal, analyst correction and measured review effort.'),
        dict(function='Information Data Protection',candidate='DLP triage or classification suggestions',evidence='Show data boundaries, a misclassification and the human decision.'),
        dict(function='BISO',candidate='Policy/control mapping and evidence drafting',evidence='Show authoritative source links, an unsupported claim and reviewer correction.'),
        dict(function='Application Security',candidate='Code finding explanation and test generation',evidence='Show a false positive, reproducible test and developer review.'),
        dict(function='Identity & Access Management',candidate='Access-review evidence preparation',evidence='Show identity/permission limits, an escalation and retained human approval.'),
        dict(function='CIO',candidate='Tool comparison and adoption decision support',evidence='Show test evidence, cost/oversight assumptions and a rejected vendor claim.')
    ]),indent=2,ensure_ascii=False))
print('Prepared four global options and',len(design),'in-house module briefs; catalogue unchanged.')
