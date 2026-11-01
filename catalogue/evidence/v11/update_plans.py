from pathlib import Path
import json
P=Path(__file__).resolve().parent;R=P.parent;A=R/'analysis/2027-training-plan'
config=json.loads((A/'plan-config-v2.json').read_text());design=json.loads((A/'in-house-design-v2.json').read_text())
# Keep agreed course budgets. Make the risk overview a bank-led, scenario-based
# Foundation module rather than assigning an advanced 122-page reference to all.
config['assumptions']+=' V11 must-have review: N5.1 merges deepfake impersonation, N5.8 adds a separate Foundation cyber risk overview, N5.4 retains bank attack examples. Core flags and four changed outcomes are reassessed. Automated-judge validation is essential for the L3 route using judges; AI-assisted assurance is essential for BISO using AI in assurance. Identity delegation protocol depth belongs to integration. Existing course budgets are retained; the new 45-minute internal risk overview is explicit additional learner time and earns no assessed credit.'
config['rationale']['all']='Retain the accessible AI-literacy course and AI social-engineering course within the 4h course budget. The merged social-engineering outcome has partial evidenced coverage; independent trusted-channel verification is practised internally. Add a 45-minute cyber risk overview using the OWASP risk families, then use separate bank attack examples. Full technical reference readings are not assigned to all staff. Internal learning remains unassessed until validated.'
config['activities']={'technical':['automated-judges'],'biso':['ai-assisted-assurance']}
for m in design['modules']+design['adaptations']:
    m['requirements']=[q for q in m['requirements'] if q!='N5.2']
    if m['code']=='IH-F03':
        m['title']='AI limitations, bank attack examples and knowledge check'
        m['agenda']='Use sanitised or clearly labelled illustrative bank attack cases (N5.4), recognise AI-enabled intrusion, examine planted false outputs and practise independent identity verification. Deepfakes are a brief impersonation example within social engineering. Finish with a knowledge check and feedback.'
    if m['code']=='IH-IAM':m['requirements'].remove('R9.1.2')
    if m['code']=='IH-IAM-D':m['requirements'].insert(0,'R9.1.2')
design['modules'].insert(3,{'code':'IH-F04','title':'Overview of AI security risks','cohorts':['all'],'hours':0.75,'requirements':['N5.8'],'owner':'Cyber awareness lead + AI security architect','why':'Give every cyber employee a coherent risk map before specialist depth. Keep this separate from N5.4 bank attack examples and N4 employee responsible-use rules.','agenda':'Explain six risk families: instruction manipulation, disclosure, unsafe output handling, excessive permissions/actions, compromised components/sources, and service disruption/resource consumption. Use a short scenario for each, connect it to a precaution or escalation, and check recognition. Use current OWASP LLM and agentic guidance as trainer references; no framework-ID memorisation or exploitation lab.','evidence':'Learner categorises short scenarios, explains the consequence and selects the appropriate precaution/escalation. Pilot and assess the module against N5.8 before awarding coverage credit.','prerequisites':'Trainer-reviewed OWASP risk map, answer key, approved escalation route and accessible examples.','buildHoursEstimate':[8,12],'wave':'Q1','status':'Proposed'})
(A/'plan-config-v3.json').write_text(json.dumps(config,indent=2)+'\n');(A/'in-house-design-v3.json').write_text(json.dumps(design,indent=2)+'\n')
for name in ['build_plan.mjs','build_report.py','verify_analysis.py','report_template.html']:
    f=A/name;t=f.read_text().replace('v2','v3').replace('version 2','version 3').replace('Version 2','Version 3')
    # The capability model schema stays v2; this is its third content revision.
    t=t.replace("s.planVersion=2","s.planVersion=3").replace('planVersion:2','planVersion:3')
    if name=='build_plan.mjs':
        t=t.replace("c.selected=selected[c.id];","c.profile.activities=config.activities[c.id]||[];\n c.selected=selected[c.id];")
        t=t.replace('cumulativeRequirements:cumReqs.length','cumulativeCoreIds:cumReqs.filter(r=>r.core).map(r=>r.id),cumulativeRequirements:cumReqs.length')
    if name=='verify_analysis.py':
        t=t.replace("expected='99e0e8947444068999a2bb9f9196a4f237250bb2ed7b6f73eb808a997a9a743b'", "expected=DATA['sourceSha256']")
        t=t.replace('AI_Era_Cyber_Training_Catalogue_v10.xlsx','AI_Era_Cyber_Training_Catalogue_v11.xlsx')
        t=t.replace("REQ[r]['core'] and score(ids,r)==0 for r in reqs", "is_core(r,c) and score(ids,r)==0 for r in reqs")
        t=t.replace("REQ[r]['core'] and score(ids,r)==0 for r in cum", "r in row['cumulativeCoreIds'] and score(ids,r)==0 for r in cum")
        t=t.replace("REQ[r]['core'] and score(ids,r)==0 for r in nr", "is_core(r,c) and score(ids,r)==0 for r in nr")
        t=t.replace('def verify():',"def is_core(r,c):\n    activity={'N11.3':'automated-judges','R6.1.2':'ai-assisted-assurance'}.get(r)\n    return REQ[r]['core'] and (not activity or activity in c['profile'].get('activities',[]))\n\ndef verify():")
        # Keep validating original archived model-v1 files as well.
        t=t.replace('archive/v1-before-model-v3-20261018','archive/v1-before-model-v2-20261018')
    if name=='build_report.py':
        t=t.replace('archive/v1-before-model-v3-20261018','archive/v2-before-must-have-review-20261018')
    if name=='report_template.html':
        t=t.replace('Catalogue v10','Catalogue v11')
        t=t.replace('The current model changes applicability, not the underlying rubric or scores.','The approved must-have review changes essential flags, merges social engineering and deepfakes, adds N5.8 risk awareness and reassesses four outcomes. Conditional essentials follow the profile activities and responsibilities.')
        t=t.replace('All source scores, evidence and the v10 workbook remain unchanged.','The v10 workbook and previous plans are archived. V11 preserves unchanged assessments and records fresh evidence for the revised outcomes. The Foundation adds a 45-minute internal risk overview, with no automatic score credit.')
        t=t.replace('preserved with 34 file hashes.','preserved with an archive manifest.')
    f.write_text(t)
# Active report pack readme, preserving v2 as historical.
old=(A/'Read-me-v2.txt').read_text()
(A/'Read-me-v3.txt').write_text(old.replace('v2','v3').replace('Version 2','Version 3').replace('v10','v11')+'\nApproved must-have review: N5.8 is a new cyber risk overview; N5.4 remains bank attack examples. See the model document and v11 change report for reassessment and conditional applicability.\n')
