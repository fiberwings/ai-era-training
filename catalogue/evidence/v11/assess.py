"""Explicit analyst decisions against the revised outcomes, not keyword scoring.
The retained public-syllabus record is the evidence corpus. A zero is absence
of evidence in that corpus, not a claim about inaccessible course content.
"""
from pathlib import Path
import json, collections
P=Path(__file__).resolve().parent
d=json.loads((P/'before.json').read_text()); courses=[c for c in d['courses'] if c['track']=='general']
decisions={q:{} for q in ['N5.1','N5.8','R3.1.2','R4.1.3']}
def assign(q,score,ids,reason):
    for cid in ids.split():
        assert cid not in decisions[q],(q,cid)
        decisions[q][cid]=(score,reason)
assign('N5.1',3,'INT-2716','The reviewed fraud/social-engineering lessons cover phishing, synthetic impersonation and explicit multichannel identity verification. All elements of the merged awareness outcome are evidenced.')
assign('N5.1',2,'TR-004 TR-006 TR-013 TR-025 TR-038 TR-043 TR-118 TR-120 TR-155 TR-165 INT-275 INT-276 INT-1280 INT-1466 INT-1840 INT-2715 INT-2787 INT-2859 INT-2982','Relevant deception or deepfake teaching is evidenced, but the complete combination of tailored phishing, voice/video impersonation and independent trusted-channel verification is not explicit. Partial knowledge coverage; production labs are not required.')
assign('N5.1',1,'TR-022 TR-034 TR-039 TR-041 TR-046 TR-047 TR-049 TR-117 TR-135 INT-154 INT-274 INT-449 INT-451 INT-452 INT-472 INT-474 INT-589 INT-647 INT-1468 INT-1469 INT-1589 INT-1601 INT-1607 INT-1700 INT-1788 INT-1873 INT-2709 INT-2711 INT-2858 INT-2938','The retained public evidence mentions AI-enabled deception, malicious content or synthetic impersonation without establishing the merged teaching outcome.')
assign('N5.8',3,'TR-109 TR-110 INT-482 INT-2480','The reviewed framework teaching covers the six risk families through attack examples and mitigations. This is Foundation knowledge credit, not security-design practice or bank-specific evidence.')
assign('N5.8',2,'TR-001 TR-002 TR-003 TR-005 TR-006 TR-013 TR-016 TR-022 TR-024 TR-029 TR-030 TR-034 TR-035 TR-036 TR-038 TR-039 TR-040 TR-043 TR-046 TR-049 TR-052 TR-060 TR-061 TR-062 TR-063 TR-070 TR-078 TR-099 TR-101 TR-111 TR-114 TR-115 TR-116 TR-117 TR-118 TR-119 TR-120 TR-122 TR-123 TR-124 TR-125 TR-128 TR-129 TR-130 TR-132 TR-137 TR-141 TR-142 TR-143 TR-154 TR-155 TR-159 TR-163 TR-165 TR-166 TR-167 TR-168 INT-077 INT-154 INT-194 INT-258 INT-401 INT-437 INT-468 INT-472 INT-473 INT-474 INT-475 INT-476 INT-477 INT-478 INT-479 INT-481 INT-655 INT-1199 INT-1589 INT-1607 INT-1700 INT-1788 INT-1798 INT-1840 INT-1926 INT-2252 INT-2269 INT-2483 INT-2709 INT-2715 INT-2716 INT-2756 INT-2982 TR-196 TR-218 TR-241 TR-259 TR-265 TR-275','The reviewed syllabus teaches selected attack/risk families or precautions. Coverage of all six families with examples and a precaution/escalation response is not evidenced. No full overview credit is inferred from a framework name or a narrow lab.')
assign('N5.8',1,'TR-014 TR-015 TR-018 TR-020 TR-021 TR-023 TR-026 TR-032 TR-047 TR-048 TR-050 TR-053 TR-064 TR-072 TR-077 TR-088 TR-104 TR-106 TR-112 TR-113 TR-121 TR-126 TR-131 TR-135 TR-136 TR-138 TR-139 TR-140 TR-144 TR-158 TR-160 TR-162 TR-164 INT-151 INT-193 INT-200 INT-274 INT-275 INT-276 INT-277 INT-278 INT-279 INT-280 INT-386 INT-427 INT-428 INT-429 INT-430 INT-431 INT-432 INT-433 INT-435 INT-436 INT-449 INT-451 INT-452 INT-470 INT-471 INT-480 INT-647 INT-1280 INT-1466 INT-1468 INT-1469 INT-1470 INT-1579 INT-1601 INT-1903 INT-2354 INT-2710 INT-2711 INT-2712 INT-2713 INT-2714 INT-2752 INT-2755 INT-2858 INT-2859 INT-3007 TR-177 TR-198 TR-199 TR-202 TR-203 TR-206 TR-213 TR-221 TR-242 TR-262','Security/privacy risks, safety constraints or controls are named in the retained public syllabus, but a coherent explanation of the revised security-risk overview is not established.')
assign('R3.1.2',3,'TR-005 TR-006 TR-024 TR-029','Structured offensive assessment, scoped AI targets, repeatable attack labs and reporting/capstone assessment are evidenced. The revised outcome permits suitable methods without requiring every named publication.')
assign('R3.1.2',2,'TR-001 TR-002 TR-009 TR-030 TR-034 TR-035 TR-036 TR-038 TR-049 TR-052 TR-060 TR-061 TR-062 TR-099 TR-114 TR-115 TR-116 TR-117 TR-132 TR-137 TR-141 TR-142 TR-143 TR-154 TR-159 INT-077 INT-194 INT-401 INT-468 INT-473 INT-475 INT-476 INT-1589 INT-1700 INT-1798 INT-2252 INT-2480 INT-2483 TR-202','Relevant testing steps, cases or exercises are taught. The complete scope-to-execution-to-evidence/reporting method with learner practice is not established; reading and instructor demonstrations alone do not earn 3.')
assign('R3.1.2',1,'TR-037 TR-050 TR-063 TR-078 TR-088 TR-109 TR-110 TR-111 TR-119 TR-136 TR-138 TR-139 TR-140 TR-144 INT-154 INT-258 INT-474 INT-478 INT-481 INT-482 INT-655 INT-1199 INT-1607 INT-1788 INT-1840 INT-2982','Attack taxonomies, red teaming or testing tools are mentioned. Applying the complete structured assessment method is not evidenced.')
assign('R4.1.3',3,'TR-036','The retained syllabus documents rug-pull attack and defence labs plus approved-server vetting, signing and supply-chain gates. These evidence component integrity and change control without requiring the formerly prescribed hash implementation.')
assign('R4.1.3',2,'TR-002 TR-034 TR-035 TR-063 TR-109 TR-110 TR-111 TR-123 TR-124 TR-125 TR-128 TR-129 TR-143 TR-168 INT-482 INT-2269','Component integrity, approval, provenance, pinning or change controls are taught. Full practice verifying approved components, detecting changes and requiring renewed review is not evidenced.')
assign('R4.1.3',1,'TR-001 TR-064 TR-070 TR-112 TR-113 TR-117 TR-119 TR-130 TR-132 TR-142 TR-166 TR-167 INT-154 INT-194 INT-477 TR-191 TR-199','Component trust, signing, provenance or vetting is named, but the complete approval-and-change-verification workflow is not taught.')
by={c['id']:c for c in courses}
assert all(cid in by for v in decisions.values() for cid in v)
records=[]
for c in courses:
    for q in decisions:
        old=c['scores'].get(q)
        if not c['scores']:
            score=None; reason='Authoritative syllabus evidence remains unavailable. Reassessment is explicitly unassessed; no inferred zero or positive score.'
        else:
            score,reason=decisions[q].get(c['id'],(0,'No explicit teaching or mention of this revised outcome is evidenced in the retained public-syllabus description and requirement evidence. Zero describes the reviewed evidence, not absence from inaccessible lessons.'))
        supporting=['N5.1','N5.2','N5.5'] if q=='N5.1' else ['N5.4','N12.1'] if q=='N5.8' else [q]
        evidence='V11 reassessment (18 October 2026). '+reason
        if score and q=='N5.8':evidence+=' Reviewed syllabus: '+c['description']
        elif score:
            evidence+=' Source evidence: '+' | '.join(c['scores'][x]['evidence'] for x in supporting if c['scores'].get(x,{}).get('score',0)>0)
        records.append({'course':c['id'],'requirement':q,'score':score,'priorScore':old.get('score') if old else None,'evidence':evidence,'sourceUrl':(old or {}).get('sourceUrl') or (c['sources'][0] if c['sources'] else c['url']),'basis':'Retained public-syllabus evidence, reviewed against revised outcome; no gated lesson completion','date':'2026-10-18'})
(P/'reassessments.json').write_text(json.dumps(records,indent=2))
print(json.dumps({q:dict(collections.Counter(str(r['score']) for r in records if r['requirement']==q)) for q in decisions},indent=2))
