# Agentic-Era Workforce Capability Model

**Version 2, revision 3 · Presentation updated 31 October 2026; applicability unchanged**

## The model in one page

**Everyone shares a foundation. Their remaining learning depends on how they work with agents, their role, and the tools they use.**

**Target capability profile = Foundation + Agentic level + Relevant role specialisms + Tool training.**

| Component | Question it answers | Meaning |
| --- | --- | --- |
| Foundation | What should everyone understand? | Common knowledge of AI, agents, limitations, risks, threats and responsible use. |
| Agentic level | How will this person work with agents? | L1: work with AI assistance. L2: supervise agents. L3: build and evaluate agents. |
| Role specialisms | What additional capabilities does the job require? | Relevant responsibilities in governance, leadership, IAM, incident response, security architecture and other domains. |
| Tool training | Which tools must they operate? | How to use a specific product, platform or in-house tool, assigned according to access and intended work. |

Foundation is shared by everyone and is not a fourth level. Role specialisms and tool training can apply at any agentic level.

### Agentic levels — how people work with agents

| Level | Capability target |
| --- | --- |
| L1 Entry — Work with AI assistance | Perform work primarily yourself, use AI where useful, provide context, check outputs and own the result. |
| L2 Practitioner — Supervise agents | Delegate, monitor, verify, intervene and remain accountable. Adapt task instructions and run checks within approved workflows. |
| L3 Expert — Build and evaluate agents | Design agent behaviour and workflows, configure or code agents, design evaluations and improve reliability. Includes no-code/low-code builders. |

**The L2/L3 boundary:** L2 operates and adapts an existing agent workflow and runs task checks; L3 designs the agent's behaviour and its evaluation approach. Writing a reusable task instruction within an approved workflow does not by itself make someone L3. L3 includes no-code/low-code builders. Shared agent infrastructure is a learning need within Security architecture & engineering, selected for people with that responsibility.

Levels describe target agentic capabilities, not seniority, professional expertise or operational authorisation. A senior leader can be L1; a GRC specialist can be L3. Higher levels build on lower shared capabilities, but demonstrated capabilities need not be retaught. Everyone does not need to reach L3.

### Role specialisms — what the job requires

Role specialisms add capabilities for the responsibilities of the **nine roles already defined in this model**. They retain the project's grouping of [ENISA's European Cybersecurity Skills Framework (ECSF) profiles](https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles), including Leadership and the explicit Vulnerability & exposure management and IAM roles. This is the model's grouping of roles, not a replacement list of ECSF profiles.

| Defined role | ECSF reference in the existing model |
| --- | --- |
| 1. Security operations & response | Incident Responder; Digital Forensics Investigator |
| 2. Threat intelligence & detection | Threat Intelligence Specialist |
| 3. Offensive security & testing | Penetration Tester; Cybersecurity Researcher |
| 4. Vulnerability & exposure management | No direct profile; closest: Implementer and Risk Manager |
| 5. Security architecture & engineering | Architect; Implementer |
| 6. Governance, risk, compliance & assurance | Legal, Policy & Compliance Officer; Risk Manager; Auditor |
| 7. Security awareness & culture | Educator |
| 8. Identity & access management (IAM) | No direct profile; closest: Implementer and Architect |
| 9. Leadership | CISO |

Role 8 is IAM; role 9 is Leadership (CISO). Assessment identifiers remain stable: R9.1 and R9.1.1–R9.1.10 identify IAM learning under role 8. Historical leadership tags M-R8.x/R8.x remain legacy identifiers. Role numbers describe the current role list; assessment IDs preserve evidence and saved-plan links.

Select the relevant outcomes for the actual responsibilities; a person can work across roles and need several specialisms at any agentic level. Specialist depth follows the responsibility. A role does not require a new specialist module when shared capabilities and tool training meet its needs. Application-security code-analysis and harness requirements are already covered by R4.2 within Vulnerability & exposure management.

### Tool training — how people use their approved tools

**Tool training teaches someone how to use a specific product, platform or in-house tool.** Its audience follows tool distribution and intended work: it may apply to everyone if the tool is deployed to everyone, to users across several functions, or only to a particular specialist group. People with access receive training for the tasks they are expected to perform; the same product can require different training for users, supervisors and builders.

| Who needs the tool training | What the training teaches |
| --- | --- |
| Users with access to Microsoft Copilot Cowork or Anthropic Claude Code | Learn how to use the specific product for assigned work: provide context, work with its permissions and approvals, review outputs and recover from errors. Training can span functions or cover everyone if the tool is deployed to everyone. |
| Incident responders using agentic tools for defenders | Practise triage, investigation and response in the deployed tool; inspect evidence, supervise its actions and take over when needed. Add the relevant incident-response outcomes for incidents involving agents themselves. |
| Application-security staff using Claude Code Security or an in-house analysis harness | Operate the existing tool or harness to identify vulnerabilities: configure the permitted scope and context, validate findings, recognise false positives and run task checks. |
| L3 Expert application-security staff building a vulnerability-finding harness or agent | Learn the chosen development tools and framework, build the harness or agent, and maintain evaluations of detection quality, missed vulnerabilities, false positives and performance as it changes. This combines L3 building and evaluation (N10–N11) with the R4.2 specialism. |

The named examples use Microsoft Copilot Cowork, Anthropic Claude Code and Claude Code Security. They illustrate training needs where the products are approved and access is provided; they do not imply that these tools are already deployed in the bank.

Operating an existing vulnerability-finding tool is distinct from designing its harness and evaluation approach. The latter needs L3 capabilities and the application-security specialism as well as training on the chosen development tools. Tool training supplements those capabilities; familiarity with a product alone does not demonstrate them or grant operational permission.

The existing cyber curriculum (N0, core craft) remains a prerequisite. This model describes the additional capabilities for the agentic era.

## From the model to learning needs

The model defines a person's **target capability profile**. The next step is to translate that profile into **learning needs**: the topics they need to learn, such as supervising agents or assessing AI risk. Each need contains **learning outcomes**: specific statements of what someone must know or do. These outcomes connect the model to training selection and assessment.

For example, a GRC L2 Practitioner supervising assessment agents needs the Foundation, shared capabilities through L2, relevant governance outcomes and practice on the approved tools. N7 (Supervising agents) includes verifying outputs and tracing evidence (N7.3), and stopping or taking over a task (N7.4). Their governance responsibilities may also require AI risk assessment (N13.2). A practical exercise in their assessment tool can address these outcomes together.

Need IDs such as N7 and R9.1 identify topics; outcome IDs such as N7.3 and R9.1.1 identify the detailed requirements underneath them. They keep the learning traceable to the existing evidence. Select applicable outcomes, including where a need spans more than one component of the model.

Compare these target outcomes with demonstrated current capability to identify what still needs to be learned. Without a baseline assessment, describe the result as **target learning needs**, not measured skill gaps. Someone who has already demonstrated an outcome does not need to repeat the learning.

### Generic and cyber-specific learning needs

Learning needs have two content categories, independent of agentic level, role and tool access:

- **Generic:** capabilities that transfer across functions, such as using, supervising, building or evaluating agents, responsible use, AI governance and leading adoption. Generic does not mean required by everyone: agent builders and governance specialists still have different needs.
- **Cyber-specific:** capabilities whose learning objective concerns cybersecurity work, threats, controls or specialist practices. Cyber-specific does not mean only a small specialist audience: N1 and the foundation outcomes in N5 are shared across this cyber workforce, and basic threat awareness can also serve staff outside cyber.

The classification below is based on each need's primary learning objective. Organisation-specific policies and cyber examples can contextualise a generic need without making the underlying capability cyber-specific. Conversely, general techniques within a cyber need remain part of that need's cyber objective. N3 prompt-injection awareness and N4 safe use are generic user capabilities; N12 security design and the R-coded security responsibilities require cyber depth.

**Current classification: 11 generic needs and 12 cyber-specific needs.** N0, the existing core-craft curriculum, is a cyber-specific prerequisite outside these 23 assessed needs.

