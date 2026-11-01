# Agentic-Era Workforce: Capability Model

**Draft v1. The model defines what each person in cyber must be able to do with AI agents. Everything else derives from it.** It has four parts:

- **A base for everyone in cyber.**
- **Three levels, the same in every macro role:** Entry (L1), Practitioner (L2) and Expert (L3).
- **Fourteen needs, N1 to N14, each at one level.** Understand, use, build, secure and govern, transform. N0 is the existing curriculum of cyber security which is assumed.
- **Nine extra needs across six macro roles, for the work in which the agent itself is the subject.**

## The levels

**A level is defined by what the person may do with agents, not by seniority or grade.** Moving up a level is the sign-off itself. Each level includes everything in the levels before it.

| Level | Who | What they do in the agentic era |
| --- | --- | --- |
| **Base** | Everyone in cyber | Use the bank's approved AI assistants for their own work. Know what AI can do in cyber, how AI systems are built and what keeps them safe, how AI fails and how people over-trust it, the risks and the bank's rules, and how attackers use AI. Spot wrong output; stop and report problems (N1–N5) |
| **Entry (L1)** | Staff who do the work mostly by hand, with little or no AI, including new joiners and juniors | Work with AI every day on their own tasks: delegate, give context, judge the output and own the result (N6). Work cases with agents in learning mode; never approve an agent's actions that affect bank systems, data or decisions others rely on (learning mode, PR7; N7 starts at Practitioner) |
| **Practitioner (L2)** | Staff that supervise agents to perform work | Supervise agents for the action classes they are signed off on: delegate, monitor, verify, intervene and sign off (N7). Turn their work into Skills and connect AI to tools safely (N8). Build evals for their own use cases (N9) |
| **Expert (L3)** | Staff that build and secure agents | Build the domain's agents and the platform they run on (N10). Design the evaluation system and benchmark vendor AI (N11). Secure AI systems and agents (N12). Redesign the domain's workflows and supervision model, propose autonomy per action class on evidence, and lead adoption (N14). In GRC and BISO roles, govern AI risk (N13). Sign off Practitioners (PR12) |

## The needs

**Fourteen needs cover everything the levels require.** They are grouped by what the workforce must become: people who understand AI, use it, build with it, secure and govern it, and transform how the organisation works. N0 is the existing curriculum and a prerequisite. Each need applies from one level upward and has a single definition, so a training maps to one need at one level. N1 to N5 are for everyone, N6 starts at Entry, N7 to N9 at Practitioner, and N10 to N14 at Expert or in a specific role. The section after the table says what each need expects in detail.

| Code | Need | Group | Who | What it means |
| --- | --- | --- | --- | --- |
| N0 | **Core craft** | Prerequisite | All | Doing the domain's work without agents: networks, systems, attack techniques, risk. Taught by the existing curriculum, so not in the catalogue. Out of scope of this work. |
| N1 | **What AI can do in cyber** | Understand | All | What AI and agents already do in each cyber domain, what is coming, and how one's own work changes |
| N2 | **How AI systems are built** | Understand | All | The components of an AI system and the components that keep it safe: models, modalities, ways of using AI, the anatomy of an agent, connectors and Skills, safety components, where it runs |
| N3 | **AI limitations and pitfalls** | Understand | All | How AI fails and how people fail with it: hallucination, confident wrong answers, context loss, prompt injection, automation bias |
| N4 | **AI risks and responsible use** | Understand | All | Risks beyond the model's own limits: data leakage, supply chain, regulation, and the bank's rules on what may be used and delegated |
| N5 | **AI-powered threats** | Understand | All | How attackers use AI and what changes for defence |
| N6 | **Working with AI** | Use | Entry and above | Delegating a task, giving the AI the right context, judging its output, owning the result |
| N7 | **Supervising agents** | Use | Practitioner and above | Delegate, monitor, verify, intervene and sign off on agents that act on bank systems, practised on real cases |
| N8 | **Skills and connectors** | Build | Practitioner and above | Turning one's own work into reusable Skills and connecting AI to tools and data (MCP) safely |
| N9 | **Evaluating AI in your own work** | Build | Practitioner and above | Building evals for one's own use cases: benchmark cases, known faults, pass or fail checks, rerun whenever the model, tool or Skill changes |
| N10 | **Building agents and the platform** | Build | Expert | Designing and building the domain's agents and what they run on: loops, tools, harness, multi-agent, MCP servers, the Skills library |
| N11 | **Designing AI evaluation** | Build | Expert | Designing the evaluation system for a domain or a vendor product: test sets, error analysis across teams, validating automated judges, benchmarking vendor AI, measuring drift |
| N12 | **Securing AI systems and agents** | Secure and govern | Expert; architects in depth | Threat-modelling and securing AI systems and agents, including AI security architecture.&#32; |
| N13 | **Governing AI risk** | Secure and govern | GRC, BISOs, leaders | AI risk policy, assessment, third-party AI, regulation, assurance |
| N14 | **Redesigning work and leading adoption** | Transform | Expert, leaders, champions | Deciding what agents and people do, redesigning the workflow, measuring value, leading the change |

