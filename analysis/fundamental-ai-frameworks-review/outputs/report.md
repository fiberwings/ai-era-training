# Fundamental AI frameworks and original publisher material

**Review proposal · 2 November 2026**

Promote a small set of original publisher references as named central recommendations, with depth matched to the capability component. The strongest additions are **OWASP LLM Top 10 in Foundation, MITRE ATLAS for threat intelligence and security testing, NIST AI RMF for governance, joint agency guidance for agent supervision, and secure AI development guidance for builders**. NIST’s adversarial machine learning taxonomy and the UK AI security code add specialist depth. Two further candidates merit catalogue assessment: **CSA AI Controls Matrix and MAESTRO**.

The proposal contains eight decisions on existing catalogue resources. It preserves existing courses and internal learning, and distinguishes additions from resources already selected. **This review has not changed the catalogue, capability model, recommended pathways or apps.** The baseline is catalogue v16, snapshot `9ed4551ae565417e`, model 2 revision 3 and Recommended Training Pathways v0.2.

## Why promote these resources

Original publisher material gives staff a shared vocabulary for recognising risks, analysing attacks, setting controls and explaining decisions. A course can teach a framework well, but direct familiarity with its maintained source also helps staff interpret updates and check a supplier’s claims. This is a reason to recommend some references even where their saved assessment does not increase a pathway’s coverage score.

The selection favours material that is maintained by its originating organisation or project, applies across tools, addresses a recurring cybersecurity responsibility, and gives staff something concrete to use. “Fundamental” can mean essential to a specialism. It does not mean every employee should read every framework. Here, OWASP Top 10 means the **LLM and Agentic Applications** publications; the general web application Top 10 remains part of existing cyber craft.

Most candidates are guidance, taxonomies or reference libraries. They should be described as **recommended reading or reference material**, rather than presented as practical courses. Topic fit below is a curriculum recommendation; numerical evidence continues to come only from the saved catalogue assessments.

## Eight proposed recommendation decisions