| Need | Content category | Why / how it is applied |
| --- | --- | --- |
| N1 — AI in cyber | Cyber-specific | AI use cases, emerging capabilities and changes to work are explicitly taught in cybersecurity domains. |
| N2 — AI systems and agents | Generic | Models, agent components, connectors, safety components and hosting are relevant across functions; adapt the platform examples to the organisation. |
| N3 — AI limitations | Generic | AI limitations, prompt-injection awareness and habits for checking outputs apply to any AI user. |
| N4 — Responsible AI use | Generic | Responsible use, data handling, supply-chain awareness and approved-use rules apply across functions; local policy and regulation provide context. |
| N5 — AI security risks and threats | Cyber-specific | Cyber-focused risk awareness for all cyber staff: N5.8 provides the risk overview, N5.4 retains examples of attacks on the bank’s AI, and N5.1 includes deepfake impersonation. N5.7 threat tracking and control adjustment require specialist depth. |
| N6 — Working with AI | Generic | Providing context, judging outputs and owning AI-assisted work apply in any function. |
| N7 — Supervising agents | Generic | Delegating, monitoring, verifying, intervening and accounting for agent work apply to anyone supervising agents; use domain-specific exercises. |
| N8 — Reusable instructions and connectors | Generic | Reusable task instructions and safe connector use apply across functions. |
| N9 — Testing your AI tasks | Generic | Task checks, known faults and retesting after changes apply to any recurring AI-assisted task. |
| N10 — Building agents | Generic | Agent design, engineering and safe deployment apply across domains. Technical depth and platform responsibilities still determine who needs each outcome. |
| N11 — Evaluating agents and AI systems | Generic | Evaluation design, error analysis, vendor benchmarking and drift measurement apply across domains; test cases reflect the target work. |
| N12 — Securing AI | Cyber-specific | Threat modelling and designing, securing or remediating AI controls require cybersecurity expertise. |
| N13 — AI governance and risk | Generic | AI inventories, risk assessment, autonomy policy, third-party risk and assurance obligations apply across functions. Cyber control assurance is developed further in R6.1. |
| N14 — Transforming work and leading adoption | Generic | Workflow redesign, supervision, value measurement, adoption and accountability apply to leaders and change roles in any function. |
| R1.1 — Agent incident response | Cyber-specific | Responding to agent incidents, investigating compromise, containment, recovery and incident evidence are cyber operations responsibilities. |
| R1.2 — Agent forensics and evidence | Cyber-specific | Forensic integrity, agent trace reconstruction and evidence handling require digital-forensics practice. |
| R3.1 — Agent red-teaming | Cyber-specific | Adversarial testing of agents, attack methods and red-team programmes require security-testing expertise. |
| R3.2 — Testing-agent containment | Cyber-specific | Containing offensive testing agents and validating exploit evidence are security-testing responsibilities. |
| R4.1 — Agent exposure management | Cyber-specific | Discovering and managing agent, connector and MCP exposures is vulnerability and exposure management. |
| R4.2 — AI code-analysis engineering | Cyber-specific | Building and validating vulnerability-finding code-analysis harnesses requires application-security knowledge as well as generic agent engineering. |
| R5.1 — Agent security architecture | Cyber-specific | Designing enforceable agent controls, protected audit trails and security reference architectures is security architecture work. |
| R6.1 — Agent assurance | Cyber-specific | Testing agent security controls and assuring the AI used for assessments requires cyber assurance expertise. |
| R9.1 — Agent identity lifecycle | Cyber-specific | Agent identity, delegated authority, access lifecycle, revocation and IGA/PAM/SIEM integration are IAM responsibilities. |

Teach reusable generic capabilities together where useful, then add cyber cases, specialist outcomes and practice on the tools each audience will use. For application security, N7 and N9 supply generic supervision and task checks; N10–N11 supply generic building and evaluation; R4.2 adds the cyber-specific code-analysis and vulnerability-validation capabilities. This classification describes content for planning; it does not change outcome IDs, profile applicability, scored need groups or assessment evidence.

| Example profile | Learning combination |
| --- | --- |
| GRC practitioner supervising assessment agents | Foundation + L2 + relevant governance outcomes + tools |
| GRC specialist building assessment agents | Foundation + L3 + relevant governance outcomes + tools |
| IAM specialist administering agent identities manually | Foundation + L1 + identity operations + tools |
| Leader setting adoption priorities | Foundation + their actual agentic level + relevant leadership, governance and vendor-evaluation outcomes + tools |

## From target work to a training plan

**Target work → Capability profiles → Learning needs → Training and practice → Cohorts and delivery plan.**

The model defines the target capabilities; the learning needs and outcomes specify what to learn. The training plan adds how, with whom and when.

1. **Define the target work and profile.** Describe future tasks, responsibilities and boundaries, then choose the agentic level, relevant role specialisms and approved tools.
2. **Identify the learning needs.** Select the applicable generic and cyber-specific outcomes and compare them with demonstrated current capability, where evidence is available. This produces the learning requirements for the profile.
3. **Match training and practice.** Find courses, internal learning and realistic exercises that address those outcomes. Assign product-specific training according to tool access and intended work. One resource can address several needs; one need can require several resources.
4. **Form cohorts around shared needs.** Group people who need the same learning, including across functions. A function can contain several profiles. Count shared courses, outcomes and internal learning once.
5. **Build the delivery plan.** Sequence learning against priorities and prerequisites, then schedule it within learner time and delivery capacity. Include tool practice and any internal learning still to be developed.
6. **Check readiness.** Assess what people can demonstrate after learning. Course coverage is evidence about the syllabus; learner competence and operational permission are separate decisions.

## Mapping the model to existing learning needs

| Component | Existing outcome mapping |
| --- | --- |
| Foundation | N1–N5 foundation outcomes; excludes N4.7 and N5.7 |
| L1 | N6 |
| L2 | N7–N9 and N4.7 (third-party vetting) |
| L3 | N10 and N11, except N10.3, N10.6 and N10.7 |
| Role specialisms | N12–N14 and the existing R-coded outcomes; N10.3, N10.6 and N10.7 for agent infrastructure within Security architecture & engineering; N5.7 for AI threat tracking within Threat intelligence & detection |
| Tool training | Product-specific practice linked to the relevant shared or specialist outcomes |

Safe deployment remains common L3 learning through N10.8, supported by the foundation and safe-use outcomes. Detailed security design belongs to the relevant specialism. N10.5 covers understanding hosting and residency choices, not building the hosting platform.

The following packages collect learning needs within the defined roles. They are editable starting points based on responsibilities, not job grades or mandatory assignments for everyone in a function. **Agent infrastructure belongs within Security architecture & engineering:** N10.3 covers harness and context engineering at scale, N10.6 covers building MCP servers, and N10.7 covers shared Skills infrastructure. These existing outcomes remain part of N10 for assessment; they do not introduce another role or scored need. Role prerequisites must be checked independently of agentic level. Identity operations and identity integration, for example, represent different responsibilities rather than L2 and L3 gates. A specialist outcome can apply at L1 even when its historical rubric label was L3 Expert.

**AI threat tracking belongs within Threat intelligence & detection:** N5.7 covers tracking the AI threat landscape and adjusting controls. It remains an outcome within N5 for assessment, selected for that role's responsibilities. The other N5 outcomes provide shared foundation awareness; N5.7 adds the specialist depth. It is a role learning need, not an additional model component.

| Role learning needs | Learning outcomes |
| --- | --- |
| Security architecture & engineering | N10.3, N10.6, N10.7 |
| AI security design and remediation | N12.1, N12.2, N12.3, N12.4, N12.5, N12.6, N12.7, N12.8 |
| AI governance and risk | N13.1, N13.2, N13.3, N13.4, N13.5, N13.6 |
| Workflow transformation and adoption | N14.1, N14.2, N14.3, N14.4, N14.5 |
| Leadership and accountability | N14.1, N14.2, N14.3, N14.4, N14.5, N14.6, N14.7, N13.3 |
| Vendor evaluation and tool selection | N11.4, N11.6 |
| Threat intelligence & detection — AI threat landscape | N5.7 |
| Agent incident response | R1.1.1, R1.1.2, R1.1.3, R1.1.4, R1.1.5, R1.1.6 |
| Agent forensics and evidence | R1.2.1, R1.2.2, R1.2.3 |
| Agent testing and containment | R3.1.1, R3.1.2, R3.2.1, R3.2.2, R3.2.3, R3.2.4, R3.2.5 |
| Advanced agent red-teaming | R3.1.3, R3.1.4, R3.1.5 |
| Agent exposure management | R4.1.1, R4.1.2, R4.1.3, R4.1.4, R4.1.5, R4.1.6 |
| AI code-analysis engineering | R4.2.1, R4.2.2, R4.2.3, R4.2.4, R4.2.5, R4.2.6, R4.2.7 |
| Agent security architecture | N12.9, R5.1.1, R5.1.2, R5.1.3, R5.1.4, R5.1.5, R5.1.6 |
| Agent assurance | R6.1.1, R6.1.2 |
| Agent identity operations | R9.1.1, R9.1.3, R9.1.4, R9.1.5, R9.1.6, R9.1.7 |
| Agent identity integration and design | R9.1.2, R9.1.8, R9.1.9, R9.1.10 |

An outcome can support more than one profile. N11.4 and N11.6 support vendor evaluation without requiring the person to become an L3 builder. Leadership includes workflow transformation and N13.3 on autonomy policy; select broader governance outcomes only if the job needs them. Reused outcomes are counted once.

