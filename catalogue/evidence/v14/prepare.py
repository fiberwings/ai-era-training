"""Prepare the reviewed Udemy additions; values are authored by Artifact Tool."""
from pathlib import Path
from datetime import date
import json

ROOT=Path(__file__).resolve().parents[3]
P=Path(__file__).resolve().parent
W=ROOT/'.work/catalogue/v14'
W.mkdir(parents=True,exist_ok=True)
cat=json.loads((ROOT/'training-planner/catalogue-history/ba0634eb6d9be98d.json').read_text())
assert cat['version']=='ba0634eb6d9be98d'
(W/'baseline.json').write_text(json.dumps(cat))

# Course-specific observations from the expanded public curriculum, 1 November 2026.
courses=[
 dict(id='TR-281',title='CompTIA SecAI+ (CY0-001) Complete Course from CertMike!',instructors='Mike Chapple; Fred Nwanganga',slug='comptia-secai-certmike',rating=4.6,ratings=580,duration='6h 11m',sections=30,lectures=147,updated='8/2026',practice='Videos and knowledge checks; no learner lab or practical exercise verified.',summary='Compact instruction on AI types and training, RAG, prompting, lifecycle controls, AI attacks, access and data controls, monitoring, security automation, governance and compliance.'),
 dict(id='TR-282',title='CompTIA SecAI+ (CY0-001) Complete Course & Exam Prep 2026',instructors='Avnish Singh; Pavan Kumar',slug='comptia-secai-plus-cy0-001-exam-prep',rating=4.5,ratings=559,duration='25h 30m',sections=27,lectures=185,updated='9/2026',practice='25 role plays, quizzes, assignments and one practice test advertised. Role plays involve explaining and defending decisions; completion time beyond video is not stated. Technical lab execution is not verified.',summary='Extended instruction on models, prompting, RAG, threat frameworks, gateway and access controls, data protection, monitoring, attack analysis, MCP and security use cases, no-code automation, CI/CD, governance, responsible AI and regulatory frameworks.'),
 dict(id='TR-283',title='CompTIA SecAI+ CY0-001: Full Certification Prep Bootcamp',instructors='Alexander Oni',slug='comptia-secai-cy0-001-full-certification-prep-bootcamp',rating=4.5,ratings=67,duration='11h',sections=15,lectures=99,updated='3/2026',practice='Two named ChatGPT demonstrations on threat-report summarisation and vulnerability identification, section quizzes and final practice exam. Demonstrations do not establish learner practice.',summary='AI concepts, model training and prompts; secure data; threat modelling; gateway, access and data controls; monitoring and audit; attacks and compensating controls; security use cases, automation, governance and compliance.'),
 dict(id='TR-284',title='CompTIA SecAI+ CY0-001: The Complete AI Security Course 2026',instructors='Nasser Alaeddine',slug='comptia-secai-plus-cy0-001-ai-security',rating=4.8,ratings=31,duration='7h 41m',sections=18,lectures=88,updated='10/2026',practice='Animated/interactive video lessons and two domain-weighted practice exams with explanations. Interactive presentation is not verified hands-on learner practice.',summary='AI foundations, prompting and redaction, secure lifecycle, threat modelling, guardrails and gateways, IAM, monitoring, attack evidence and compensating controls, AI security use cases, low/no-code automation, change approval/rollback, agents/MCP and GRC.'),
 dict(id='TR-285',title='CompTIA SecAI+ CY0-001: Complete Course: AI Cybersecurity',instructors='Vision Training Systems',slug='secai-cy0-001',rating=4.7,ratings=28,duration='5h 45m',sections=4,lectures=46,updated='2/2026',practice='17 demonstrations advertised across the four modules, including data minimisation, model poisoning, incident summaries and authority mapping. Independent learner exercises or lab deliverables are not verified.',summary='Four-module AI security course with demonstrations of prompting, data cleansing and minimisation, threat modelling, controls, attack evidence, AI-assisted categorisation/reconnaissance/reporting, governance authority and NIST risk-framework mapping.'),
]
for c in courses:c['url']='https://www.udemy.com/course/'+c['slug']+'/'