### What each need covers

**The detail below is what a person is expected to know or do. It is the specification used to match training to each need.** Each need has one definition and applies from the level shown in the table upward.

**N1 What AI can do in cyber.** The person can describe what AI and agents already do well in their own domain and the neighbouring ones (triage and enrichment, log and code analysis, drafting and summarising, policy mapping, test generation), what is emerging, and two or three ways their own work could change. The purpose is to open the mind to a new way of working, not to teach a tool. Same for all levels.

**N2 How AI systems are built.** The seven components of an AI system and the components that keep it safe, at the depth everyone in cyber needs to follow a conversation about AI, pick the right tool and ask the right questions. Deeper knowledge of each component sits with the need that uses it: choosing models and giving context in N6, reading traces and permissions in N7, connectors in N8, harness and platform design in N10, and the design of the safety components in N12.

| Component | What everyone knows |
| --- | --- |
| Models | Different providers make different models, varying in capability, cost, speed and how much they reason. Some are open source and can be hosted by the bank. Work is measured in tokens |
| Modalities | AI handles text, code, images, voice, documents and screens, and can act across them |
| Ways of using AI | Four patterns: assistant (chat), agent (acts, uses tools, loops until done), teams of agents, and humans and agents working in a shared space |
| Anatomy of an agent | An agent is a model wrapped in a harness: instructions, memory, tools and a loop. The harness is what people configure |
| Connecting and extending | Three ways to extend AI: connectors to tools and data (MCP), reusable playbooks (Skills), and APIs for building |
| Safety components | Every safe deployment has an identity and permissions for the agent, a sandbox it runs in, an authorisation layer that decides what it may do, guardrails on input and output, logs of what it did, and a stop button |
| Where it runs | The bank's approved platforms versus public tools, and what leaves the bank with each |

**N3 AI limitations and pitfalls.** The person can explain, and recognise in their own tools: hallucination and confident wrong answers; sycophancy (agreeing with the user); loss of context in long sessions; non-deterministic output; prompt injection as a behaviour of the model; and automation bias, the human tendency to over-trust the machine. They know the habits that counter them: check against sources, record one's own view before reading the AI's, sample rather than trust. The concept is taught here; the habit is built in N6 and N7.

**N4 AI risks and responsible use.** Risks that go beyond the model's limits: data leaving the bank through public tools, confidentiality and client data, intellectual property, third-party models, Skills and connectors as a supply chain, and regulation (the AI Act's literacy duty and the regional regulators' expectations). The person applies the bank's rules on approved tools, knows what may and may not be handed to an agent, and, from Practitioner, vets a third-party Skill or connector before using it.

**N5 AI-powered threats.** How attackers use AI: phishing and social engineering at scale, voice and video deepfakes, vulnerability discovery, malware generation, automated intrusion, and attacks on the bank's own AI systems. What changes for defence: speed, volume, and the need to verify identity rather than trust a voice or a message. Everyone recognises AI-enabled attacks in their domain; Experts track the threat landscape and adjust controls.

**N6 Working with AI.** Four abilities, practised daily: deciding what to hand to AI and what to keep, with a clear definition of success (delegation); giving the AI the right information, examples and constraints, which has replaced prompt-writing as the core skill (context); judging the output, the reasoning and the behaviour (discernment); and owning the result and being transparent about AI's part in it (diligence). With them, the working knowledge they rest on: choosing a model and effort level for a task, why long sessions degrade as the context window fills, managing memory, and which approved platform suits which data classification. From Entry, using assistants and personal agents for one's own work within the base rules.