The nine roles listed in the opening model help identify which responsibility packages are relevant. They are independent of the bank's organisational functions; a role can require generic needs, cyber-specific needs and tool training together.

### Planning tool training

Record which approved products, platforms and in-house tools are distributed to which users, and what those users will do with them. Form tool-training cohorts around that access and intended work, whether the audience is everyone or a specialist group. An L2 learner operates and adapts an existing workflow; an L3 learner designs an agent and maintains its evaluation approach. Different tools do not create new capability levels.

Tool resources can be selected manually, including unassessed resources. Product metadata alone supplies no assessed outcome coverage. Their learner hours still count, and an unknown duration remains unresolved until a planning estimate is recorded. A tool course cannot substitute for shared or specialist learning unless its recorded assessment evidences those outcomes.

### Evidence and planning rules

The approved must-have review is recorded in catalogue v11. N5.1 merges social engineering and deepfakes; N5.2 is retired with a crosswalk to N5.1; N5.8 adds a separate cyber risk overview. N5.4 retains its bank-specific attack examples. N6.4 is Accountability and N8 retains Skill terminology. Substantively changed outcomes are reassessed; unchanged outcomes retain their evidence. The 23 need groups retain equal weight. Foundation replaces Base; roles replaces macro roles; role specialisms replaces role extras; shared agentic capabilities includes both knowledge and practice; tool training replaces tool track in the explanation. Historical workbook sheet names and source labels remain available for traceability.

Each outcome uses the highest recorded score across selected resources (0–3), with no duplicate coverage credit. Each original need keeps equal weight in the cohort score. Full means every applicable outcome scores 3; Strong requires at least 70% and no must-have outcome at zero; Partial starts at 30%; otherwise coverage is Weak. Missing assessment remains distinct from an explicit zero. Planned internal work adds time but does not create assessed course coverage.

Course coverage is syllabus evidence, not demonstrated competence or operational permission. Shared courses and internal items are counted once across inherited learning. Changes to profile applicability recalculate coverage across the affected learning paths. Historical plans retain their original applicability until a new profile-based plan is explicitly created.

A blank workshop draft starts with provisional budgets of Foundation 2h, L1 2h, L2 8h, L3 24h and 4h per role addition. The published annual recommendation uses its separately configured budgets, including Foundation 2h. These are editable planning constraints, not claims about the time needed to become competent. Tool time and internal practice must also be planned.

### Essential outcomes and depth

A must-have is essential to achieving the learning objective safely and effectively, at the depth appropriate to the person's work. Foundation learners recognise risks, explain examples and know the precaution or escalation. L2 Practitioners apply precautions, check results and intervene. Builders and relevant specialists design, test and improve controls. N2 agent anatomy and safety components are conceptual at Foundation.

N3 explains AI limitations; N4 provides responsible-use training suitable for any bank employee; N5 provides cyber-focused security risk and threat awareness; N12 provides specialist security design and threat modelling. N5.8 is the overall risk map, N5.4 shows attacks on the bank's AI, and N12.1 develops detailed threat modelling. Deepfakes are a brief impersonation example within N5.1, not a standalone deep-dive objective. For cyber staff, a short awareness segment on recognising social engineering, independent verification and escalation is sufficient at Foundation; a full social-engineering course is excessive. The annual plan allocates 10 minutes within the existing bank session. Trainer references for N5.8 include the [OWASP LLM risk overview](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) and [OWASP agentic application risks](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/); the learner outcome is recognition and an appropriate response, not memorisation of the lists.

N11.3 is must-have when automated judges are used. R6.1.2 is must-have when assurance itself uses AI. These activities are explicit profile choices in the planner; the outcomes remain available for broader learning. R3.1.3 belongs to multi-agent testing, N14.7 to leadership, and R9.1.2 delegated-token depth to identity integration rather than routine identity operations. The workbook's generic course coverage includes conditional must-haves when assessing the full need; profile planning applies the actual responsibility and activity choices.

The Strong band requires at least 70% coverage and no applicable must-have at zero. A mention can clear that zero gate; it does not demonstrate competence. Outcomes below 3 remain completion gaps. Internal exercises earn no coverage until assessed.

## Detailed learning needs and outcomes

Outcomes are grouped by Foundation, L1 Entry, L2 Practitioner, L3 Expert, Specialisms and Tooling. A shared outcome may appear under both its level and specialist responsibility; its stable ID is counted once in path coverage.

The statements below are the current assessed outcomes from catalogue v11. Their **placement** is the new applicability, not the source workbook's historical level. Product and implementation terminology in an outcome describes its content, not a separate level or permission. Unchanged wording retains its existing evidence; a future substantive rewrite must be reassessed.

### Foundation

#### N1 — AI in cyber

What AI and agents already do in each cyber domain, what is coming, and how one's own work changes

**Content category: Cyber-specific.** AI use cases, emerging capabilities and changes to work are explicitly taught in cybersecurity domains.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N1.1 · must-have | **What AI does today in cyber.** Describe what AI and agents already do well in one's own domain and the neighbouring ones: triage and enrichment, log and code analysis, drafting and summarising, policy mapping, test generation | Foundation — common knowledge |
| N1.2 | **What is emerging.** Describe what is emerging in AI for cyber, beyond what is in production today | Foundation — common knowledge |
| N1.3 · must-have | **How one's own work changes.** Name two or three ways one's own work could change. The purpose is to open the mind to a new way of working, not to teach a tool | Foundation — common knowledge |
#### N2 — AI systems and agents

The components of an AI system and the components that keep it safe

**Content category: Generic.** Models, agent components, connectors, safety components and hosting are relevant across functions; adapt the platform examples to the organisation.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N2.1 | **Models.** Different providers make different models, varying in capability, cost, speed and how much they reason; some are open source and can be hosted by the bank; work is measured in tokens | Foundation — common knowledge |
| N2.2 | **Modalities.** AI handles text, code, images, voice, documents and screens, and can act across them | Foundation — common knowledge |
| N2.3 | **Ways of using AI.** Four patterns: assistant (chat), agent (acts, uses tools, loops until done), teams of agents, and humans and agents working in a shared space | Foundation — common knowledge |
| N2.4 · must-have | **Anatomy of an agent.** An agent is a model wrapped in a harness: instructions, memory, tools and a loop; the harness is what people configure | Foundation — common knowledge |
| N2.5 | **Connecting and extending.** Three ways to extend AI: connectors to tools and data (MCP), reusable playbooks (Skills), and APIs for building | Foundation — common knowledge |
| N2.6 · must-have | **Safety components.** Every safe deployment has an identity and permissions for the agent, a sandbox it runs in, an authorisation layer that decides what it may do, guardrails on input and output, logs of what it did, and a stop button | Foundation — common knowledge |
| N2.7 | **Where it runs.** The bank's approved platforms versus public tools, and what leaves the bank with each | Foundation — common knowledge |
#### N3 — AI limitations

How AI fails and how people fail with it, and the habits that counter it

**Content category: Generic.** AI limitations, prompt-injection awareness and habits for checking outputs apply to any AI user.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N3.1 · must-have | **Hallucination.** Hallucination and confident wrong answers: explain them and recognise them in one's own tools | Foundation — common knowledge |
| N3.2 | **Sycophancy.** The model agreeing with the user; recognising it in one's own tools | Foundation — common knowledge |
| N3.3 | **Context loss.** Loss of context in long sessions | Foundation — common knowledge |
| N3.4 | **Non-determinism.** Non-deterministic output: the same input can give different answers | Foundation — common knowledge |
| N3.5 · must-have | **Prompt injection.** Prompt injection as a behaviour of the model: content it reads can steer it | Foundation — common knowledge |
| N3.6 | **Automation bias.** Automation bias: the human tendency to over-trust the machine | Foundation — common knowledge |
| N3.7 · must-have | **Counter-habits.** The habits that counter these failures: check against sources, record one's own view before reading the AI's, sample rather than trust | Foundation — common knowledge |
#### N4 — Responsible AI use

Risks beyond the model's own limits, and the bank's rules on what may be used and delegated

**Content category: Generic.** Responsible use, data handling, supply-chain awareness and approved-use rules apply across functions; local policy and regulation provide context.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N4.1 · must-have | **Data leaving the bank.** Data leaving the bank through public tools | Foundation — common knowledge |
| N4.2 | **Confidentiality and client data.** Confidentiality and client data when using AI | Foundation — common knowledge |
| N4.3 | **Intellectual property.** Intellectual property risks of AI use | Foundation — common knowledge |
| N4.4 | **AI supply chain.** Third-party models, Skills and connectors as a supply chain | Foundation — common knowledge |
| N4.5 | **Regulation.** Regulation: the AI Act's literacy duty and the regional regulators' expectations | Foundation — common knowledge |
| N4.6 · must-have | **The bank's rules.** Applying the bank's rules on approved tools, and knowing what may and may not be handed to an agent | Foundation — common knowledge |
#### N5 — AI security risks and threats

