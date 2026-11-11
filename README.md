# AI era training

Cybersecurity workforce capability framework, assessed training catalogue, recommended pathways, staff learning app and presentations for an agentic AI operating model.

## Deliverables

| Deliverable | Open | Guide |
| --- | --- | --- |
| Training catalogue | [Workbook](catalogue/AI_Era_Cyber_Training_Catalogue.xlsx) | [Catalogue guide](catalogue/README.md) |
| Capability framework | [Model](capability-framework/Agentic-Era_Workforce_Capability_Model.md) · [CSV crosswalk](capability-framework/Capability_Model_Crosswalk.csv) · [Learning needs and outcomes (Word)](capability-framework/Learning_Needs_and_Outcomes.docx) | [Framework guide](capability-framework/README.md) |
| Recommended training pathways | [Pathways guide](recommended-pathways/Recommended-Training-Pathways.md) · [Scenario JSON](recommended-pathways/Recommended-Training-Pathways.json) | [Pathway guide](recommended-pathways/README.md) |
| Staff learning app | [AI Cybersecurity Learning](learning-path/index.html) | [App guide](learning-path/README.md) |
| Pathway builder | [Training Planner](training-planner/Training-Planner.html) | [Builder guide](training-planner/README.md) |
| Presentations | [Workforce preparation pack](presentations/AI-Era_Cyber-Workforce_Preparation.pptx) · [Model briefing](presentations/Agentic-Era_Workforce_Capability_Model_Briefing.pptx) · [Capability needs](presentations/AI-era-cyber-capability-needs.pptx) · [2027 next steps](presentations/AI-Era_2027_Next-Steps_Group-CISO_Walkthrough.pptx) | [Presentation guide](presentations/README.md) |

Both apps are single HTML files that open in a desktop browser with no server. Current versions and status are at the top of [the changelog](docs/CHANGELOG.md).

## How it fits together

```
Catalogue workbook ──► catalogue.json ──┬──► framework documents (model, CSV, Word)
Framework modules (planner/public) ─────┤
Recommended-Training-Pathways.json ─────┴──► pathways guide + coverage ──► learning-path/index.html
```

After editing the workbook, one command validates it, rebuilds everything and runs the tests:

```sh
node catalogue/scripts/rebuild.mjs catalogue/AI_Era_Cyber_Training_Catalogue.xlsx
```

## More

- [AGENTS.md](AGENTS.md): sources of truth, rules and build/test commands.
- [Decisions](docs/DECISIONS.md) and [changelog](docs/CHANGELOG.md).
- Earlier workbooks, release ZIPs, snapshot history and archived reports are in Git at tag `pre-simplification`.
