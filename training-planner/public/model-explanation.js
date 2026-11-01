// Editorial metadata shared by the document and planner explanation.
// These labels do not change profile applicability, assessment or scoring.
export const ROLE_FAMILIES = [
  {id:1,name:'Security operations & response',ecsf:'Incident Responder; Digital Forensics Investigator',needs:'R1.1 agent incident response; R1.2 agent forensics and evidence.'},
  {id:2,name:'Threat intelligence & detection',ecsf:'Threat Intelligence Specialist',needs:'N5.7 tracking the AI threat landscape and adjusting controls; shared capabilities and tool training. No separate R-coded need.'},
  {id:3,name:'Offensive security & testing',ecsf:'Penetration Tester; Cybersecurity Researcher',needs:'R3.1 agent red-teaming; R3.2 testing-agent containment.'},
  {id:4,name:'Vulnerability & exposure management',ecsf:'No direct profile; closest: Implementer and Risk Manager',needs:'R4.1 agent exposure management; R4.2 AI code-analysis engineering, including application-security harnesses.'},
  {id:5,name:'Security architecture & engineering',ecsf:'Architect; Implementer',needs:'N12 AI security; R5.1 agent security architecture; agent infrastructure needs in N10.3 (engineering at scale), N10.6 (MCP servers) and N10.7 (shared Skills infrastructure), where required by the responsibility.'},
  {id:6,name:'Governance, risk, compliance & assurance',ecsf:'Legal, Policy & Compliance Officer; Risk Manager; Auditor',needs:'N13 AI governance and risk; R6.1 agent assurance; relevant vendor-evaluation outcomes in N11.'},
  {id:7,name:'Security awareness & culture',ecsf:'Educator',needs:'N5 AI security risks and threats; shared capabilities and tool training. No separate R-coded need.'},
  {id:8,name:'Identity & access management (IAM)',ecsf:'No direct profile; closest: Implementer and Architect',needs:'R9.1 agent identity lifecycle, with operations and integration/design responsibilities selected separately.'},
  {id:9,name:'Leadership',ecsf:'CISO',needs:'N14 transformation and adoption; N13.3 autonomy policy and other relevant governance outcomes; N11.4 and N11.6 vendor evaluation.'}
];

// Responsibility package IDs are stable assessment/applicability identifiers.
// A package may belong to several roles; selecting a role never selects all of it.
export const ROLE_RESPONSIBILITIES = {
  1:['incident-response','agent-forensics'],
  2:['threat-intelligence'],
  3:['agent-testing','advanced-redteam'],
  4:['exposure-management','code-analysis'],
  5:['ai-security','agent-architecture','agent-engineering'],
  6:['ai-governance','agent-assurance','vendor-evaluation'],
  7:[],
  8:['identity-operations','identity-integration'],
  9:['leadership','workflow-transformation','vendor-evaluation','ai-governance']
};

export const ROLE_NUMBERING_NOTE = 'Role 8 is IAM; role 9 is Leadership (CISO). Assessment identifiers remain stable: R9.1 and R9.1.1–R9.1.10 identify IAM learning under role 8. Historical leadership tags M-R8.x/R8.x remain legacy identifiers. Role numbers describe the current role list; assessment IDs preserve evidence and saved-plan links.';

export const TOOL_TRAINING_EXAMPLES = [
  ['Users with access to Microsoft Copilot Cowork or Anthropic Claude Code','Learn how to use the specific product for assigned work: provide context, work with its permissions and approvals, review outputs and recover from errors. Training can span functions or cover everyone if the tool is deployed to everyone.'],
  ['Incident responders using agentic tools for defenders','Practise triage, investigation and response in the deployed tool; inspect evidence, supervise its actions and take over when needed. Add the relevant incident-response outcomes for incidents involving agents themselves.'],
  ['Application-security staff using Claude Code Security or an in-house analysis harness','Operate the existing tool or harness to identify vulnerabilities: configure the permitted scope and context, validate findings, recognise false positives and run task checks.'],
  ['L3 Expert application-security staff building a vulnerability-finding harness or agent','Learn the chosen development tools and framework, build the harness or agent, and maintain evaluations of detection quality, missed vulnerabilities, false positives and performance as it changes. This combines L3 building and evaluation (N10–N11) with the R4.2 specialism.']
];