Cyber risk overview, AI-enabled social engineering and intrusion, examples of attacks on the bank's AI, and defensive implications. N5.7 adds specialist threat tracking.

**Content category: Cyber-specific.** Cyber-focused risk awareness for all cyber staff: N5.8 provides the risk overview, N5.4 retains examples of attacks on the bank’s AI, and N5.1 includes deepfake impersonation. N5.7 threat tracking and control adjustment require specialist depth.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N5.1 · must-have | **AI-enabled social engineering and impersonation.** Explain how AI enables phishing and tailored social engineering at scale, including voice and video deepfakes used for impersonation. Recognise illustrative examples and explain why identity should be verified through an independent trusted channel. Deepfakes are an example of deception; production techniques are not required. | Foundation — common knowledge |
| N5.3 | **AI-enabled intrusion.** Vulnerability discovery, malware generation and automated intrusion using AI | Foundation — common knowledge |
| N5.4 | **Attacks on the bank's AI.** Attacks on the bank's own AI systems | Foundation — common knowledge |
| N5.5 · must-have | **What changes for defence.** Speed, volume, and the need to verify identity rather than trust a voice or a message | Foundation — common knowledge |
| N5.6 | **Recognising AI-enabled attacks.** Recognising AI-enabled attacks in one's own domain | Foundation — common knowledge |
| N5.8 · must-have | **Overview of AI security risks.** Recognise the main categories of security risk affecting AI systems and agents, informed by OWASP's LLM and agentic risk frameworks: instruction manipulation, sensitive-information disclosure, unsafe output handling, excessive permissions or actions, compromised components or information sources, and service disruption or uncontrolled resource consumption. Explain a simple example of each and identify an appropriate precaution or escalation route. Foundation awareness does not require threat modelling or memorising framework identifiers. | Foundation — common knowledge |


### L1 Entry

#### N6 — Working with AI

Delegating, giving context, judging output, owning the result, and the working knowledge behind them

**Content category: Generic.** Providing context, judging outputs and owning AI-assisted work apply in any function.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N6.1 · must-have | **Delegation.** Deciding what to hand to AI and what to keep, with a clear definition of success | L1 Entry — Work with AI assistance |
| N6.2 · must-have | **Context.** Giving the AI the right information, examples and constraints; this has replaced prompt-writing as the core skill | L1 Entry — Work with AI assistance |
| N6.3 · must-have | **Discernment.** Judging the output, the reasoning and the behaviour | L1 Entry — Work with AI assistance |
| N6.4 · must-have | **Accountability.** Owning the result and being transparent about AI's part in it | L1 Entry — Work with AI assistance |
| N6.5 | **Choosing a model.** Choosing a model and effort level for a task | L1 Entry — Work with AI assistance |
| N6.6 | **Context window and memory.** Why long sessions degrade as the context window fills, and managing memory | L1 Entry — Work with AI assistance |
| N6.7 | **Platform for the data.** Which approved platform suits which data classification | L1 Entry — Work with AI assistance |
| N6.8 | **Own work with AI.** Using assistants and personal agents for one's own work within the base rules, practised daily | L1 Entry — Work with AI assistance |


### L2 Practitioner

#### N4 — Responsible AI use

Risks beyond the model's own limits, and the bank's rules on what may be used and delegated

**Content category: Generic.** Responsible use, data handling, supply-chain awareness and approved-use rules apply across functions; local policy and regulation provide context.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N4.7 | **Vetting third-party Skills and connectors.** Vetting a third-party Skill or connector before using it | L2 Practitioner — Supervise agents |
#### N7 — Supervising agents

Delegate, monitor, verify, intervene and sign off on agents that act on bank systems

**Content category: Generic.** Delegating, monitoring, verifying, intervening and accounting for agent work apply to anyone supervising agents; use domain-specific exercises.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N7.1 · must-have | **Delegate.** Scope the task, set boundaries and permissions for the action classes one is signed off on, and check the agent's permissions before handing over | L2 Practitioner — Supervise agents |
| N7.2 · must-have | **Monitor.** Read the agent's trace (plan, tool calls, result), know which permissions it holds and what it has changed, find its logs, notice drift and approval overload | L2 Practitioner — Supervise agents |
| N7.3 · must-have | **Verify.** Sample outputs, trace the evidence, catch planted errors at the target rate | L2 Practitioner — Supervise agents |
| N7.4 · must-have | **Intervene.** Stop, override, roll back and take over mid-task, including when the agent is compromised; keep working when agents are down | L2 Practitioner — Supervise agents |
| N7.5 | **Account.** Sign off with a record an auditor can follow, own the outcome, feed corrections back | L2 Practitioner — Supervise agents |
#### N8 — Reusable instructions and connectors

Turning one's own work into reusable Skills and connecting AI to tools and data safely

**Content category: Generic.** Reusable task instructions and safe connector use apply across functions.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N8.1 · must-have | **Writing a Skill.** Turning a repeated task or runbook into a Skill: an explicit trigger so the agent selects it, numbered steps, an example of the expected output, a section on where the model goes wrong, and its own test cases (N9) | L2 Practitioner — Supervise agents |
| N8.2 | **Maintaining Skills.** Keeping Skills focused (one task each), reviewing them monthly and retesting them when models or tools change | L2 Practitioner — Supervise agents |
| N8.3 | **Shared library.** Contributing to a shared Skills library with named owners and a deprecation rule | L2 Practitioner — Supervise agents |
| N8.4 · must-have | **Using connectors safely.** Using connectors (MCP) knowing what each exposes and which permissions it grants, and applying least privilege | L2 Practitioner — Supervise agents |
| N8.5 | **Vetting before installing.** Vetting third-party Skills and connectors before installing them, since both run with the agent's permissions | L2 Practitioner — Supervise agents |
#### N9 — Testing your AI tasks

Building evals for one's own use cases

**Content category: Generic.** Task checks, known faults and retesting after changes apply to any recurring AI-assisted task.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N9.1 · must-have | **Benchmark cases.** A set of benchmark cases with known good answers for one's own use cases | L2 Practitioner — Supervise agents |
| N9.2 | **Known faults.** A catalogue of known faults the AI has made | L2 Practitioner — Supervise agents |
| N9.3 · must-have | **Pass or fail checks.** A pass or fail check for each case and fault | L2 Practitioner — Supervise agents |
| N9.4 · must-have | **Rerun on change.** Rerunning the evals whenever the model, tool or Skill changes; every Skill ships with its test cases | L2 Practitioner — Supervise agents |
| N9.5 | **Feeding the domain system.** Contributing results to the domain's evaluation system (N11) | L2 Practitioner — Supervise agents |


### L3 Expert

#### N10 — Building agents

Designing and building the domain's agents and what they run on

**Content category: Generic.** Agent design, engineering and safe deployment apply across domains. Technical depth and platform responsibilities still determine who needs each outcome.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N10.1 · must-have | **Agent design patterns.** The agent loop, tool definition, planning and reflection patterns | L3 Expert — Build and evaluate agents |
| N10.2 | **Multi-agent design.** When to split work across several agents and how they communicate | L3 Expert — Build and evaluate agents |
| N10.4 | **Models, cost and latency.** Model selection and routing, cost and latency | L3 Expert — Build and evaluate agents |
| N10.5 | **Hosting and residency.** Hosting options (vendor, cloud, on-premises) and data residency | L3 Expert — Build and evaluate agents |
| N10.8 · must-have | **Safe deployment.** Deploying with the safety components of N2 in place, to the standards set in N12 and the evaluation discipline of N11 | L3 Expert — Build and evaluate agents |
#### N11 — Evaluating agents and AI systems

Designing the evaluation system for a domain or a vendor product

**Content category: Generic.** Evaluation design, error analysis, vendor benchmarking and drift measurement apply across domains; test cases reflect the target work.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N11.1 · must-have | **Test-set design.** Designing test sets for a domain or a vendor product | L3 Expert — Build and evaluate agents |
| N11.2 · must-have | **Error analysis.** Error analysis across many practitioners' results (N9) | L3 Expert — Build and evaluate agents |
| N11.3 · must-have | **Validating automated judges.** Validating automated judges against human labels | L3 Expert — Build and evaluate agents · Essential: when automated judges are used |
| N11.4 | **Benchmarking vendor AI.** Benchmarking vendor AI before purchase | L3 Expert — Build and evaluate agents · Vendor evaluation and tool selection |
| N11.5 | **Drift in production.** Measuring drift in production | L3 Expert — Build and evaluate agents |
| N11.6 | **Evidence for decisions.** Feeding results into the evidence on which autonomy is proposed (N14) and vendor claims are judged | L3 Expert — Build and evaluate agents · Vendor evaluation and tool selection |


