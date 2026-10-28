# AI era training

Cybersecurity workforce capability model, assessed training catalogue, and local training planner for an agentic AI operating model.

## Key files

| File | Purpose |
| --- | --- |
| [Capability model](Agentic-Era_Workforce_Capability_Model.md) | Authoritative model: Foundation, agentic levels, role specialisms and tool training. |
| [Training catalogue v11](AI_Era_Cyber_Training_Catalogue_v11.xlsx) | Current assessed course catalogue and supporting evidence. |
| [Capability crosswalk](Capability_Model_Crosswalk.csv) | Maps the model's 140 active outcomes to the 23 scoring groups. |
| [Standalone planner](training-planner/Training-Planner.html) | Download and open locally in a desktop browser; no server or installation required for planning. |
| [2027 training plan v3](analysis/2027-training-plan/2027-Training-Plan-v3.html) | Current annual recommendation and alternatives. Download and open locally. |
| [2027 plan pack](analysis/2027-training-plan/2027-Training-Plan-v3-Pack.zip) | Annual report, scenarios and supporting analysis. |
| [Model briefing](outputs/Agentic-Era_Workforce_Capability_Model_Briefing.pptx) | Presentation explaining the capability model. |
| [Project context](PROJECT_CONTEXT.md) | Business context, decisions and implementation handover. |

The current planner release is **1.1.1 (18 October 2026)**, using catalogue **v11**, capability model **v2 revision 3**, and annual plan **v3**. Earlier versions are retained for traceability.

## Use and maintain the planner

Read [the planner guide](training-planner/README.md) for workshop use, scenario exports, catalogue refreshes and distribution instructions. Export your scenario JSON to preserve your planning decisions; opening the standalone HTML does not save changes back into that file.

The application source, bundled solver, build scripts and tests are in `training-planner/`. Annual-plan sources, scenario data, reports and verification records are in `analysis/2027-training-plan/`.

For optional local-server mode, run from `training-planner/`:

```sh
python3 server.py
```

Then open <http://127.0.0.1:4173>. Python's standard library is sufficient for the server. See the planner guide for additional requirements when refreshing Excel data or developing the application.
