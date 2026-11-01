// Generate the readable model and its complete crosswalk from the versioned
// assessed outcomes plus the versioned applicability overlay.
import {readFile,writeFile} from 'node:fs/promises';
import {MODEL_VERSION,MODEL_REVISION,RETIRED_OUTCOMES,LEVELS,SPECIALISMS,NEED_TITLES,crosswalk,requirementPlacement} from '../public/capability-model.js';
import {ROLE_FAMILIES,ROLE_NUMBERING_NOTE,TOOL_TRAINING_EXAMPLES,NEED_DOMAINS} from '../public/model-explanation.js';
import {groupedOutcomes,audienceLabel} from '../public/presentation.js';
const data=JSON.parse(await readFile(new URL('../public/data/catalogue.json',import.meta.url)));
const rows=crosswalk(data), ids=new Set(rows.map(r=>r.id));
for(const s of SPECIALISMS)for(const id of s.requirements)if(!ids.has(id))throw Error(`Unknown outcome ${id} in ${s.id}`);
if(rows.length!==ids.size||rows.some(r=>r.agenticLevel===null&&!r.specialisms.length))throw Error('Incomplete or duplicate requirement mapping');
if(data.needs.length!==Object.keys(NEED_DOMAINS).length||data.needs.some(n=>!NEED_DOMAINS[n.id]))throw Error('Learning need classification is incomplete');
const cell=s=>String(s??'').replaceAll('|','\\|').replaceAll('\n',' ');
const table=(headers,rs)=>[headers,headers.map(()=>'---'),...rs].map(r=>'| '+r.map(cell).join(' | ')+' |').join('\n');
const onePage=`# Agentic-Era Workforce Capability Model

**Version ${MODEL_VERSION}, revision ${MODEL_REVISION} · Presentation updated 31 October 2026; applicability unchanged**

## The model in one page

**Everyone shares a foundation. Their remaining learning depends on how they work with agents, their role, and the tools they use.**

**Target capability profile = Foundation + Agentic level + Relevant role specialisms + Tool training.**

${table(['Component','Question it answers','Meaning'],[
['Foundation','What should everyone understand?','Common knowledge of AI, agents, limitations, risks, threats and responsible use.'],
['Agentic level','How will this person work with agents?','L1: work with AI assistance. L2: supervise agents. L3: build and evaluate agents.'],
['Role specialisms','What additional capabilities does the job require?','Relevant responsibilities in governance, leadership, IAM, incident response, security architecture and other domains.'],
['Tool training','Which tools must they operate?','How to use a specific product, platform or in-house tool, assigned according to access and intended work.']])}

Foundation is shared by everyone and is not a fourth level. Role specialisms and tool training can apply at any agentic level.

### Agentic levels — how people work with agents

${table(['Level','Capability target'],LEVELS.slice(1).map(l=>[l.name,l.description]))}

**The L2/L3 boundary:** L2 operates and adapts an existing agent workflow and runs task checks; L3 designs the agent's behaviour and its evaluation approach. Writing a reusable task instruction within an approved workflow does not by itself make someone L3. L3 includes no-code/low-code builders. Shared agent infrastructure is a learning need within Security architecture & engineering, selected for people with that responsibility.

Levels describe target agentic capabilities, not seniority, professional expertise or operational authorisation. A senior leader can be L1; a GRC specialist can be L3. Higher levels build on lower shared capabilities, but demonstrated capabilities need not be retaught. Everyone does not need to reach L3.

### Role specialisms — what the job requires

Role specialisms add capabilities for the responsibilities of the **nine roles already defined in this model**. They retain the project's grouping of [ENISA's European Cybersecurity Skills Framework (ECSF) profiles](https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles), including Leadership and the explicit Vulnerability & exposure management and IAM roles. This is the model's grouping of roles, not a replacement list of ECSF profiles.

${table(['Defined role','ECSF reference in the existing model'],ROLE_FAMILIES.map(r=>[`${r.id}. ${r.name}`,r.ecsf]))}

${ROLE_NUMBERING_NOTE}

Select the relevant outcomes for the actual responsibilities; a person can work across roles and need several specialisms at any agentic level. Specialist depth follows the responsibility. A role does not require a new specialist module when shared capabilities and tool training meet its needs. Application-security code-analysis and harness requirements are already covered by R4.2 within Vulnerability & exposure management.

### Tool training — how people use their approved tools

**Tool training teaches someone how to use a specific product, platform or in-house tool.** Its audience follows tool distribution and intended work: it may apply to everyone if the tool is deployed to everyone, to users across several functions, or only to a particular specialist group. People with access receive training for the tasks they are expected to perform; the same product can require different training for users, supervisors and builders.

${table(['Who needs the tool training','What the training teaches'],TOOL_TRAINING_EXAMPLES)}

The named examples use Microsoft Copilot Cowork, Anthropic Claude Code and Claude Code Security. They illustrate training needs where the products are approved and access is provided; they do not imply that these tools are already deployed in the bank.

Operating an existing vulnerability-finding tool is distinct from designing its harness and evaluation approach. The latter needs L3 capabilities and the application-security specialism as well as training on the chosen development tools. Tool training supplements those capabilities; familiarity with a product alone does not demonstrate them or grant operational permission.

The existing cyber curriculum (N0, core craft) remains a prerequisite. This model describes the additional capabilities for the agentic era.
`;
const guidance=`
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

**Current classification: ${data.needs.filter(n=>NEED_DOMAINS[n.id].kind==='Generic').length} generic needs and ${data.needs.filter(n=>NEED_DOMAINS[n.id].kind==='Cyber-specific').length} cyber-specific needs.** N0, the existing core-craft curriculum, is a cyber-specific prerequisite outside these ${data.needs.length} assessed needs.

${table(['Need','Content category','Why / how it is applied'],data.needs.map(n=>[`${n.id} — ${NEED_TITLES[n.id]||n.title}`,NEED_DOMAINS[n.id].kind,NEED_DOMAINS[n.id].reason]))}

Teach reusable generic capabilities together where useful, then add cyber cases, specialist outcomes and practice on the tools each audience will use. For application security, N7 and N9 supply generic supervision and task checks; N10–N11 supply generic building and evaluation; R4.2 adds the cyber-specific code-analysis and vulnerability-validation capabilities. This classification describes content for planning; it does not change outcome IDs, profile applicability, scored need groups or assessment evidence.

${table(['Example profile','Learning combination'],[
['GRC practitioner supervising assessment agents','Foundation + L2 + relevant governance outcomes + tools'],
['GRC specialist building assessment agents','Foundation + L3 + relevant governance outcomes + tools'],
['IAM specialist administering agent identities manually','Foundation + L1 + identity operations + tools'],
['Leader setting adoption priorities','Foundation + their actual agentic level + relevant leadership, governance and vendor-evaluation outcomes + tools']])}

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

${table(['Component','Existing outcome mapping'],[
['Foundation','N1–N5 foundation outcomes; excludes N4.7 and N5.7'],
['L1','N6'],
['L2','N7–N9 and N4.7 (third-party vetting)'],
['L3','N10 and N11, except N10.3, N10.6 and N10.7'],
['Role specialisms','N12–N14 and the existing R-coded outcomes; N10.3, N10.6 and N10.7 for agent infrastructure within Security architecture & engineering; N5.7 for AI threat tracking within Threat intelligence & detection'],
['Tool training','Product-specific practice linked to the relevant shared or specialist outcomes']])}

Safe deployment remains common L3 learning through N10.8, supported by the foundation and safe-use outcomes. Detailed security design belongs to the relevant specialism. N10.5 covers understanding hosting and residency choices, not building the hosting platform.

The following packages collect learning needs within the defined roles. They are editable starting points based on responsibilities, not job grades or mandatory assignments for everyone in a function. **Agent infrastructure belongs within Security architecture & engineering:** N10.3 covers harness and context engineering at scale, N10.6 covers building MCP servers, and N10.7 covers shared Skills infrastructure. These existing outcomes remain part of N10 for assessment; they do not introduce another role or scored need. Role prerequisites must be checked independently of agentic level. Identity operations and identity integration, for example, represent different responsibilities rather than L2 and L3 gates. A specialist outcome can apply at L1 even when its historical rubric label was L3 Expert.

**AI threat tracking belongs within Threat intelligence & detection:** N5.7 covers tracking the AI threat landscape and adjusting controls. It remains an outcome within N5 for assessment, selected for that role's responsibilities. The other N5 outcomes provide shared foundation awareness; N5.7 adds the specialist depth. It is a role learning need, not an additional model component.

${table(['Role learning needs','Learning outcomes'],SPECIALISMS.map(s=>[s.id==='agent-engineering'?'Security architecture & engineering':s.name,s.requirements.join(', ')]))}

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

Outcomes are grouped by Foundation, L1 Entry, L2 Practitioner, L3 Expert, Specialisms and Tooling. A shared outcome may appear under both its level and specialist responsibility; its stable ID is counted once in path coverage.\n\nThe statements below are the current assessed outcomes from catalogue v11. Their **placement** is the new applicability, not the source workbook's historical level. Product and implementation terminology in an outcome describes its content, not a separate level or permission. Unchanged wording retains its existing evidence; a future substantive rewrite must be reassessed.
`;
const needDetails=n=>`#### ${n.id} — ${n.title}\n\n${n.description}\n\n**Content category: ${NEED_DOMAINS[n.id].kind}.** ${NEED_DOMAINS[n.id].reason}\n\n${table(['Outcome ID','Learning outcome','Placement'],n.rows.map(r=>[r.id+(r.core?' · must-have':''),`**${r.title}.** ${r.description}`,requirementPlacement(r)]))}\n`;
const details=groupedOutcomes(data).map(group=>`\n### ${group.name}\n\n${group.name==='Tooling'?'Tooling is configured by approved product and intended task: use, supervise, build or administer. Catalogue metadata does not create assessed outcome scores.':group.roles.length?group.roles.map(role=>`#### Role ${role.id}: ${role.name}\n\n${role.needs.map(needDetails).join('')||'Reuses shared awareness and tooling; no separate responsibility package.'}\n`).join(''):group.needs.map(needDetails).join('')}\n`).join('');
const appendix=`
## Crosswalk and compatibility

Retired outcome **N5.2 — Deepfakes** is merged into **N5.1 — AI-enabled social engineering and impersonation**. Original assessments are historical evidence, not automatically valid scores for the merged outcome.

All ${rows.length} active outcomes across ${data.needs.length} scored needs are mapped below. Existing need IDs continue to determine scoring groups. Source levels are retained only as historical metadata; they no longer gate role applicability.

${table(['Outcome ID','Original need','Original level','New component','Shared level','Role specialisms'],rows.map(r=>[r.id,r.need,r.sourceLevel,r.component,r.agenticLevel===null?'—':r.agenticLevel===0?'Foundation':'L'+r.agenticLevel,r.specialisms.map(id=>SPECIALISMS.find(s=>s.id===id).name).join('; ')||'—']))}

Machine-readable crosswalk: [JSON](../training-planner/public/data/capability-crosswalk.json) · [CSV](Capability_Model_Crosswalk.csv). Previous model: [Version 1](../archive/capability-framework/Agentic-Era_Workforce_Capability_Model-v1.md). Assessment source: [${data.filename}](../catalogue/${data.filename}), snapshot ${data.version}. Catalogue v11 records the approved revisions and fresh assessments. Retired N5.2 maps to revised N5.1; historical scores remain in the archived catalogue and retired workbook rows. The workbook's role-number labels follow the current model. Archived versions retain their historical numbering.
`;
await writeFile(new URL('../../capability-framework/Agentic-Era_Workforce_Capability_Model.md',import.meta.url),onePage+guidance+details+appendix);
await writeFile(new URL('../public/data/capability-crosswalk.json',import.meta.url),JSON.stringify({modelVersion:MODEL_VERSION,modelRevision:MODEL_REVISION,catalogueVersion:data.version,retiredOutcomes:RETIRED_OUTCOMES,requirements:rows},null,2)+'\n');
const csvCell=s=>'"'+String(s??'').replaceAll('"','""')+'"';
const csv=[['Outcome ID','Original need','Original level','Original rank','New component','Shared level','Role specialisms','Title','Description','Must-have','Essential when','Source sheet','Source row','Learning categories'],...rows.map(r=>[r.id,r.need,r.sourceLevel,r.sourceRank,r.component,r.agenticLevel===null?'':r.agenticLevel===0?'Foundation':'L'+r.agenticLevel,r.specialisms.join('; '),r.title,r.description,r.core,r.core?(r.coreCondition||'Always when assigned'):'',r.source.sheet,r.source.row,r.categories.join('; ')])].map(r=>r.map(csvCell).join(',')).join('\r\n');
await writeFile(new URL('../../capability-framework/Capability_Model_Crosswalk.csv',import.meta.url),'\uFEFF'+csv+'\r\n');
console.log(`Model v${MODEL_VERSION}: ${rows.length} outcomes, ${data.needs.length} unchanged scoring groups, ${SPECIALISMS.length} responsibility packages.`);