### Specialisms

#### Role 1: Security operations & response

#### R1.1 — Agent incident response

Playbooks for an agent that is wrong, stopped or compromised; stopping, investigating and cleaning up; operating without it

**Content category: Cyber-specific.** Responding to agent incidents, investigating compromise, containment, recovery and incident evidence are cyber operations responsibilities.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| R1.1.1 · must-have | **Agent incident playbooks.** Writing incident playbooks for three agent scenarios: the agent is wrong (it acted on a false conclusion, closed real alerts, changed the wrong thing); the agent is stopped (its identity expired, the provider is down, it ran out of compute) and its work must continue by hand; the agent is compromised (an attacker steered it through content it read). Plans name who can stop the agent (NCSC) | Agent incident response |
| R1.1.2 · must-have | **Ways to stop an agent.** The ways to stop an agent and when to use each: revoke its identity or session token so it can no longer call any tool; disable only the tools or connectors it misuses while the rest keeps running; put it in observe-only mode, where it may analyse and recommend but is barred from acting; roll back what it changed using its action log | Agent incident response |
| R1.1.3 · must-have | **Investigating a compromised agent.** Where the attack comes from: content the agent reads (logs, alerts, tickets, documents, emails, web pages) can carry instructions aimed at it, so the investigator looks for injection in those sources and cuts any that is poisoned. What the agent did: knowing, for each of the bank's agents, which records exist that the agent cannot write to and how to pull them fast (the platform's audit log of tool calls with arguments and times, gateway and network logs, logs of the systems it touched), then building the timeline from them, because a compromised agent's own summary can omit or misstate what it did | Agent incident response |
| R1.1.4 | **Cleaning up.** Cleaning up after a manipulated agent: finding the injected content it acted on and removing it from the sources the agent reads; clearing anything it stored in its memory as a result; re-running the same injection against the agent before putting it back in service | Agent incident response |
| R1.1.5 | **Operating without the agent.** The manual fallback for what the agent handled (triage queue, enrichment, first response), the staffing to sustain it for days, and the regular drill that proves it still works | Agent incident response |
| R1.1.6 | **Reporting.** What regulators expect in an incident report when an agent caused or worsened the incident (DORA, HKMA, MAS), and which evidence to preserve for it | Agent incident response |
#### R1.2 — Agent forensics and evidence

Defensible AI use on evidence and forensic readiness for agents

**Content category: Cyber-specific.** Forensic integrity, agent trace reconstruction and evidence handling require digital-forensics practice.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| R1.2.1 · must-have | **Recording the AI step.** Recording any AI step applied to evidence so it can be repeated and defended: the tool, model and version, the exact prompt and settings, the output, and who verified it. The original artefact stays the evidence; AI output is a derived analysis, never a substitute | Agent forensics and evidence |
| R1.2.2 · must-have | **Forensic readiness for agents.** Defining what every agent must log (prompt and response, each tool call with its arguments, data retrieved, memory writes, approvals given), stored where the agent cannot alter it, time-synchronised and integrity-protected, retained long enough for an investigation (vendors default to 7 to 30 days), and tested by reconstructing a past incident from it | Agent forensics and evidence |
| R1.2.3 | **Investigating an agent as suspect.** Rebuilding the agent's actions from its traces, finding the input that steered it, and attributing each action to the human it acted for or to the attacker | Agent forensics and evidence |

#### Role 2: Threat intelligence & detection

#### N5 — AI security risks and threats

Cyber risk overview, AI-enabled social engineering and intrusion, examples of attacks on the bank's AI, and defensive implications. N5.7 adds specialist threat tracking.

**Content category: Cyber-specific.** Cyber-focused risk awareness for all cyber staff: N5.8 provides the risk overview, N5.4 retains examples of attacks on the bank’s AI, and N5.1 includes deepfake impersonation. N5.7 threat tracking and control adjustment require specialist depth.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N5.7 | **Tracking the threat landscape.** Tracking the AI threat landscape and adjusting controls | Threat intelligence & detection — AI threat landscape |

#### Role 3: Offensive security & testing

#### R3.1 — Agent red-teaming

Attacking AI systems and agents with published methods and statistical measurement

**Content category: Cyber-specific.** Adversarial testing of agents, attack methods and red-team programmes require security-testing expertise.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| R3.1.1 · must-have | **AI attack classes.** Direct prompt injection; indirect injection through content the agent reads (documents, web pages, tool results, emails); jailbreaks and guardrail evasion; data exfiltration through the agent's own tools; making the agent exceed its intended authority; tool poisoning (a malicious tool description) and rug pulls (a tool that changes after it was approved) | Agent testing and containment |
| R3.1.2 · must-have | **Applying a structured testing method.** Apply a structured method to test an AI system or agent: define the scope and attack surface, choose relevant attack cases, execute repeatable tests, record evidence and report findings. Use suitable guidance such as the OWASP GenAI Red Teaming Guide, the CSA Agentic AI Red Teaming Guide or MITRE ATLAS; familiarity with every named publication is not required. | Agent testing and containment |
| R3.1.3 · must-have | **Attacks across agents.** Compromising one agent to steer others, injecting into an orchestrator's plan, tampering with messages between agents | Advanced agent red-teaming · Essential: for multi-agent testing responsibilities |
| R3.1.4 | **Attacks on model and platform.** Extracting the model or its instructions, poisoning the agent's memory, escaping the sandbox, timing side channels | Advanced agent red-teaming |
| R3.1.5 | **Automated red-team programme.** Building and running automated red-team harnesses (PyRIT-class tooling) and a continuous programme that re-tests every agent when its model, tools or prompts change | Advanced agent red-teaming |
#### R3.2 — Testing-agent containment

Technical containment of testing agents and validation of their findings from transcripts

**Content category: Cyber-specific.** Containing offensive testing agents and validating exploit evidence are security-testing responsibilities.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| R3.2.1 · must-have | **Containment before a run.** A network segment from which the agent can reach only in-scope targets; egress allow-lists verified by test, not assumed; a fresh sandbox per run; credentials scoped to the engagement and expiring with it | Agent testing and containment |
| R3.2.2 · must-have | **Monitoring during a run.** Watching the agent's actions out of band (not its reports); a named person with the authority and the means to kill the run within minutes; the triggers for doing so (an action outside scope, contact with a third party, a credential used elsewhere) | Agent testing and containment |
| R3.2.3 | **Escape patterns.** The escape patterns seen in practice: attacking something else when the assigned target proves impossible, reading an ambiguous message as approval, creating accounts or identities, carrying on after the window closes, contacting real people | Agent testing and containment |
| R3.2.4 · must-have | **Trajectory-level validation.** Validating findings from the transcript, not the summary: check that the evidence the agent cites exists (a 'successful login' that was a redirect, credentials that do not work), reproduce the exploit by hand before reporting, and treat the agent's self-assessment as untrusted | Agent testing and containment |
| R3.2.5 | **Collateral findings.** A disclosure lane for what to do when the agent finds something outside the engagement | Agent testing and containment |

#### Role 4: Vulnerability & exposure management

#### R4.1 — Agent exposure management

Discovery, inventory, approval, scanning and vetting of the agent tool estate

**Content category: Cyber-specific.** Discovering and managing agent, connector and MCP exposures is vulnerability and exposure management.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| R4.1.1 · must-have | **Discovery.** Finding every MCP server and agent connector in the estate, including those developers run on their own workstations, by searching configuration files and by recognising the MCP protocol in network traffic | Agent exposure management |
| R4.1.2 · must-have | **Inventory.** For each agent and tool server: its owner, version, the tools it exposes, the permissions it holds, the systems it reaches, and the guardrails around it | Agent exposure management |
| R4.1.3 · must-have | **Verifying approved components and detecting changes.** Verify that an agent uses the approved versions of its tools, Skills and connectors, detect changes to their code or descriptions, and require review before changed components are trusted. Use suitable integrity and change-control mechanisms, such as version pinning, signatures or hashes; a particular hashing implementation is not required. | Agent exposure management |
| R4.1.4 | **Scanning.** Running MCP and Skill scanners in the build pipeline and on a schedule for tool poisoning, instructions hidden in tool descriptions, servers exposed without authentication and credentials stored in plain text | Agent exposure management |
| R4.1.5 | **AI bill of materials.** A bill of materials for AI components: which models, tools and Skills a system uses and where each came from | Agent exposure management |
| R4.1.6 | **Vetting third parties.** Vetting third-party Skills and connectors before they are allowed in | Agent exposure management |
#### R4.2 — AI code-analysis engineering

Building, confirming and measuring the bank's own AI code analysis