# Each topic contains an original assessment rationale and an explicit outcome/score
# map. Only courses with their own observed matching lectures receive that topic.
topics={
 'uses':('Cybersecurity detection, code/vulnerability analysis, incident handling and summarisation are taught; complete neighbouring-domain and bank-workflow coverage is not established.',{'N1.1':2,'N1.2':1,'N1.3':1,'N6.8':1,'N14.2':1}),
 'models':('AI/model types and training are explained. The full comparison of providers, hosting, pricing, tokens and reasoning effort is not established.',{'N2.1':2,'N6.5':1}),
 'modalities':('Language processing and generative content are introduced; the complete set of modalities and cross-modal action is not established.',{'N2.2':1}),
 'agents':('Assistants and security automation are described; agent teams and the complete model/harness/instruction/memory/tool loop are not established.',{'N2.3':2,'N2.4':1,'N10.1':1}),
 'mcp':('MCP and tool plug-ins are explained in the security-tool curriculum; reusable Skills and MCP implementation are not taught in sufficient detail.',{'N2.5':2,'N8.4':1}),
 'safety':('Access restrictions, guardrails, gateways and monitoring are taught; a complete agent sandbox/authorisation/stop design is not established.',{'N2.6':2,'N7.1':1,'N7.2':1,'N10.8':1,'N12.2':1,'N12.4':2,'N12.5':2,'N12.6':2,'R5.1.2':1,'R5.1.4':1,'R6.1.1':1,'R9.1.1':1,'R9.1.3':1,'R9.1.10':1}),
 'errors':('Hallucination, overreliance and accuracy checks are explicit topics; recognition in the learner\'s own tool and all prescribed counter-habits are not established.',{'N3.1':2,'N3.6':2,'N3.7':1,'N6.3':2,'N7.3':1}),
 'prompt':('Prompt roles, examples and templates provide partial context-setting instruction. Success criteria, task delegation and own-work exercises remain gaps.',{'N6.2':2}),
 'data':('Data protection, privacy, classification/redaction or minimisation are taught. Bank-approved platforms, actual client-data rules and residency decisions require local teaching.',{'N4.1':2,'N4.2':2,'N6.7':1}),
 'attacks':('AI poisoning, injection, leakage/theft and related attacks and controls are explained. Agent-specific indirect/tool-poisoning and cross-agent testing remain incomplete.',{'N3.5':2,'N4.4':2,'N4.7':1,'N5.4':2,'N5.6':2,'N5.7':1,'N5.8':2,'N12.7':1,'R3.1.1':2,'R3.1.4':1,'R4.1.6':1}),
 'enhanced':('AI-enabled deception, reconnaissance and automated attacks are taught. Independent-channel identity checks and domain-specific recognition practice are not established.',{'N5.1':2,'N5.3':2,'N5.5':1}),
 'threat':('AI threat modelling and threat-framework use are explained. Agentic attack coverage and a complete learner testing exercise are not verified.',{'N12.1':2,'R3.1.2':1}),
 'monitor':('Prompt/log and model-quality monitoring, cost controls and auditing are taught; immutable agent tool-call traces, kill switches and forensic reconstruction are incomplete.',{'N11.5':2,'N13.6':2,'R1.1.3':1,'R1.2.2':1,'R6.1.2':1}),
 'validate':('Model validation or control testing is taught, but a personal benchmark/fault catalogue, explicit pass/fail suite and domain-wide judge validation are not established.',{'N9.1':1,'N9.3':1,'N11.1':1,'N11.4':1}),
 'fix':('Attack evidence and compensating controls are taught; full remediation/retest of red-team findings and compromised-agent cleanup are not established.',{'N12.8':2,'R1.1.1':1,'R1.1.4':1}),
 'govern':('AI governance roles, responsible use, policies and risk are taught. Bank action classes, autonomy evidence and staffing ratios are not established.',{'N6.4':2,'N7.5':1,'N13.1':1,'N13.2':2,'N13.3':1,'N13.4':1,'N14.1':1,'N14.3':1,'N14.7':2,'R5.1.1':1}),
 'compliance':('AI compliance frameworks and corporate policies are taught. AI-literacy duty, regional supervisory requirements and the bank\'s actual policy need supplementation.',{'N4.5':2,'N4.6':1,'N13.5':2}),
 'ip':('AI intellectual-property and data-sovereignty risks are explicit topics; practical hosting/residency decisions remain incomplete.',{'N4.3':2,'N10.5':1}),
 'rollback':('Change approvals, deployment and rollback are explicit automation topics. Mid-task agent interruption, continuity and revocation drills are not established.',{'N7.4':1}),
 'regression':('Software/model regression testing and automated CI/CD rollback are explicit topics; Skills-specific change-triggered evaluation is incomplete.',{'N9.4':1,'N12.8':2}),
 'authority':('Governance decision authority is demonstrated; agent action tiers and external authorisation enforcement are not fully established.',{'N14.7':2,'N13.3':1,'R5.1.1':1}),
}
course_topics={
 'TR-281':'uses models modalities agents mcp safety errors prompt data attacks enhanced monitor validate govern compliance ip',
 'TR-282':'uses models modalities agents mcp safety errors prompt data attacks enhanced threat monitor validate fix govern compliance ip rollback regression',
 'TR-283':'uses models modalities agents mcp safety prompt data attacks enhanced threat monitor validate fix govern compliance',
 'TR-284':'uses models modalities agents mcp safety prompt data attacks enhanced threat monitor validate fix govern compliance rollback',
 'TR-285':'uses models modalities prompt data attacks enhanced threat monitor fix govern compliance authority',
}
decisions={}
for c in courses:
    positives={}
    for key in course_topics[c['id']].split():
        rationale,mapping=topics[key]
        for rid,score in mapping.items():
            if rid not in positives or positives[rid]['score']<score:
                positives[rid]={'score':score,'evidence':rationale,'topic':key}
    # Public evidence is assessed independently; no score is copied from another provider.
    decisions[c['id']]={}
    for r in cat['requirements']:
        d=positives.get(r['id'],{'score':0,'evidence':f'No sufficiently specific teaching of {r["title"].lower()} is established by the reviewed public curriculum. Zero records an evidence gap, not proven absence from paid content.','topic':None})
        decisions[c['id']][r['id']]={**d,'evidence':f'V14 public-syllabus review, 1 Nov 2026; {c["instructors"]}. '+d['evidence']+' No full practical credit inferred from videos, quizzes, demonstrations or advertised role plays.','sources':[c['url']]}

