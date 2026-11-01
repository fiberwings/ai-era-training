from pathlib import Path
import json, shutil, hashlib
P=Path(__file__).resolve().parent; R=P.parent
archive=R/'analysis/2027-training-plan/archive/v2-before-must-have-review-20261018'
archive.mkdir(parents=True,exist_ok=True)
files=list((R/'analysis/2027-training-plan').glob('*'))
files += [R/'Agentic-Era_Workforce_Capability_Model.md',R/'Capability_Model_Crosswalk.csv',R/'training-planner/public/data/default-scenario.json',R/'training-planner/Training-Planner.html']
manifest=[]
for f in files:
    if not f.is_file():continue
    dest=archive/f.name
    if not dest.exists():shutil.copy2(f,dest)
    manifest.append({'file':f.name,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
(archive/'archive-manifest.json').write_text(json.dumps({'files':manifest},indent=2))
shutil.copy2(R/'AI_Era_Cyber_Training_Catalogue_v10.xlsx',R/'catalogue-archive/AI_Era_Cyber_Training_Catalogue_v10.xlsx')
shutil.copy2(R/'Agentic-Era_Workforce_Capability_Model.md',R/'model-history/Agentic-Era_Workforce_Capability_Model-before-must-have-review.md')
d=json.loads((P/'before.json').read_text()); req={r['id']:dict(r) for r in d['requirements']}
promote='N6.4 N7.1 N9.4 N11.2 N12.6 N13.1 N14.4 N14.7 R1.1.1 R3.2.2 R4.1.2 R4.2.7 R5.1.4 R6.1.2 R9.1.3'.split()
for q in promote:req[q]['core']=True
req['N6.4']['title']='Accountability'
req['N5.1'].update(title='AI-enabled social engineering and impersonation',description='Explain how AI enables phishing and tailored social engineering at scale, including voice and video deepfakes used for impersonation. Recognise illustrative examples and explain why identity should be verified through an independent trusted channel. Deepfakes are an example of deception; production techniques are not required.')
req['N5.8']={'id':'N5.8','need':'N5','level':'Base','rank':0,'core':True,'title':'Overview of AI security risks','description':'Recognise the main categories of security risk affecting AI systems and agents, informed by OWASP\'s LLM and agentic risk frameworks: instruction manipulation, sensitive-information disclosure, unsafe output handling, excessive permissions or actions, compromised components or information sources, and service disruption or uncontrolled resource consumption. Explain a simple example of each and identify an appropriate precaution or escalation route. Foundation awareness does not require threat modelling or memorising framework identifiers.','source':{'sheet':'Rubric','row':142}}
req['R3.1.2'].update(title='Applying a structured testing method',description='Apply a structured method to test an AI system or agent: define the scope and attack surface, choose relevant attack cases, execute repeatable tests, record evidence and report findings. Use suitable guidance such as the OWASP GenAI Red Teaming Guide, the CSA Agentic AI Red Teaming Guide or MITRE ATLAS; familiarity with every named publication is not required.')
req['R4.1.3'].update(title='Verifying approved components and detecting changes',description='Verify that an agent uses the approved versions of its tools, Skills and connectors, detect changes to their code or descriptions, and require review before changed components are trusted. Use suitable integrity and change-control mechanisms, such as version pinning, signatures or hashes; a particular hashing implementation is not required.')
conditions={'N11.3':'When automated judges are used','R6.1.2':'When assurance work itself uses AI','R3.1.3':'For multi-agent testing responsibilities','N14.7':'For leadership responsibilities','R9.1.2':'For delegated-identity integration responsibilities'}
notes={q:'Must-have review approved 18 October 2026. Essential at the depth of the assigned responsibility.' for q in promote}
for q,condition in conditions.items():req[q]['coreCondition']=condition; notes[q]='Applicability: '+condition+'. Must-have when applicable.'
notes['N5.1']='Replaces the former N5.1 and N5.2. Reassessed against the merged knowledge outcome; no automatic transfer of old scores.'
notes['N5.2']='Retired 18 October 2026. Merged into N5.1. Original wording and score evidence retained for traceability.'
notes['N5.8']='New common Foundation outcome. N5.4 retains bank-specific attack examples; N12.1 retains specialist threat modelling. Cyber-specific content for all cyber staff.'
for q in ['N2.4','N2.6']:notes[q]='Foundation depth: explain the components and their purpose. Implementation depth belongs to builders and relevant specialists.'
req.pop('N5.2')
(P/'requirements.json').write_text(json.dumps({'requirements':list(req.values()),'notes':notes,'promoted':promote,'conditions':conditions},indent=2))
print('Archived previous deliverables; prepared 140 active outcomes, with N5.2 retired and N5.8 new.')