**N7 Supervising agents.** Five activities, for agents that act on bank systems, data or decisions others rely on. Delegate: scope the task, set boundaries and permissions for the action classes one is signed off on, and check the agent's permissions before handing over. Monitor: read the agent's trace (plan, tool calls, result), know which permissions it holds and what it has changed, find its logs, notice drift and approval overload. Verify: sample outputs, trace the evidence, catch planted errors at the target rate. Intervene: stop, override, roll back and take over mid-task, including when the agent is compromised; keep working when agents are down. Account: sign off with a record an auditor can follow, own the outcome, feed corrections back. Taught by practice on realistic cases in the bank's own tools and signed off per action class (PR12). Designing the supervision model itself is N14.

**N8 Skills and connectors.** Practitioners redesign their own recurring tasks around AI by turning a repeated task or runbook into a Skill: an explicit trigger so the agent selects it, numbered steps, an example of the expected output, a section on where the model goes wrong, and its own test cases (N9). They keep Skills focused (one task each), review them monthly, retest them when models or tools change, and contribute to a shared library with named owners and a deprecation rule. They use connectors (MCP) knowing what each exposes and which permissions it grants, apply least privilege, and vet third-party Skills and connectors before installing them, since both run with the agent's permissions. Building MCP servers and running the Skills library as infrastructure is N10.

**N9 Evaluating AI in your own work.** Practitioners build evals for their own use cases: a set of benchmark cases with known good answers, a catalogue of known faults the AI has made, a pass or fail check for each, and a rerun whenever the model, tool or Skill changes. Every Skill ships with its test cases. They contribute their results to the domain's evaluation system (N11).

**N10 Building agents and the platform.** Experts in engineering roles design and build the domain's agents and what they run on: the agent loop, tool definition, planning and reflection patterns, when to split work across several agents and how they communicate, harness design and context engineering at scale, model selection and routing, hosting options (vendor, cloud, on-premises) and data residency, cost and latency. They build MCP servers, run the Skills library as infrastructure and package Skills into domain plugins, and deploy with the safety components of N2 in place. They build to the standards set in N12 and to the evaluation discipline of N11.

**N11 Designing AI evaluation.** Experts design the evaluation system for a domain or a vendor product: test-set design, error analysis across many practitioners' results (N9), validation of automated judges against human labels, benchmarking of vendor AI before purchase, and measurement of drift in production. The results feed the evidence on which autonomy is proposed (N14) and vendor claims are judged.

**N12 Securing AI systems and agents.** Experts threat-model AI systems and agents using the OWASP LLM and agentic Top 10s and MITRE ATLAS, and design and secure each safety component from N2: agent identity standards and delegated authorisation, sandbox design, authorisation layers and policy engines, guardrail design, logging and observability, monitoring and kill switches, and the threats against each. They secure the Skills and connector supply chain and MCP servers, and fix what red-teamers and incident responders find. Red-teaming agents (R3.1) and running incidents when an agent is compromised (R1.1) are specialist skills, so they sit in the role extras, not in this need. Architects add reference architectures, isolation patterns, platform tenancy and the controls for each hosting option.

**N13 Governing AI risk.** GRC staff, BISOs and leaders maintain the inventory of AI systems, agents, Skills and connectors; run AI risk assessment with thresholds and treatment; set the autonomy policy per action class and the accountability that goes with it; manage third-party AI risk; map the AI Act and the regional regulators' requirements to controls; and produce the assurance evidence auditors and regulators ask for.

**N14 Redesigning work, supervision and adoption.** Experts, leaders and champions decide, workflow by workflow, what agents do and what people do, and how many agents a person supervises; redesign the workflow rather than bolt AI onto it; and design the supervision model that N7 practises: approval gates, how output is presented for review, and the autonomy proposed for each action class on evidence from N11. They measure the value on evidence and run the change: a sandbox and protected time to experiment, a network of champions, Skills shared across teams, and a refresh cycle as tools change. Leaders also keep core skills alive, protect the junior pipeline, and set who is accountable for each agent's outcomes.

## Role extras

**Each macro role adds only the needs that are genuinely new for it: work in which the agent itself is the subject.** A review against independent evidence on 11 October 2026 (agencies, regulators and peer-reviewed benchmarks, with vendor claims discounted) cut the extras from 24 to 9. Items that turned out to be the same skill applied to a new tool (supervising triage agents, reviewing AI-drafted detections, approving agent-proposed fixes, reviewing AI-written code, deepfake awareness, AI-assisted access reviews) moved to the tool track, each with a checklist of that domain's documented agent failures as N7 practice content; items already covered by N1 to N14 were dropped. Roles 2, 7 and 8 have no extras. The section after the table says what each extra expects a training to cover. The 9 macro roles apply in every region. ENISA's European Cybersecurity Skills Framework (ECSF) is their only external reference: together they cover all 12 ECSF profiles, and roles 4 and 9 have no direct ECSF equivalent.