**Content category: Cyber-specific.** Building and validating vulnerability-finding code-analysis harnesses requires application-security knowledge as well as generic agent engineering.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| R4.2.1 | **Why set-up is the skill.** The same model finds under a tenth or over half of the vulnerabilities in a codebase depending on how it is given context and driven, and filters a third or almost all of a static analyser's false positives for the same reason | AI code-analysis engineering |
| R4.2.2 · must-have | **Giving the model context.** Supplying the functions a target calls, type definitions, the data-flow path to the input and build information, using static and dynamic analysis tools to supply that context automatically | AI code-analysis engineering |
| R4.2.3 | **Framework, model and method.** Choosing the agent framework and the model for the task, and driving the model through a structured method rather than letting it explore freely | AI code-analysis engineering |
| R4.2.4 · must-have | **Confirming before reporting.** A proof of vulnerability (an input or exploit that demonstrates it in a sandbox), the same test against the patched and unpatched versions, and several runs with a majority verdict | AI code-analysis engineering |
| R4.2.5 | **Reliability by vulnerability class.** Which classes models find well (memory safety, anything a fuzzer can reach) and which they over-report (documented behaviour reported as a bug, inflated severity, duplicates), and setting thresholds per class | AI code-analysis engineering |
| R4.2.6 | **Deduplication and cost.** Removing duplicates (by stack trace or sanitiser signature) and keeping cost under control at scale | AI code-analysis engineering |
| R4.2.7 · must-have | **Measuring the harness.** Measuring the harness on a corpus of known vulnerabilities before trusting it | AI code-analysis engineering |

#### Role 5: Security architecture & engineering

#### N10 — Building agents

Designing and building the domain's agents and what they run on

**Content category: Generic.** Agent design, engineering and safe deployment apply across domains. Technical depth and platform responsibilities still determine who needs each outcome.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N10.3 · must-have | **Harness and context engineering.** Harness design and context engineering at scale | Security architecture & engineering — agent infrastructure |
| N10.6 | **MCP servers.** Building MCP servers | Security architecture & engineering — agent infrastructure |
| N10.7 | **Skills as infrastructure.** Running the Skills library as infrastructure and packaging Skills into domain plugins | Security architecture & engineering — agent infrastructure |
#### N12 — Securing AI

Threat-modelling and securing AI systems and agents, including AI security architecture

**Content category: Cyber-specific.** Threat modelling and designing, securing or remediating AI controls require cybersecurity expertise.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N12.1 · must-have | **Threat modelling.** Threat-modelling AI systems and agents using the OWASP LLM and agentic Top 10s and MITRE ATLAS | AI security design and remediation |
| N12.2 · must-have | **Agent identity.** Agent identity standards and delegated authorisation, and the threats against them | AI security design and remediation |
| N12.3 | **Sandboxes.** Sandbox design, and the threats against it | AI security design and remediation |
| N12.4 · must-have | **Authorisation layers.** Authorisation layers and policy engines, and the threats against them | AI security design and remediation |
| N12.5 | **Guardrails.** Guardrail design, and the threats against it | AI security design and remediation |
| N12.6 · must-have | **Logging, monitoring and kill switches.** Logging and observability, monitoring and kill switches, and the threats against them | AI security design and remediation |
| N12.7 | **AI supply chain.** Securing the Skills and connector supply chain and MCP servers | AI security design and remediation |
| N12.8 | **Fixing findings.** Fixing what red-teamers and incident responders find | AI security design and remediation |
| N12.9 | **Reference architectures.** Reference architectures, isolation patterns, platform tenancy and the controls for each hosting option | Agent security architecture |
#### R5.1 — Agent security architecture

Action tiers, enforcement outside the model, the stop mechanism, the audit trail and the oversight interface