selection={
 'reviewDate':'2026-11-01','searchUrl':'https://www.udemy.com/courses/search/?src=ukw&q=secai',
 'method':'Inspect live Most Relevant and Most Reviewed results; deduplicate canonical course slugs against Offers and Tool track. Shortlist taught English-language SecAI+ courses rated >=4.5/5 with >=25 course ratings. These are pragmatic selection thresholds, not a claim of independently measured course quality. Rating count is Udemy course ratings, not enrolled students or instructor-wide reviews. No composite quality score invented.',
 'selected':courses,
 'excluded':[
  {'title':'CompTIA SecAI+ Fundamentals: AI Cybersecurity Basics CY0-001','url':'https://www.udemy.com/course/comptia-secai-fundamentals-ai-cybersecurity-basics-cy0-001/','instructor':'Mana Dowlatshahi Yeganeh','rating':4.7,'ratings':58,'duration':'133h 5m','reason':'Explicit user exclusion on 1 Nov 2026: AI-generated content and poor quality. Do not add or recommend this course despite its rating. This is the user\'s quality assessment, not an independent finding.'},
  {'title':'CompTIA SecAI+ CY0-001 Video Bootcamp','instructor':'Networkel','rating':4.3,'ratings':96,'reason':'Below the 4.5 rating threshold despite relatively high rating count.'},
  {'title':'CompTIA SecAI+ Complete Course | Secure AI Lifecycles','instructor':'Cyvitrix','rating':4.3,'ratings':38,'reason':'Below rating threshold.'},
  {'title':'CompTIA SecAI+ 2026: Complete AI Security Exam Prep','instructor':'Vinay Kumar','rating':4.7,'ratings':65,'reason':'Already present as INT-1199; canonical slug matches. Preserve existing assessment.'},
  {'title':'Practice-test-only listings','reason':'Kept outside this teaching-course shortlist; high review ratings do not establish taught curriculum or practical outcome credit.'},
  {'title':'Other newer taught courses with fewer than 25 ratings','reason':'Below the selected minimum evidence of learner reception; includes 4.8 courses with 6 or 15 ratings and 5.0 courses with 2 or 3.'}
 ],
 'observationLimits':'Live header/search count for CertMike was 580 while its dynamically loaded review section showed 586. Use 580 consistently as the conservative header count. Alexander header was 67 (indexed web copy 66); Vision header 28 (indexed copy 27). Ratings/counts vary by refresh; recorded as dated observations. Public-site course availability does not verify inclusion in the bank\'s Udemy Business subscription. Avnish/Pavan and Nasser disclose AI use; the user\'s exclusion is specifically Mana, not a blanket exclusion of any course that uses AI.'}