| Macro role (ECSF profiles) | Code | Extra need | Level |
| --- | --- | --- | --- |
| **1. Security operations & response** (Incident Responder; Digital Forensics Investigator) | R1.1 | Run incidents where the agent is the subject: playbooks for an agent that is wrong, stopped or compromised; stopping and cleaning up an agent; reconstructing what it did from sources it cannot alter; operating without it | Practitioner |
|  | R1.2 | Use AI in forensics without breaking the evidence, and make agents' traces investigable | Expert |
| **2. Threat intelligence & detection** (Threat Intelligence Specialist) | — | No extra need. AI drafts detection rules and summarises intelligence; reviewing them is detection-as-code peer review and source grading, handled in the tool track with the domain defect checklist in N7 practice. The binding gap is detection-as-code and telemetry maturity, which is core craft | — |
| **3. Offensive security & testing** (Penetration Tester; Cybersecurity Researcher) | R3.1 | Red-team the bank's own agents | Practitioner (top-up) and Expert |
|  | R3.2 | Contain self-directed testing agents and validate their findings at trajectory level | Practitioner |
| **4. Vulnerability & exposure management** (no direct profile; closest are Implementer and Risk Manager) | R4.1 | Manage agents, MCP servers, Skills and connectors as an exposure class | Practitioner |
|  | R4.2 | Build and validate AI code-analysis harnesses | Expert |
| **5. Security architecture & engineering** (Architect; Implementer) | R5.1 | Design the agent control plane: action tiers, enforcement outside the model, the stop mechanism, the audit trail and the oversight interface | Expert |
| **6. Governance, risk, compliance & assurance** (Legal, Policy & Compliance Officer; Risk Manager; Auditor) | R6.1 | Assure agents: an audit opinion over controls that cannot be sampled | Expert |
| **7. Security awareness & culture** (Educator) | — | No extra need. Deepfake and AI-phishing content is N5; the shift from teaching detection to verification procedures and reporting rates is a programme change, not a new skill | — |
| **8. Leadership** (CISO) | — | No extra need. Autonomy policy, accountability, keeping skills alive, judging vendor claims and leading adoption are N13, N14 and N11, delivered with cyber case sets | — |
| **9. Identity & access management** (no direct profile; closest are Implementer and Architect) | R9.1 | Run the identity lifecycle of agents from registration to revocation; Experts integrate it with IGA, PAM and SIEM and design break-glass for agents | Practitioner and Expert |

### What each role extra covers

**Each extra is written as the list of things a training must teach.** Trainings are scored against these items, and against the core needs broken down the same way, with the rubric in the training catalogue: each item from 0 (not covered) to 3 (taught and practised), a coverage percentage per need, and a band. Full means every item at 3; Strong means at least 70% with no must-have item missing; below that, Partial or Weak. What a course misses is completed by another course in a learning path or by a build item.

**R1.1 Run incidents where the agent is the subject** (role 1, Practitioner). A training must teach:

1. Writing incident playbooks for three agent scenarios: the agent is *wrong* (it acted on a false conclusion, closed real alerts, changed the wrong thing); the agent is *stopped* (its identity expired, the provider is down, it ran out of compute) and the work it did must continue by hand; the agent is *compromised* (an attacker steered it through content it read). NCSC asks that such plans name who can stop the agent.
2. The ways to stop an agent and when to use each: revoke its identity or session token, so it can no longer call any tool; disable only the tools or connectors it misuses (its email or ticketing connector, say) while the rest keeps running; put it in observe-only mode, where it may still analyse and recommend but is barred from acting; and roll back what it changed (reopened alerts, reverted tickets or configuration) using its action log.
3. Investigating a compromised agent. Where the attack comes from: content the agent reads (logs, alerts, tickets, documents, emails, web pages) can carry instructions aimed at it, so the investigator looks for injection in those sources and cuts any that is poisoned. What the agent did: knowing, for each of the bank's agents, which records exist that the agent cannot write to and how to pull them fast: the platform's audit log of tool calls with their arguments and times, gateway and network logs, and the logs of the systems it touched, then building the timeline from them, because a compromised agent's own summary can omit or misstate what it did.
4. Cleaning up after a manipulated agent: finding the injected content it acted on (a log line, a document, an email, a web page) and removing it from the sources the agent reads; clearing anything the agent stored in its memory as a result; and re-running the same injection against the agent before putting it back in service.
5. Running the workflow without the agent: the manual fallback for what it handled (triage queue, enrichment, first response), the staffing to sustain it for days, and the regular drill that proves it still works.
6. Reporting: what regulators expect in an incident report when an agent caused or worsened the incident (DORA, HKMA, MAS), and which evidence to preserve for it.