**Content category: Cyber-specific.** Designing enforceable agent controls, protected audit trails and security reference architectures is security architecture work.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| R5.1.1 · must-have | **Classifying agent actions.** For each action an agent can take in a process (a payment, a data deletion, an email to a client, a firewall change), rating its impact and whether it can be undone, and assigning a tier: autonomous, autonomous with logging, human approval, two-person approval, prohibited | Agent security architecture |
| R5.1.2 · must-have | **Enforcement outside the model.** An authorisation point between the agent's plan and its execution that checks every action against its tier and the agent's permissions, so the decision never depends on the model obeying its instructions | Agent security architecture |
| R5.1.3 · must-have | **The stop mechanism.** No standard defines a kill switch, so it is designed as a set of levers (interrupt the task, revoke credentials, cut tool access, quarantine the agent, roll back its changes), each with who may trigger it, how fast it takes effect and how it is tested | Agent security architecture |
| R5.1.4 · must-have | **The audit trail.** What is recorded (reasoning artefacts, each tool call with its arguments, data accessed, messages between agents, approvals), where (a store the agent cannot write to), for how long, and how each action is tied to the person the agent acted for | Agent security architecture |
| R5.1.5 | **The oversight interface.** How an approval request is shown so a person can judge it (what will happen, in plain language, with the risk and the agent's confidence), limiting the volume of requests so approvers do not click through them, and what overseers must be trained on | Agent security architecture |
| R5.1.6 | **Reference architectures.** Reference architectures for the bank's agent platforms and how the above is implemented on each | Agent security architecture |

#### Role 6: Governance, risk, compliance & assurance

#### N11 — Evaluating agents and AI systems

Designing the evaluation system for a domain or a vendor product

**Content category: Generic.** Evaluation design, error analysis, vendor benchmarking and drift measurement apply across domains; test cases reflect the target work.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N11.4 | **Benchmarking vendor AI.** Benchmarking vendor AI before purchase | L3 Expert — Build and evaluate agents · Vendor evaluation and tool selection |
| N11.6 | **Evidence for decisions.** Feeding results into the evidence on which autonomy is proposed (N14) and vendor claims are judged | L3 Expert — Build and evaluate agents · Vendor evaluation and tool selection |
#### N13 — AI governance and risk

AI risk policy, assessment, third-party AI, regulation, assurance

**Content category: Generic.** AI inventories, risk assessment, autonomy policy, third-party risk and assurance obligations apply across functions. Cyber control assurance is developed further in R6.1.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N13.1 · must-have | **AI inventory.** Maintaining the inventory of AI systems, agents, Skills and connectors | AI governance and risk |
| N13.2 · must-have | **AI risk assessment.** Running AI risk assessment with thresholds and treatment | AI governance and risk |
| N13.3 · must-have | **Autonomy policy.** Setting the autonomy policy per action class and the accountability that goes with it | AI governance and risk · Leadership and accountability |
| N13.4 | **Third-party AI risk.** Managing third-party AI risk | AI governance and risk |
| N13.5 | **Regulatory mapping.** Mapping the AI Act and the regional regulators' requirements to controls | AI governance and risk |
| N13.6 | **Assurance evidence.** Producing the assurance evidence auditors and regulators ask for | AI governance and risk |
#### R6.1 — Agent assurance

An audit opinion over controls that cannot be sampled

**Content category: Cyber-specific.** Testing agent security controls and assuring the AI used for assessments requires cyber assurance expertise.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| R6.1.1 · must-have | **Agent control catalogue.** The control catalogue for agents and how to test each control: a distinct identity and permissions per agent, tool allow-lists, logging that the agent cannot alter, approval gates for high-impact actions, change control on prompts, tools and models | Agent assurance |
| R6.1.2 · must-have | **Assuring assurance's own AI.** Documenting, validating and monitoring the AI used to produce assessments and gather evidence | Agent assurance · Essential: when assurance work itself uses ai |

#### Role 7: Security awareness & culture

Reuses shared awareness and tooling; no separate responsibility package.
#### Role 8: Identity & access management (IAM)

#### R9.1 — Agent identity lifecycle

From registration to revocation; Experts integrate it with IGA, PAM and SIEM and design break-glass

**Content category: Cyber-specific.** Agent identity, delegated authority, access lifecycle, revocation and IGA/PAM/SIEM integration are IAM responsibilities.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| R9.1.1 · must-have | **Registering an agent.** Its own identity (never a shared or human credential), a human sponsor recorded in the directory who is accountable for it, a stated purpose and a declared list of what it may do | Agent identity operations |
| R9.1.2 · must-have | **Delegated authority.** Issuing and reading tokens in which the subject is the person and the actor is the agent (token exchange, on-behalf-of flows), with the person's consent recorded, and what the agent may then do in that person's name | Agent identity integration and design · Essential: for delegated-identity integration responsibilities |
| R9.1.3 · must-have | **Connector and MCP scopes.** Reading what a scope actually permits in the bank's applications and tool servers, granting the minimum, and reviewing grants | Agent identity operations |
| R9.1.4 | **Just-in-time access.** Privilege granted for a task and a time window with no standing privilege, and the conditions that require a human to approve the grant | Agent identity operations |
| R9.1.5 | **Short-lived sub-agents.** Identities that exist for seconds, with a time to live and no more rights than the parent | Agent identity operations |
| R9.1.6 | **Recertification.** Quarterly for agents and monthly for high-privilege ones, with de-provisioning triggered when the sponsor leaves or the purpose lapses | Agent identity operations |
| R9.1.7 · must-have | **Revocation drills.** Revoking an agent's identity and its live sessions within minutes, and verifying that it worked | Agent identity operations |
| R9.1.8 | **Integration with IGA, PAM, SIEM.** Integrating the agent authorisation point with identity governance, privileged access and the SIEM: registration, scoped issuance, just-in-time grants, recertification and revocation signals flowing between them | Agent identity integration and design |
| R9.1.9 | **Privileged access and break-glass.** Privileged access and break-glass for agents inside the existing privileged-access model | Agent identity integration and design |
| R9.1.10 | **Audit trail and standards.** The audit trail regulators ask for (which agent, on whose behalf, which tools, what data, what reasoning) and the standards still being written (IETF agent identity, OpenID AuthZEN, MCP authorisation), so the design does not lock into one vendor's delegation model | Agent identity integration and design |

#### Role 9: Leadership

#### N11 — Evaluating agents and AI systems

Designing the evaluation system for a domain or a vendor product

**Content category: Generic.** Evaluation design, error analysis, vendor benchmarking and drift measurement apply across domains; test cases reflect the target work.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N11.4 | **Benchmarking vendor AI.** Benchmarking vendor AI before purchase | L3 Expert — Build and evaluate agents · Vendor evaluation and tool selection |
| N11.6 | **Evidence for decisions.** Feeding results into the evidence on which autonomy is proposed (N14) and vendor claims are judged | L3 Expert — Build and evaluate agents · Vendor evaluation and tool selection |
#### N13 — AI governance and risk

AI risk policy, assessment, third-party AI, regulation, assurance

**Content category: Generic.** AI inventories, risk assessment, autonomy policy, third-party risk and assurance obligations apply across functions. Cyber control assurance is developed further in R6.1.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N13.1 · must-have | **AI inventory.** Maintaining the inventory of AI systems, agents, Skills and connectors | AI governance and risk |
| N13.2 · must-have | **AI risk assessment.** Running AI risk assessment with thresholds and treatment | AI governance and risk |
| N13.3 · must-have | **Autonomy policy.** Setting the autonomy policy per action class and the accountability that goes with it | AI governance and risk · Leadership and accountability |
| N13.4 | **Third-party AI risk.** Managing third-party AI risk | AI governance and risk |
| N13.5 | **Regulatory mapping.** Mapping the AI Act and the regional regulators' requirements to controls | AI governance and risk |
| N13.6 | **Assurance evidence.** Producing the assurance evidence auditors and regulators ask for | AI governance and risk |
#### N14 — Transforming work and leading adoption

Deciding what agents and people do, designing supervision, measuring value, leading the change

**Content category: Generic.** Workflow redesign, supervision, value measurement, adoption and accountability apply to leaders and change roles in any function.

| Outcome ID | Learning outcome | Placement |
| --- | --- | --- |
| N14.1 · must-have | **Who does what.** Deciding, workflow by workflow, what agents do and what people do, and how many agents a person supervises | Workflow transformation and adoption · Leadership and accountability |
| N14.2 · must-have | **Workflow redesign.** Redesigning the workflow rather than bolting AI onto it | Workflow transformation and adoption · Leadership and accountability |
| N14.3 · must-have | **Supervision model.** Designing the supervision model that N7 practises: approval gates, how output is presented for review, and the autonomy proposed for each action class on evidence from N11 | Workflow transformation and adoption · Leadership and accountability |
| N14.4 · must-have | **Measuring value.** Measuring the value on evidence | Workflow transformation and adoption · Leadership and accountability |
| N14.5 | **Running the change.** Running the change: a sandbox and protected time to experiment, a network of champions, Skills shared across teams, and a refresh cycle as tools change | Workflow transformation and adoption · Leadership and accountability |
| N14.6 | **Keeping skills alive.** Keeping core skills alive and protecting the junior pipeline | Leadership and accountability |
| N14.7 · must-have | **Accountability.** Setting who is accountable for each agent's outcomes | Leadership and accountability · Essential: for leadership responsibilities |



### Tooling

Tooling is configured by approved product and intended task: use, supervise, build or administer. Catalogue metadata does not create assessed outcome scores.

## Crosswalk and compatibility

Retired outcome **N5.2 — Deepfakes** is merged into **N5.1 — AI-enabled social engineering and impersonation**. Original assessments are historical evidence, not automatically valid scores for the merged outcome.

All 140 active outcomes across 23 scored needs are mapped below. Existing need IDs continue to determine scoring groups. Source levels are retained only as historical metadata; they no longer gate role applicability.

| Outcome ID | Original need | Original level | New component | Shared level | Role specialisms |
| --- | --- | --- | --- | --- | --- |
| N1.1 | N1 | Base | Foundation | Foundation | — |
| N1.2 | N1 | Base | Foundation | Foundation | — |
| N1.3 | N1 | Base | Foundation | Foundation | — |
| N2.1 | N2 | Base | Foundation | Foundation | — |
| N2.2 | N2 | Base | Foundation | Foundation | — |
| N2.3 | N2 | Base | Foundation | Foundation | — |
| N2.4 | N2 | Base | Foundation | Foundation | — |
| N2.5 | N2 | Base | Foundation | Foundation | — |
| N2.6 | N2 | Base | Foundation | Foundation | — |
| N2.7 | N2 | Base | Foundation | Foundation | — |
| N3.1 | N3 | Base | Foundation | Foundation | — |
| N3.2 | N3 | Base | Foundation | Foundation | — |
| N3.3 | N3 | Base | Foundation | Foundation | — |
| N3.4 | N3 | Base | Foundation | Foundation | — |
| N3.5 | N3 | Base | Foundation | Foundation | — |
| N3.6 | N3 | Base | Foundation | Foundation | — |
| N3.7 | N3 | Base | Foundation | Foundation | — |
| N4.1 | N4 | Base | Foundation | Foundation | — |
| N4.2 | N4 | Base | Foundation | Foundation | — |
| N4.3 | N4 | Base | Foundation | Foundation | — |
| N4.4 | N4 | Base | Foundation | Foundation | — |
| N4.5 | N4 | Base | Foundation | Foundation | — |
| N4.6 | N4 | Base | Foundation | Foundation | — |
| N4.7 | N4 | Practitioner | Agentic level | L2 | — |
| N5.1 | N5 | Base | Foundation | Foundation | — |
| N5.3 | N5 | Base | Foundation | Foundation | — |
| N5.4 | N5 | Base | Foundation | Foundation | — |
| N5.5 | N5 | Base | Foundation | Foundation | — |
| N5.6 | N5 | Base | Foundation | Foundation | — |
| N5.7 | N5 | Expert | Role specialism | — | Threat intelligence & detection — AI threat landscape |
| N6.1 | N6 | Entry | Agentic level | L1 | — |
| N6.2 | N6 | Entry | Agentic level | L1 | — |
| N6.3 | N6 | Entry | Agentic level | L1 | — |
| N6.4 | N6 | Entry | Agentic level | L1 | — |
| N6.5 | N6 | Entry | Agentic level | L1 | — |
| N6.6 | N6 | Entry | Agentic level | L1 | — |
| N6.7 | N6 | Entry | Agentic level | L1 | — |
| N6.8 | N6 | Entry | Agentic level | L1 | — |
| N7.1 | N7 | Practitioner | Agentic level | L2 | — |
| N7.2 | N7 | Practitioner | Agentic level | L2 | — |
| N7.3 | N7 | Practitioner | Agentic level | L2 | — |
| N7.4 | N7 | Practitioner | Agentic level | L2 | — |
| N7.5 | N7 | Practitioner | Agentic level | L2 | — |
| N8.1 | N8 | Practitioner | Agentic level | L2 | — |
| N8.2 | N8 | Practitioner | Agentic level | L2 | — |
| N8.3 | N8 | Practitioner | Agentic level | L2 | — |
| N8.4 | N8 | Practitioner | Agentic level | L2 | — |
| N8.5 | N8 | Practitioner | Agentic level | L2 | — |
| N9.1 | N9 | Practitioner | Agentic level | L2 | — |
| N9.2 | N9 | Practitioner | Agentic level | L2 | — |
| N9.3 | N9 | Practitioner | Agentic level | L2 | — |
| N9.4 | N9 | Practitioner | Agentic level | L2 | — |
| N9.5 | N9 | Practitioner | Agentic level | L2 | — |
| N10.1 | N10 | Expert | Agentic level | L3 | — |
| N10.2 | N10 | Expert | Agentic level | L3 | — |
| N10.3 | N10 | Expert | Role specialism | — | Security architecture & engineering — agent infrastructure |
| N10.4 | N10 | Expert | Agentic level | L3 | — |
| N10.5 | N10 | Expert | Agentic level | L3 | — |
| N10.6 | N10 | Expert | Role specialism | — | Security architecture & engineering — agent infrastructure |
| N10.7 | N10 | Expert | Role specialism | — | Security architecture & engineering — agent infrastructure |
| N10.8 | N10 | Expert | Agentic level | L3 | — |
| N11.1 | N11 | Expert | Agentic level | L3 | — |
| N11.2 | N11 | Expert | Agentic level | L3 | — |
| N11.3 | N11 | Expert | Agentic level | L3 | — |
| N11.4 | N11 | Expert | Agentic level | L3 | Vendor evaluation and tool selection |
| N11.5 | N11 | Expert | Agentic level | L3 | — |
| N11.6 | N11 | Expert | Agentic level | L3 | Vendor evaluation and tool selection |
| N12.1 | N12 | Expert | Role specialism | — | AI security design and remediation |
| N12.2 | N12 | Expert | Role specialism | — | AI security design and remediation |
| N12.3 | N12 | Expert | Role specialism | — | AI security design and remediation |
| N12.4 | N12 | Expert | Role specialism | — | AI security design and remediation |
| N12.5 | N12 | Expert | Role specialism | — | AI security design and remediation |
| N12.6 | N12 | Expert | Role specialism | — | AI security design and remediation |
| N12.7 | N12 | Expert | Role specialism | — | AI security design and remediation |
| N12.8 | N12 | Expert | Role specialism | — | AI security design and remediation |
| N12.9 | N12 | Expert (architects) | Role specialism | — | Agent security architecture |
| N13.1 | N13 | Expert (GRC, BISOs, leaders) | Role specialism | — | AI governance and risk |
| N13.2 | N13 | Expert (GRC, BISOs, leaders) | Role specialism | — | AI governance and risk |
| N13.3 | N13 | Expert (GRC, BISOs, leaders) | Role specialism | — | AI governance and risk; Leadership and accountability |
| N13.4 | N13 | Expert (GRC, BISOs, leaders) | Role specialism | — | AI governance and risk |
| N13.5 | N13 | Expert (GRC, BISOs, leaders) | Role specialism | — | AI governance and risk |
| N13.6 | N13 | Expert (GRC, BISOs, leaders) | Role specialism | — | AI governance and risk |
| N14.1 | N14 | Expert (leaders, champions) | Role specialism | — | Workflow transformation and adoption; Leadership and accountability |
| N14.2 | N14 | Expert (leaders, champions) | Role specialism | — | Workflow transformation and adoption; Leadership and accountability |
| N14.3 | N14 | Expert (leaders, champions) | Role specialism | — | Workflow transformation and adoption; Leadership and accountability |
| N14.4 | N14 | Expert (leaders, champions) | Role specialism | — | Workflow transformation and adoption; Leadership and accountability |
| N14.5 | N14 | Expert (leaders, champions) | Role specialism | — | Workflow transformation and adoption; Leadership and accountability |
| N14.6 | N14 | Leaders | Role specialism | — | Leadership and accountability |
| N14.7 | N14 | Leaders | Role specialism | — | Leadership and accountability |
| R1.1.1 | R1.1 | Practitioner | Role specialism | — | Agent incident response |
| R1.1.2 | R1.1 | Practitioner | Role specialism | — | Agent incident response |
| R1.1.3 | R1.1 | Practitioner | Role specialism | — | Agent incident response |
| R1.1.4 | R1.1 | Practitioner | Role specialism | — | Agent incident response |
| R1.1.5 | R1.1 | Practitioner | Role specialism | — | Agent incident response |
| R1.1.6 | R1.1 | Practitioner | Role specialism | — | Agent incident response |
| R1.2.1 | R1.2 | Expert | Role specialism | — | Agent forensics and evidence |
| R1.2.2 | R1.2 | Expert | Role specialism | — | Agent forensics and evidence |
| R1.2.3 | R1.2 | Expert | Role specialism | — | Agent forensics and evidence |
| R3.1.1 | R3.1 | Practitioner | Role specialism | — | Agent testing and containment |
| R3.1.2 | R3.1 | Practitioner | Role specialism | — | Agent testing and containment |
| R3.1.3 | R3.1 | Expert | Role specialism | — | Advanced agent red-teaming |
| R3.1.4 | R3.1 | Expert | Role specialism | — | Advanced agent red-teaming |
| R3.1.5 | R3.1 | Expert | Role specialism | — | Advanced agent red-teaming |
| R3.2.1 | R3.2 | Practitioner | Role specialism | — | Agent testing and containment |
| R3.2.2 | R3.2 | Practitioner | Role specialism | — | Agent testing and containment |
| R3.2.3 | R3.2 | Practitioner | Role specialism | — | Agent testing and containment |
| R3.2.4 | R3.2 | Practitioner | Role specialism | — | Agent testing and containment |
| R3.2.5 | R3.2 | Practitioner | Role specialism | — | Agent testing and containment |
| R4.1.1 | R4.1 | Practitioner | Role specialism | — | Agent exposure management |
| R4.1.2 | R4.1 | Practitioner | Role specialism | — | Agent exposure management |
| R4.1.3 | R4.1 | Practitioner | Role specialism | — | Agent exposure management |
| R4.1.4 | R4.1 | Practitioner | Role specialism | — | Agent exposure management |
| R4.1.5 | R4.1 | Practitioner | Role specialism | — | Agent exposure management |
| R4.1.6 | R4.1 | Practitioner | Role specialism | — | Agent exposure management |
| R4.2.1 | R4.2 | Expert | Role specialism | — | AI code-analysis engineering |
| R4.2.2 | R4.2 | Expert | Role specialism | — | AI code-analysis engineering |
| R4.2.3 | R4.2 | Expert | Role specialism | — | AI code-analysis engineering |
| R4.2.4 | R4.2 | Expert | Role specialism | — | AI code-analysis engineering |
| R4.2.5 | R4.2 | Expert | Role specialism | — | AI code-analysis engineering |
| R4.2.6 | R4.2 | Expert | Role specialism | — | AI code-analysis engineering |
| R4.2.7 | R4.2 | Expert | Role specialism | — | AI code-analysis engineering |
| R5.1.1 | R5.1 | Expert | Role specialism | — | Agent security architecture |
| R5.1.2 | R5.1 | Expert | Role specialism | — | Agent security architecture |
| R5.1.3 | R5.1 | Expert | Role specialism | — | Agent security architecture |
| R5.1.4 | R5.1 | Expert | Role specialism | — | Agent security architecture |
| R5.1.5 | R5.1 | Expert | Role specialism | — | Agent security architecture |
| R5.1.6 | R5.1 | Expert | Role specialism | — | Agent security architecture |
| R6.1.1 | R6.1 | Expert | Role specialism | — | Agent assurance |
| R6.1.2 | R6.1 | Expert | Role specialism | — | Agent assurance |
| R9.1.1 | R9.1 | Practitioner | Role specialism | — | Agent identity operations |
| R9.1.2 | R9.1 | Practitioner | Role specialism | — | Agent identity integration and design |
| R9.1.3 | R9.1 | Practitioner | Role specialism | — | Agent identity operations |
| R9.1.4 | R9.1 | Practitioner | Role specialism | — | Agent identity operations |
| R9.1.5 | R9.1 | Practitioner | Role specialism | — | Agent identity operations |
| R9.1.6 | R9.1 | Practitioner | Role specialism | — | Agent identity operations |
| R9.1.7 | R9.1 | Practitioner | Role specialism | — | Agent identity operations |
| R9.1.8 | R9.1 | Expert | Role specialism | — | Agent identity integration and design |
| R9.1.9 | R9.1 | Expert | Role specialism | — | Agent identity integration and design |
| R9.1.10 | R9.1 | Expert | Role specialism | — | Agent identity integration and design |
| N5.8 | N5 | Base | Foundation | Foundation | — |

Machine-readable crosswalk: [JSON](../training-planner/public/data/capability-crosswalk.json) · [CSV](Capability_Model_Crosswalk.csv). Previous model: [Version 1](../archive/capability-framework/Agentic-Era_Workforce_Capability_Model-v1.md). Assessment source: [AI_Era_Cyber_Training_Catalogue_v15.xlsx](../catalogue/AI_Era_Cyber_Training_Catalogue_v15.xlsx), snapshot ff6d5a46d0450171. Catalogue v11 records the approved revisions and fresh assessments. Retired N5.2 maps to revised N5.1; historical scores remain in the archived catalogue and retired workbook rows. The workbook's role-number labels follow the current model. Archived versions retain their historical numbering.