(P/'sources.json').write_text(json.dumps(selection,indent=2,ensure_ascii=False)+'\n')
(P/'assessment.json').write_text(json.dumps({'date':'2026-11-01','baseline':cat['version'],'decisions':decisions},indent=2,ensure_ascii=False)+'\n')

edits=[]
def add(sn,addr,v):edits.append([sn,addr,v])
serial=(date(2026,11,1)-date(1899,12,30)).days
for i,c in enumerate(courses):
    rn=414+i
    positive=[n['id'] for n in cat['needs'] if any(d['score']>0 for rid,d in decisions[c['id']].items() if next(r for r in cat['requirements'] if r['id']==rid)['need']==n['id'])]
    note=f'Udemy {c["rating"]}/5; {c["ratings"]} course ratings observed 1 Nov 2026. {c["sections"]} sections, {c["lectures"]} lectures; last updated {c["updated"]}. {c["instructors"]}.'
    limitations='Public curriculum assessment only; purchased lessons and learner submissions not inspected. '+c['practice']+' Bank policy, complete agent supervision, reusable Skills and evaluation need additional learning. Full listed video duration applies; tests, role plays and assignments may take additional unquantified time. Subscription inclusion unverified. Ratings select the shortlist; they do not create coverage or prove quality.'
    vals={'A':c['id'],'B':'Udemy — '+c['instructors'],'C':c['title'],'D':'Course','E':'Vendor-neutral AI security; public examples','F':'Self-paced online','G':c['duration'],'H':'Variable by region/promotion; Udemy Business entitlement unverified','I':f'Updated {c["updated"]}; reviewed 1 Nov 2026','J':'Partial','K':'Some agent/access/monitoring topics; complete supervisory workflow and learner practice unverified.','L':'N','M':'V','N':'Practitioner','O':'All 23 needs assessed; evidenced: '+', '.join(positive),'P':'—','Q':'Assessed','R':note+' '+c['practice'],'S':c['url'],'T':'Detailed public curriculum; provisional desk assessment','U':c['summary'],'V':'All 140 active outcomes assessed independently on the unchanged 0–3 rubric. See Coverage for scoped results and Scores for outcome-specific evidence.','W':0,'X':limitations,'Y':c['url']}
    for col,v in vals.items():add(10,f'{col}{rn}',v)
    for j,r in enumerate(cat['requirements']):
        sr=58093+i*140+j;d=decisions[c['id']][r['id']]
        for col,v in {'A':c['id'],'C':r['id'],'F':d['score'],'G':d['evidence'],'H':'AI public-syllabus review v14','I':serial,'M':'Assessed','N':None,'O':c['url'],'P':'V14 new Udemy course; independent syllabus assessment; no programme selection implied.'}.items():add(5,f'{col}{sr}',v)
    for j,n in enumerate(cat['needs']):
        cr=9478+i*23+j
        # All new courses use the same explicit Practitioner review scope; groups
        # whose first outcome is Expert still require an Expert coverage row.
        rank=max(2,min(r['rank'] for r in cat['requirements'] if r['need']==n['id']))
        for col,v in {'A':c['id'],'C':n['id'],'E':['Base','Entry','Practitioner','Expert'][rank],'N':'V14 public curriculum; all 140 outcomes reviewed. This row uses the stated target-level scope; no full practical credit inferred.'}.items():add(6,f'{col}{cr}',v)
add(1,'A1','AI Era Cyber Training Catalogue v14')
add(1,'A8','Scores — 417 Offers × 140 active outcomes, plus preserved retired evidence. Blank scores remain explicitly unassessed. V14 adds five reviewed Udemy SecAI+ courses.')
notes=['Changes in v14 — 1 November 2026','Five missing Udemy SecAI+ courses added: CertMike, Avnish Singh/Pavan Kumar, Alexander Oni, Nasser Alaeddine and Vision Training Systems. Selection: at least 4.5/5 and 25 course ratings; public curriculum assessed independently.','Mana Dowlatshahi Yeganeh excluded by explicit user quality decision. Existing Vinay Kumar course INT-1199 retained without duplication. All original scores, framework outcomes and programme selections preserved.','Scope: 417 Offers + 117 Tool track = 534 resources; 58,100 active numeric scores and 280 explicitly unassessed rows. Ratings and review counts are dated selection evidence, not coverage or competence.']
for rn,v in enumerate(notes,115):add(1,f'A{rn}',v)
(P/'edits.json').write_text(json.dumps(edits,ensure_ascii=False)+'\n')
print(f'Prepared {len(courses)} additions, {len(edits)} typed cell edits and 700 independent outcome assessments.')