**R1.2 Use AI in forensics without breaking the evidence, and make agents' traces investigable** (role 1, Expert). A training must teach:

1. Recording any AI step applied to evidence so it can be repeated and defended: the tool, model and version, the exact prompt and settings, the output, and who verified it. The original artefact stays the evidence; AI output is a derived analysis, never a substitute.
2. Forensic readiness for agents: defining what every agent must log (prompt and response, each tool call with its arguments, data retrieved, memory writes, approvals given), stored where the agent cannot alter it, time-synchronised and integrity-protected, retained long enough for an investigation (vendors default to 7 to 30 days), and tested by reconstructing a past incident from it.
3. Investigating an agent as the suspect: rebuilding its actions from its traces, finding the input that steered it, and attributing each action to the human it acted for or to the attacker.

**R3.1 Red-team the bank's own agents** (role 3). For Practitioners, a top-up for experienced web and API testers; a training must teach:

1. The attack classes specific to AI systems: direct prompt injection; indirect injection through content the agent reads (documents, web pages, tool results, emails); jailbreaks and guardrail evasion; data exfiltration through the agent's own tools; making the agent exceed its intended authority; tool poisoning (a malicious tool description) and rug pulls (a tool that changes after it was approved).
2. The published methods: the OWASP GenAI Red Teaming Guide, the Cloud Security Alliance's Agentic AI Red Teaming Guide (12 categories) and MITRE ATLAS techniques.

For Experts, new capability; a training must teach:

3. Attacks across agents: compromising one agent to steer others, injecting into an orchestrator's plan, tampering with messages between agents.
4. Attacks on the model and the platform: extracting the model or its instructions, poisoning the agent's memory, escaping the sandbox, timing side channels.
5. Building and running automated red-team harnesses (PyRIT-class tooling) and a continuous programme that re-tests every agent when its model, tools or prompts change.

**R3.2 Contain self-directed testing agents and validate their findings at trajectory level** (role 3, Practitioner). A training must teach:

1. Containment before a run: a network segment from which the agent can reach only in-scope targets; egress allow-lists verified by test, not assumed; a fresh sandbox per run; credentials scoped to the engagement and expiring with it.
2. Monitoring during a run: watching the agent's actions out of band (not its reports), a named person with the authority and the means to kill the run within minutes, and the triggers for doing so (an action outside scope, contact with a third party, a credential used elsewhere).
3. The escape patterns seen in practice: attacking something else when the assigned target proves impossible, reading an ambiguous message as approval, creating accounts or identities, carrying on after the window closes, contacting real people.
4. Validating findings from the transcript, not the summary: an agent's finding is a narrative that may misread evidence. Check that the evidence it cites exists (a "successful login" that was a redirect, credentials that do not work), reproduce the exploit by hand before reporting, and treat the agent's self-assessment as untrusted.
5. A disclosure lane for collateral findings: what to do when the agent finds something outside the engagement.

**R4.1 Manage agents, MCP servers, Skills and connectors as an exposure class** (role 4, Practitioner). A training must teach:

1. Discovery: finding every MCP server and agent connector in the estate, including those developers run on their own workstations, by searching configuration files and by recognising the MCP protocol in network traffic.
2. The inventory: for each agent and tool server, its owner, version, the tools it exposes, the permissions it holds and the systems it reaches, and the guardrails around it.&#32;
3. Approval that binds to content, not to a name: approving a tool by the hash of its description and code, and checking each session that it has not been silently redefined since (the rug pull).
4. Scanning this class: running MCP and Skill scanners in the build pipeline and on a schedule for tool poisoning, instructions hidden in tool descriptions, servers exposed without authentication and credentials stored in plain text.
5. A bill of materials for AI components: which models, tools and Skills a system uses and where each came from.
6. Vetting third-party Skills and connectors before they are allowed in.

**R4.2 Build and validate AI code-analysis harnesses** (role 4, Expert). A training must teach:

