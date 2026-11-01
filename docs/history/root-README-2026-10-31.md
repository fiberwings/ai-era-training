# AI era training

Cybersecurity workforce capability model, assessed training catalogue, and local training planner for an agentic AI operating model.

## Key files

| File | Purpose |
| --- | --- |
| [Capability model](Agentic-Era_Workforce_Capability_Model.md) | Authoritative model: Foundation, agentic levels, role specialisms and tool training. |
| [Training catalogue v12](AI_Era_Cyber_Training_Catalogue_v12.xlsx) | Current assessed course catalogue and supporting evidence. |
| [Capability crosswalk](Capability_Model_Crosswalk.csv) | Maps the model's 140 active outcomes to the 23 scoring groups. |
| [Standalone planner](training-planner/Training-Planner.html) | Download and open locally in a desktop browser; no server or installation required for planning. |
| [My AI Learning Path](learning-path/index.html) | Self-contained learner app: group recommendations, search, personal commitments, progress, coverage and configurable course feedback. |
| [Learning Path guide](learning-path/README.md) | Build and publish to GitHub Pages, connect Microsoft Forms, and review learner feedback. |
| [2027 training plan v3](analysis/2027-training-plan/2027-Training-Plan-v3.html) | Current annual recommendation and alternatives. Download and open locally. |
| [2027 plan pack](analysis/2027-training-plan/2027-Training-Plan-v3-Pack.zip) | Annual report, scenarios and supporting analysis. |
| [Model briefing](outputs/Agentic-Era_Workforce_Capability_Model_Briefing.pptx) | Presentation explaining the capability model. |
| [Project context](PROJECT_CONTEXT.md) | Business context, decisions and implementation handover. |

The current planner release is **2.0.8 (31 October 2026)**, using catalogue **v12**, capability model **v2 revision 3**, and the retained annual plan **v3**. New component plans start blank, composing Foundation, L1 Entry, L2 Practitioner, L3 Expert, Specialisms and Tooling across 19 audience templates. Detailed path coverage links each outcome to evidence and gap-filling options. Structured course details show learning commitment, access, contextual fit, grouped outcome evidence and assessment sources in both workspaces. Manually added internal training recalculates planned coverage from its linked outcomes, with assessed catalogue coverage shown separately. The original planner styling and complete single-page capability-model explanation are restored in both workspaces. The learner companion continues to use the legacy annual selections with refreshed catalogue evidence. Earlier versions are retained for traceability.

The learner companion is **My AI Learning Path 1.3.1 (31 October 2026)**. It shares the planner's catalog and model and presents four learning layers: Foundation, one L1/L2/L3 level, the model’s nine roles with selected responsibilities, and selected tools. Work targets remain separate from quiz-based starting points. Tool suggestions match intended tasks, and assigned central outcome changes require review. Specialist central options remain available across levels, with source and prerequisite details. Each layer distinguishes central recommendations from tailored options and personal selections. Microsoft Forms is configurable and initially disconnected. The bundled central pathway retains its Draft status.

Catalogue v12 (31 October 2026) reassesses two Anthropic courses using public lessons and exercises. TR-145 is a 3.5h Foundation AI-limitations course with L1 practice (N3 76%, N6 54%). TR-089 is a 4h L1 AI-fluency course with supporting Foundation content (N6 67%); its four core N6 outcomes have full teaching and practice. These aggregate bands remain Partial. Other courses and the 140-outcome rubric are unchanged. Previous static analyses retain their original catalogue snapshots.

## Use and maintain the planner

Read [the planner guide](training-planner/README.md) for workshop use, scenario exports, catalogue refreshes and distribution instructions. Export your scenario JSON to preserve your planning decisions; opening the standalone HTML does not save changes back into that file.

The application source, bundled solver, build scripts and tests are in `training-planner/`. Annual-plan sources, scenario data, reports and verification records are in `analysis/2027-training-plan/`.

For optional local-server mode, run from `training-planner/`:

```sh
python3 server.py
```

Then open <http://127.0.0.1:4173>. Python's standard library is sufficient for the server. See the planner guide for additional requirements when refreshing Excel data or developing the application.
