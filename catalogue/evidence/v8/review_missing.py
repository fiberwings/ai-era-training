from packets import D,source
import re,sys
# Retrieval aids only. These matches do not assign scores.
patterns={
'N1':r'cyber|security operations|SOC |own role|jobs|workforce',
'N2':r'agent.{0,15}(architect|loop)|MCP|model (selection|providers)|tokens|multimodal|on.prem|sandbox|guardrail',
'N3':r'hallucinat|sycophan|context (loss|window)|non.determin|over.reliance|overreliance|automation bias|prompt injection|confident.{0,10}(wrong|error)|verification|fact.check',
'N4':r'privacy|confidential|data leak|intellectual property|copyright|AI Act|approved tool|third.party|supply.chain',
'N5':r'phish|deepfake|AI.{0,12}malware|AI.{0,20}threat|AI.{0,20}attack',
'N6':r'delegat|context|prompt|discern|diligen|human judgment|human judgement|verify|verification|choosing.{0,10}model',
'N7':r'approval|oversight|rollback|roll.back|kill.switch|human.in.the.loop|trace|sign.off|stop.{0,15}agent|supervis',
'N8':r'Skills|skill librar|MCP|connector|playbook|runbook',
'N9':r'evaluat|benchmark|test.case|golden|regression|known.fault|error.analysis',
'N10':r'agent.{0,20}(design|build)|multi.agent|context.engineering|MCP|latency|deploy',
'N11':r'evaluat|benchmark|judge|human.label|drift|error.analysis',
'N12':r'threat.model|sandbox|guardrail|authori[sz]|agent.identity|logging|supply.chain|kill.switch|observability',
'N13':r'inventory|risk.assess|autonomy|third.party|regulat|audit|assurance|accountability',
'N14':r'workflow|redesign|ROI|value|change.management|adoption|accountability|reskill|upskill|human.agent',
'R1.1':r'agent.incident|compromised.agent|manual.fallback|rollback|revok|incident.playbook',
'R1.2':r'forensic|integrity.protect|tamper.proof|immutable.log',
'R3.1':r'red.team|jailbreak|tool.poison|rug.pull|prompt.injection|PyRIT',
'R3.2':r'agent.{0,12}pentest|trajectory|out.of.scope|reproduc|containment|sandbox',
'R4.1':r'AIBOM|bill.of.material|MCP.{0,20}scan|tool.{0,12}pinning|content.hash|inventory|vetting',
'R4.2':r'code.analysis|vulnerabilit|fuzz|false.positive|deduplicat|harness',
'R5.1':r'kill.switch|approval.gat|policy.engine|authori[sz]ation|action.tier|audit.trail|approval.fatigue',
'R6.1':r'control.catalog|assurance|audit|control.test',
'R9.1':r'agent.identity|delegated|OAuth|scopes|least.privilege|just.in.time|recertif|revok|break.glass'
}
start,end=map(int,sys.argv[1:3])
for r in D['Offers'][start+1:end+1]:
    prior={x[3] for x in D['Scores'][1:] if x[0]==r[0]}
    t=source(r)
    # Ignore web-search navigation and lines after the provider's course description.
    lines=[re.sub(r'^L\d+:\s*','',s).strip() for s in t.splitlines() if s.strip()]
    print('\n'+r[0]+' '+r[2])
    for n,p in patterns.items():
        if n in prior:continue
        hits=[s for s in lines if re.search(p,s,re.I)]
        if hits:print(n+': '+' / '.join(hits[:2])[:220])