| Decision and source | Placement and audience | Why it belongs there | Current position and proposed action |
| --- | --- | --- | --- |
| **A1 · TR-109** — [OWASP LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/). Catalogue reading time: **2h**. | **Foundation**, inherited once by all levels. Main outcomes: N3.5 prompt injection, N5.4 attacks on AI and N5.8 AI security risk overview. | Establishes common language for LLM risks and mitigations. Staff should recognise the risks and know where to look up the detail. | Not currently selected. **Add to Foundation**, subject to review of this extension to the Reviewed bundle. Keep TR-281, TR-145 and the one-hour AI use cases brief. |
| **A2 · TR-110** — [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/). **2h**. | **L2 Practitioner**, including coached L2; inherited by L3. Also relevant specialisms at any level: AI security, testing, exposure, architecture and IAM operations. N7.1, N7.2, N7.4 and N8.4–N8.5; specialist N12 and R-coded controls. | Adds risks created when AI takes actions, including tool misuse, privilege abuse and agent interactions. Gives supervisors a risk vocabulary for delegation and intervention. | Already selected in both L2 variants. **Retain and make accessible through the relevant specialisms**, so an L1 IAM specialist is not required to become L2 to receive it. Deduplicate the same course across an audience’s components. |
| **A3 · TR-117** — [MITRE ATLAS](https://atlas.mitre.org/), with [MITRE’s release record](https://github.com/mitre-atlas/atlas-data/releases). **Varies; unknown**. | Primary: **Threat intelligence & detection — AI threat landscape**. Also **Agent testing and containment** and **AI security design and remediation**, including their variants. Reference for incident responders. | Gives analysts and testers a common way to describe adversary behaviour and relate cases to threats and mitigations. Use a case to connect a technique, an exposed asset and a defensive response. | Not selected. **Promote after version and time review**. Catalogue title is v2026.08; MITRE lists v2026.10. The saved N5.7 score is **0**, so adding it does not close the threat-tracking outcome. Existing TR-063 and internal learning remain. |
| **A4 · TR-118** — [NIST AI RMF 1.0](https://www.nist.gov/itl/ai-risk-management-framework), Playbook and [GenAI Profile AI 600-1](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence). **4h+; unknown**. | **AI governance and risk**, including the assurance pathway variant. Main fit: N13.1–N13.4 and N13.6. Leaders and vendor evaluators can use relevant sections as references. | Supplies the governance structure behind inventories, risk decisions, measurement, treatment and supplier challenge. The GenAI Profile makes the general framework more specific to generative AI. | Not selected. **Add the full catalogue bundle to the two governance components** after agreeing learner time. Preserve INT-397. A short leadership extract must not inherit the full bundle’s coverage. |
| **A5 · TR-122** — [Careful adoption of agentic AI services](https://www.cyber.gov.au/publication/careful-adoption-of-agentic-ai-services), authored jointly by ASD ACSC, CISA, NSA and Canadian, New Zealand and UK agencies. **1–2h; budget 2h**. | **L2**, both variants; **Leadership and accountability**, **Agent security architecture**, **Agent assurance** and the **IAM integration** route. N7.1–N7.2, N7.4, N13.3, N14.3, N14.7 and relevant identity/control outcomes. | Connects agent risks to oversight, privileges, monitoring and bounded deployment. Its scope explicitly urges low-risk, non-sensitive use; it cannot serve as permission for more sensitive operations. | Already selected for forensics and IAM operations. **Retain and extend** to supervisors, accountable leaders and control owners. Include the separate IAM integration variant, which currently lacks it. |
| **A6 · TR-123** — [NCSC and CISA Guidelines for secure AI system development](https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development). **1h**. | **L3**, including coached/no-code builders; also **AI security design and remediation** and its architecture variant at any level. Specialist fit: N12.3, N12.6, N12.7 and N13.4. | A concise lifecycle reference for secure design, development, deployment and operation. Useful for builders using APIs or configured platforms as well as custom code. | Not selected. **Add as secure-development orientation**. The saved record has **zero credit against shared L3 outcomes**, including N10.8. Do not portray this addition as completing safe deployment or evaluation training. |
| **A7 · TR-119** — [NIST AI 100-2 E2025 Adversarial Machine Learning Taxonomy](https://csrc.nist.gov/pubs/ai/100/2/e2025/final). **3h+; unknown**. | **Advanced agent red-teaming**. Optional technical reference for threat intelligence and AI security design. N12.5, N12.7, R3.1.3–R3.1.5; limited N5.7 evidence. | Gives technical specialists precise attack and mitigation terminology, including poisoning, evasion and privacy-related attacks. Complements the operational cases in ATLAS. | Not selected. **Add for advanced red-team specialists**, subject to a realistic reading-time estimate. Avoid requiring the research-grade document in Foundation. |
| **A8 · TR-124** — [UK AI Cyber Security Code of Practice and implementation guide](https://www.gov.uk/government/publications/ai-cyber-security-code-of-practice/code-of-practice-for-the-cyber-security-of-ai). **2–3h; budget 3h**. | **Agent assurance** as a broader AI lifecycle reference. Secondary reference for governance and architecture. N13.1–N13.6 and N12.6–N12.8, where applicable. | Gives assurance staff a lifecycle baseline against which to structure evidence requests. The UK code is voluntary; applicability to the organisation must be established separately. | Not selected. **Add the assessed code/guide to assurance**. It has **zero saved score for R6.1.1–R6.1.2**. The title also names ETSI EN 304 223; separate that published standard from the UK guide before treating it as assessed teaching. |

All eight records are active and marked Free in catalogue v16. Their durations are catalogue planning values, not publisher promises or measured completion times. Unknown and open-ended durations remain unknown.

## Material to recommend more selectively

These resources deserve visibility, but adding all of them as required reading would repeat content and increase learner time without a clear benefit.

| Resource | Best placement | Recommendation |
| --- | --- | --- |
| **TR-114 OWASP GenAI Red Teaming Guide** and **TR-115 OWASP AI Testing Guide v1** | Agent testing and containment; advanced red-teaming; testing references for agent assurance | Keep TR-114’s existing selection. Offer TR-115 as a test-reference library before deciding on a full **3h+** assignment. OWASP’s [testing guide](https://owasp.github.io/www-project-ai-testing-guide/) covers application, model, infrastructure and data layers. A new [Red Teaming Manual dated 20 October 2026](https://genai.owasp.org/resource/genai-red-teaming-manual-version-1-0/) warrants a separate comparison with TR-114; do not silently substitute its eight-phase method for the assessed [2025 guide](https://genai.owasp.org/resource/genai-red-teaming-guide/). |
| **TR-070 Google SAIF and Risk Map** | AI security design and remediation; Agent security architecture | Promote as an optional visual design aid, **1–2h**. [Google’s source](https://saif.google/) combines risks, controls and an agent self-assessment. It is a useful original framework from a vendor, with transferable content; it does not need to be assigned to every learner. |
| **TR-111 OWASP Agentic AI Threats & Mitigations** | AI security design and remediation; Agent security architecture | Retain as optional depth after the Agentic Top 10. The saved catalogue describes a reference architecture and threat-model examples. Compare it with MAESTRO before requiring both full readings. |
| **TR-112 OWASP Agent Control Standard** | Agent security architecture; Agent assurance | Preserve both existing selections, but describe it as an **emerging specification and implementation example**. The [project repository](https://github.com/GenAI-Security-Project/agent-control-standard) identifies v0.1.0 limitations, including unauthenticated reference-implementation traffic and a fail-open default. It should not be the sole basis for teaching production controls. |
| **TR-132 CSA Agentic AI Red Teaming Guide** | Advanced agent red-teaming | Preserve the selection while checking full-resource access and content. The [publisher page](https://cloudsecurityalliance.org/artifacts/agentic-ai-red-teaming-guide) describes agent-specific testing; download currently requires login. Saved catalogue evidence explicitly says the full PDF was not read. Do not upgrade that evidence through this report. |
| **TR-133 CSA Levels of Autonomy** | AI governance and risk; Leadership and accountability | Preserve the existing discussion reference. Its catalogue evidence labels it a proposal rather than an established standard. Its **L0–L5 autonomy levels must remain distinct from workforce L1–L3 capabilities**. Use A5 as the broader agency guidance. |
| **TR-168 OWASP Agentic Skills Top 10** | Agent infrastructure; reusable instructions and connectors; exposure management | Offer a targeted reference for people publishing or vetting Skills. The [OWASP project](https://owasp.org/projects/agentic-skills-top-10) focuses on Skills risks and maps them to MAESTRO. The saved record identifies draft/incubator status; verify the exact edition before elevating it to a common requirement. |

## Additional original frameworks to assess

The following two resources are not standalone active catalogue records. Mentions of them inside existing courses or descriptions do not give the original publications their own assessment credit.

**CSA AI Controls Matrix v1.1 and AI-CAIQ** is the strongest next addition for governance and assurance. CSA’s [22 June 2026 release](https://cloudsecurityalliance.org/artifacts/ai-controls-matrix-v1-1) contains 247 control objectives across 18 domains, implementation and auditing guidance, and questions for self-assessment and supplier evaluation. Assess a defined learning package for **AI governance and risk** and **Agent assurance**, with selected references for **Vendor evaluation and tool selection** and **Agent security architecture**. Candidate outcomes include N13.1, N13.2, N13.4, N13.6 and R6.1.1. These are proposed mappings, not scores. Start with the [AI Customer guidance](https://cloudsecurityalliance.org/artifacts/aicmv1-1-implementation-guidelines-for-ai-customers-aic) where the organisation consumes AI services; select provider guidance only for responsibilities it actually performs. Obtain the complete download and agree learning time before assignment.

**MAESTRO**, created by Ken Huang and published through CSA, is the strongest next addition for agent threat modelling. The [author’s original article](https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro) and [CSA project hub](https://labs.cloudsecurityalliance.org/maestro/) describe a layered method for identifying threats within and across agent components. Assess it for **AI security design and remediation** and **Agent security architecture**, particularly N12.1, N12.9 and R5.1.6, with advanced red-team use as a secondary fit. Treat it as a practitioner method, not a mandatory standard. Compare its teaching value with TR-111; a single applied threat-model exercise may be more useful than assigning both references end to end. Its catalogue duration and assessment remain unset.

Other material has a narrower purpose. [ISO/IEC 42001](https://www.iso.org/standard/42001) and [ISO/IEC 23894](https://www.iso.org/standard/77304.html) belong with governance and assurance where formal management systems or standards alignment are required. The original standards require licensed access; PECB and Udemy courses about them are not publications by ISO/IEC. **TR-121 NICE** and **TR-134 SFIA** are better references for workforce planners than required learner reading. **TR-120 NIST Cyber AI Profile** belongs on a governance/leadership watchlist: the [project page](https://www.nccoe.nist.gov/projects/cyber-ai-profile) redirects to “Cyber SI Profile” and still links IR 8596 as an initial public draft under comment review. Reconcile that naming and status before promotion. OWASP workshop collections such as **TR-160** need a named recording, scope and duration before assignment.

Existing exclusions remain intact, including TR-127, TR-229 and the recorded ANSSI/Singapore guidance exclusions. Product and protocol documentation should continue to follow actual tool access and responsibilities in the tool-training layer.

## Placement within the existing components

The following is the precise proposed addition list. Existing selections are retained. The entries are component IDs from the saved scenario, so the proposal can be reviewed without inventing a new framework structure.

| Decision | Course | Add to these existing components |
| --- | --- | --- |
| A1 | TR-109 | `foundation` |
| A2 | TR-110 | `specialism-ai-security`; `specialism-ai-security-architecture`; `specialism-agent-testing`; `specialism-agent-testing-redteam`; `specialism-exposure-management`; `specialism-agent-architecture`; `specialism-identity-operations`; `specialism-identity-operations-integration` |
| A3 | TR-117 | `specialism-threat-intelligence`; `specialism-agent-testing`; `specialism-agent-testing-redteam`; `specialism-ai-security`; `specialism-ai-security-architecture` |
| A4 | TR-118 | `specialism-ai-governance`; `specialism-ai-governance-assurance` |
| A5 | TR-122 | `l2`; `l2-coached`; `specialism-leadership`; `specialism-agent-architecture`; `specialism-agent-assurance`; `specialism-identity-operations-integration` |
| A6 | TR-123 | `l3`; `l3-coached`; `specialism-ai-security`; `specialism-ai-security-architecture` |
| A7 | TR-119 | `specialism-advanced-redteam` |
| A8 | TR-124 | `specialism-agent-assurance` |

Keep the existing variant structure. In particular, updating the ordinary AI governance or AI security component alone would miss the assurance or architecture branch. Shared resources can be assigned to more than one applicable component, but each audience must receive one completion record and one time allowance per course ID. Specialist reading applies according to responsibility, independently of agentic level.

## Effect on learner time and coverage

Adding A1 makes the shared **Foundation/L1 commitment 12h 41m**, up from 10h 41m, before tool training. That includes the existing one-hour **Proposed** AI use cases brief. This is an explicit extension to the previously Reviewed choice, not a restatement of an approved requirement.

The table models A1–A8 against the saved v16 assessments and the existing scenario, without publishing any selections. Range durations use their upper bounds; shared courses and internal activities are counted once. New CSA candidates and optional references are excluded. A3 uses the saved ATLAS assessment for illustration; its updated edition still needs review.

| Shared pathway | Current planned time | Proposed planned time | Change | Assessed coverage before → after |
| --- | --- | --- | --- | --- |
| Foundation pathway | 10h 41m | 12h 41m | +2h | 61.0% → 65.1% |
| L1 Entry pathway | 10h 41m | 12h 41m | +2h | 62.6% → 66.0% |
| L2 Practitioner pathway | 25h 36m | 29h 36m | +4h | 62.6% → 63.2% |
| L3 Expert pathway | 49h 35m | 54h 35m | +5h | 60.8% → 61.3% |
| L2 Practitioner — coached evaluation pathway | 26h | 30h | +4h | 58.2% → 58.7% |
| L3 Expert — coached no-code build pathway | 42h | 47h | +5h | 52.7% → 53.1% |

Representative specialist paths show why a programme-wide fixed total would be misleading:

| Existing audience path | Added known time | Additional unknown readings | Newly assigned course IDs |
| --- | --- | --- | --- |
| GRC — agent supervision | +4h | TR-118 | TR-109, TR-122, TR-118 |
| Governance & assurance | +7h | TR-118 | TR-109, TR-122, TR-118, TR-124 |
| Threat intelligence & detection — AI threat landscape | +4h | TR-117 | TR-109, TR-122, TR-117 |
| Advanced agent red-teaming | +4h | TR-117, TR-119 | TR-109, TR-122, TR-117, TR-119 |
| Agent security architecture | +5h | TR-117 | TR-109, TR-122, TR-123, TR-117 |
| Agent forensics and investigation | +2h | None | TR-109 |
| Agent identity integration and design | +6h | None | TR-109, TR-110, TR-122 |

“Known hours” are a subtotal whenever an unknown resource is listed. **TR-117 Varies, TR-118 4h+ and TR-119 3h+ must not be treated as zero hours or as fixed 4h/3h courses.** The full course/resource duration rule still applies. If a short extract is preferred, define its scope as a separate internal teaching brief, with its own time, Proposed delivery status and outcome rationale; it does not inherit the full resource’s assessed scores.

There is useful incremental evidence in A1: saved best scores improve for **N2.4 (1→2), N3.5 (2→3), N5.4 (2→3) and N5.8 (2→3)**. The other principal placements are often justified by common reference knowledge rather than a higher score. NIST AI RMF adds no higher scores than the existing courses in the ordinary governance component. ATLAS has zero saved N5.7 credit, and the UK code has zero saved R6.1 credit. Preserve those results and reassess only against explicit new evidence. Coverage continues to mean curriculum evidence, not measured competence or permission to operate agents.

## Turn reference knowledge into useful practice

Use the existing internal exercises where their scope permits, with subject owners reviewing any additions. Examples below are proposed teaching changes, not new ready-to-deliver modules or automatic assessment credit.

| Audience | Suggested use of the original material | Evidence a learner could produce |
| --- | --- | --- |
| Foundation | Discuss one familiar AI use case using OWASP LLM risks. | A short explanation of a risk, a safe response and when to escalate. |
| L2 supervisors | Apply the Agentic Top 10 and joint agency guidance to an approved workflow. | A delegation boundary, approval point, monitoring check and stop/escalation decision. |
| Threat intelligence and testers | Map a documented case to ATLAS and choose a defensible detection or test hypothesis. | A cited technique mapping, expected evidence and stated limits. |
| GRC and assurance | Work through an AI risk decision using NIST; later pilot a small relevant set of AICM controls. | A risk record, treatment owner, evidence request and unresolved control gap. |
| Builders and architects | Review lifecycle responsibilities using NCSC guidance; later pilot MAESTRO on one agent design. | A threat model, control allocation and release/rollback evidence. |

Do not compress the existing AI use cases hour to absorb extra teaching by assumption. Agree any revised scope and learner time with its owner. General AI test guidance does not replace domain evaluation, and reference reading does not replace bank-specific IAM, incident-response or recovery drills.

## Source checks that affect implementation

| Item | Verified finding and required treatment |
| --- | --- |
| OWASP LLM edition | The direct [2026 release page](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) and linked 122-page PDF support TR-109’s edition. The [general index](https://genai.owasp.org/llm-top-10/) still shows 2025. Use the specific release link; there is no basis here to downgrade the catalogue title. |
| ATLAS edition and future ATT&CK relationship | [MITRE’s releases](https://github.com/mitre-atlas/atlas-data/releases) list v2026.10, newer than the catalogue title. MITRE’s [27 October announcement](https://www.mitre.org/news-insights/news-release/mitre-attck-enterprise-add-ai-platform) says an ATT&CK AI platform is planned for early 2027 and that ATLAS remains a maintained resource. Refresh the exact record; do not replace it with an unreleased platform. |
| NIST AI RMF | NIST says [AI RMF 1.0 is being revised](https://www.nist.gov/itl/ai-risk-management-framework). Continue to name the published edition and its GenAI Profile. A revision in progress does not itself retire the existing resource. |
| UK code and ETSI | [ETSI EN 304 223 V2.1.1](https://www.etsi.org/deliver/etsi_en/304200_304299/304223/02.01.01_60/en_304223v020101p.pdf) is a published standard, dated December 2025; [ETSI announced it in January 2026](https://www.etsi.org/newsroom/press-releases/2627-etsi-releases-world-leading-standard-for-securing-ai/). TR-124’s saved description assesses the UK code and guide. Clarify the resource boundary and assess additional standard content before claiming its credit. |
| Emerging and access-limited material | Keep ACS’s implementation limits, the Skills Top 10 edition status, the CSA red-team download requirement and the NIST draft status visible beside the relevant recommendation. Original authorship alone does not settle maturity or instructional completeness. |
| Workspace baseline | The workspace switched to v15/pathways v0.1 during this review. This report preserves the original v16/v0.2 baseline from Git checkpoint `cefd60f`. Component and audience selections are identical between the two pathway editions. Reconcile the intended release baseline before implementation. |

## Decisions for review

1. **Approve or amend A1–A8**, especially the extra two hours in Foundation. The preferred approach is named central reading, retained alongside current courses and practice.
2. **Confirm the unknown-time assignments** for ATLAS, NIST AI RMF and NIST AML. Approve the material in principle now if useful, then agree the full learning scope/time and edition evidence before publication.
3. **Choose whether to assess CSA AICM and MAESTRO next.** They are candidates for new catalogue records, not immediate scored selections.
4. **Keep supplementary material selective.** Preserve existing selections while reviewing the specific access, edition and evidence issues above. Do not replace practical courses merely because their topic overlaps a framework.

After decisions are agreed, reconcile any catalogue updates first, then make a separately versioned pathway update using the existing IDs and variants. Record review status only for the decisions actually reviewed. Regenerate the guide, briefs and coverage together, and publish to the learner app only as authorised. Preserve personal plans, progress, feedback, exclusions, historical packages and the distinction between selection review and delivery readiness.

## Evidence and reproducibility

The workbook check validated **516 active resources**, **56,140 numerical scores**, **280 explicitly unassessed rows** and **9,591 coverage rows**, with zero course changes against the current imported snapshot. The comparison uses the workbook-derived snapshot and a frozen copy of the pathway decision source. It does not rescore resources from publisher marketing pages.

The linked publisher pages were checked on 2 November 2026. New-source review used the original publisher descriptions and available substantive pages; the complete CSA download packages and paid ISO texts were not reviewed. Proposed mappings for new resources therefore remain unassessed. The [catalogue evidence extract](catalogue-evidence.json) includes record locations, saved positive scores, original evidence and current assignments; the [impact record](impact.json) contains deduplicated time and saved-score comparisons for all 26 audience paths. The [analysis guide](../README.md) records the baseline identities and rebuild command.