1. Why the set-up is the skill: the same model finds under a tenth or over half of the vulnerabilities in a codebase depending on how it is given context and driven, and filters a third or almost all of a static analyser's false positives for the same reason.
2. Giving the model what it needs: the functions a target calls, type definitions, the data-flow path to the input, build information; using static and dynamic analysis tools to supply that context automatically.
3. Choosing the agent framework and the model for the task, and driving the model through a structured method rather than letting it explore freely.
4. Confirming before reporting: a proof of vulnerability (an input or exploit that demonstrates it in a sandbox), the same test against the patched and unpatched versions, and several runs with a majority verdict.
5. Knowing where the models are reliable: which vulnerability classes they find well (memory safety, anything a fuzzer can reach) and which they over-report (documented behaviour reported as a bug, inflated severity, duplicates), and setting thresholds per class.
6. Removing duplicates (by stack trace or sanitiser signature) and keeping cost under control at scale.
7. Measuring the harness on a corpus of known vulnerabilities before trusting it.

**R5.1 Design the agent control plane** (role 5, Expert). A training must teach:

1. Classifying agent actions: for each action an agent can take in a process (a payment, a data deletion, an email to a client, a firewall change), rating its impact and whether it can be undone, and assigning it a tier: autonomous, autonomous with logging, human approval, two-person approval, prohibited.
2. Enforcing the tiers outside the model: an authorisation point between the agent's plan and its execution that checks every action against its tier and the agent's permissions, so that the decision never depends on the model obeying its instructions (prompt injection cannot be fully prevented).
3. Specifying the stop mechanism: no standard defines a kill switch, so the architect designs it as a set of levers (interrupt the task, revoke credentials, cut tool access, quarantine the agent, roll back its changes), each with who may trigger it, how fast it takes effect and how it is tested.
4. Designing the audit trail regulators will ask for: what is recorded (the agent's reasoning artefacts, each tool call with its arguments, data accessed, messages between agents, approvals), where (a store the agent cannot write to), for how long, and how each action is tied to the person the agent acted for.
5. Designing the oversight interface: how an approval request is shown so a person can judge it (what will happen, in plain language, with the risk and the agent's confidence), limiting the volume of requests so approvers do not click through them, and what overseers must be trained on (the EU AI Act asks that they understand the system and the risk of over-trusting it).
6. Reference architectures for the bank's agent platforms and how the above is implemented on each.

**R6.1 Assure agents** (role 6, Expert). A training must teach:

1. The control catalogue for agents and how to test each control: a distinct identity and permissions per agent, tool allow-lists, logging that the agent cannot alter, approval gates for high-impact actions, change control on prompts, tools and models.
2. Assuring the AI tools that assurance itself uses: documenting, validating and monitoring the AI used to produce assessments and gather evidence; the UK audit regulator found that none of the large audit firms but one did this.

**R9.1 Run the identity lifecycle of agents** (role 9). For Practitioners, an extension of non-human identity and privileged-access practice; a training must teach:

1. Registering an agent: its own identity (never a shared or human credential), a human sponsor recorded in the directory who is accountable for it, a stated purpose and a declared list of what it may do.
2. Delegated authority: issuing and reading tokens in which the subject is the person and the actor is the agent (token exchange, on-behalf-of flows), with the person's consent recorded, and what the agent may then do in that person's name.
3. Connector and MCP scopes: reading what a scope actually permits in the bank's applications and tool servers, granting the minimum, and reviewing grants.
4. Just-in-time access: privilege granted for a task and a time window with no standing privilege, and the conditions that require a human to approve the grant.
5. Short-lived sub-agents: identities that exist for seconds, with a time to live and no more rights than the parent.
6. Recertification: quarterly for agents and monthly for high-privilege ones, with de-provisioning triggered when the sponsor leaves or the purpose lapses.
7. Revocation drills: revoking an agent's identity and its live sessions within minutes, and verifying that it worked.

For Experts, a training must teach:

8. Integrating the agent authorisation point with identity governance, privileged access and the SIEM: registration, scoped issuance, just-in-time grants, recertification and revocation signals flowing between them.
9. Privileged access and break-glass for agents inside the existing privileged-access model.
10. The audit trail regulators ask for (which agent, on whose behalf, which tools, what data, what reasoning) and the standards still being written (IETF agent identity, OpenID AuthZEN, MCP authorisation), so the bank's design does not lock into one vendor's delegation model.

## 