export const NEED_DOMAINS = {
  N1:{kind:'Cyber-specific',reason:'AI use cases, emerging capabilities and changes to work are explicitly taught in cybersecurity domains.'},
  N2:{kind:'Generic',reason:'Models, agent components, connectors, safety components and hosting are relevant across functions; adapt the platform examples to the organisation.'},
  N3:{kind:'Generic',reason:'AI limitations, prompt-injection awareness and habits for checking outputs apply to any AI user.'},
  N4:{kind:'Generic',reason:'Responsible use, data handling, supply-chain awareness and approved-use rules apply across functions; local policy and regulation provide context.'},
  N5:{kind:'Cyber-specific',reason:'Cyber-focused risk awareness for all cyber staff: N5.8 provides the risk overview, N5.4 retains examples of attacks on the bank’s AI, and N5.1 includes deepfake impersonation. N5.7 threat tracking and control adjustment require specialist depth.'},
  N6:{kind:'Generic',reason:'Providing context, judging outputs and owning AI-assisted work apply in any function.'},
  N7:{kind:'Generic',reason:'Delegating, monitoring, verifying, intervening and accounting for agent work apply to anyone supervising agents; use domain-specific exercises.'},
  N8:{kind:'Generic',reason:'Reusable task instructions and safe connector use apply across functions.'},
  N9:{kind:'Generic',reason:'Task checks, known faults and retesting after changes apply to any recurring AI-assisted task.'},
  N10:{kind:'Generic',reason:'Agent design, engineering and safe deployment apply across domains. Technical depth and platform responsibilities still determine who needs each outcome.'},
  N11:{kind:'Generic',reason:'Evaluation design, error analysis, vendor benchmarking and drift measurement apply across domains; test cases reflect the target work.'},
  N12:{kind:'Cyber-specific',reason:'Threat modelling and designing, securing or remediating AI controls require cybersecurity expertise.'},
  N13:{kind:'Generic',reason:'AI inventories, risk assessment, autonomy policy, third-party risk and assurance obligations apply across functions. Cyber control assurance is developed further in R6.1.'},
  N14:{kind:'Generic',reason:'Workflow redesign, supervision, value measurement, adoption and accountability apply to leaders and change roles in any function.'},
  'R1.1':{kind:'Cyber-specific',reason:'Responding to agent incidents, investigating compromise, containment, recovery and incident evidence are cyber operations responsibilities.'},
  'R1.2':{kind:'Cyber-specific',reason:'Forensic integrity, agent trace reconstruction and evidence handling require digital-forensics practice.'},
  'R3.1':{kind:'Cyber-specific',reason:'Adversarial testing of agents, attack methods and red-team programmes require security-testing expertise.'},
  'R3.2':{kind:'Cyber-specific',reason:'Containing offensive testing agents and validating exploit evidence are security-testing responsibilities.'},
  'R4.1':{kind:'Cyber-specific',reason:'Discovering and managing agent, connector and MCP exposures is vulnerability and exposure management.'},
  'R4.2':{kind:'Cyber-specific',reason:'Building and validating vulnerability-finding code-analysis harnesses requires application-security knowledge as well as generic agent engineering.'},
  'R5.1':{kind:'Cyber-specific',reason:'Designing enforceable agent controls, protected audit trails and security reference architectures is security architecture work.'},
  'R6.1':{kind:'Cyber-specific',reason:'Testing agent security controls and assuring the AI used for assessments requires cyber assurance expertise.'},
  'R9.1':{kind:'Cyber-specific',reason:'Agent identity, delegated authority, access lifecycle, revocation and IGA/PAM/SIEM integration are IAM responsibilities.'}
};
