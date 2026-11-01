from pathlib import Path
P=Path(__file__).resolve().parent;R=P.parent
def edit(path,changes):
    f=R/path;t=f.read_text()
    for a,b in changes:
        assert a in t,(path,a[:80]);t=t.replace(a,b)
    f.write_text(t)
edit('training-planner/public/app.js',[
 ('MODEL_VERSION,LEVELS','MODEL_VERSION,ACTIVITIES,LEVELS'),
 ('<label>Approved tools used (one per line)', '<h3>Activities that make additional outcomes essential</h3><div class="checkbox-list">${ACTIVITIES.map(a=>`<label><input class="profile-activity" type="checkbox" value="${a.id}" ${(c.profile.activities||[]).includes(a.id)?\'checked\':\'\'}><span>${esc(a.name)}<small>${a.requirement}</small></span></label>`).join(\'\')}</div><label>Approved tools used (one per line)'),
 ('c.profile={level:', 'c.profile={activities:[...document.querySelectorAll(\'.profile-activity:checked\')].map(x=>x.value),level:'),
 ('Original files are unchanged.','Previous catalogue versions are archived.'),
 ('<h1>Foundation. Levels. Roles. Tools.</h1>', '<h1>Foundation. Levels. Roles. Tools.</h1>'),
 ])
edit('training-planner/public/storage.js',[
 ('MODEL_VERSION,SPECIALISMS','MODEL_VERSION,MODEL_REVISION,ACTIVITIES,SPECIALISMS'),
 ('schema:2,modelVersion:MODEL_VERSION,','schema:2,modelVersion:MODEL_VERSION,modelRevision:MODEL_REVISION,'),
 ("if(c.profile.specialisms.some", "if(c.profile.activities!==undefined&&(!strings(c.profile.activities)||c.profile.activities.some(id=>!ACTIVITIES.some(a=>a.id===id))))fail('unknown activity');\n   if(c.profile.specialisms.some"),
 ("if(s.catalogueVersion!==data.version)warnings.push", "if(s.schema===2&&s.modelRevision!==MODEL_REVISION)warnings.push('Must-have applicability was revised. Review automated judges, AI-assisted assurance and identity integration before finalising.');\n if(s.catalogueVersion!==data.version)warnings.push")
 ])
edit('training-planner/public/model-explanation.js',[("The subject is AI-enabled attacks and defence. Basic awareness can serve all staff; N5.7 threat tracking and control adjustment require specialist depth.","Cyber-focused risk awareness for all cyber staff: N5.8 provides the risk overview, N5.4 retains examples of attacks on the bank’s AI, and N5.1 includes deepfake impersonation. N5.7 threat tracking and control adjustment require specialist depth.")])
edit('training-planner/scripts/build_capability_model.mjs',[
 ('MODEL_VERSION,LEVELS','MODEL_VERSION,MODEL_REVISION,RETIRED_OUTCOMES,LEVELS'),
 ('The detailed outcome wording, IDs, must-have flags, original need groups, source references and course assessments are retained. The new names and applicability are a separate overlay.', 'The approved must-have review is recorded in catalogue v11. N5.1 merges social engineering and deepfakes; N5.2 is retired with a crosswalk to N5.1; N5.8 adds a separate cyber risk overview. N5.4 retains its bank-specific attack examples. N6.4 is Accountability and N8 retains Skill terminology. Substantively changed outcomes are reassessed; unchanged outcomes retain their evidence. The 23 need groups retain equal weight.'),
 ('The statements below preserve the assessed source outcomes.', 'The statements below are the current assessed outcomes from catalogue v11.'),
 ('Assessment wording and evidence remain unchanged; the workbook\'s role-number labels follow the current model.', 'Catalogue v11 records the approved revisions and fresh assessments. Retired N5.2 maps to revised N5.1; historical scores remain in the archived catalogue and retired workbook rows. The workbook\'s role-number labels follow the current model.'),
 ('modelVersion:MODEL_VERSION,catalogueVersion:data.version,requirements:rows','modelVersion:MODEL_VERSION,modelRevision:MODEL_REVISION,catalogueVersion:data.version,retiredOutcomes:RETIRED_OUTCOMES,requirements:rows'),
 ("'Must-have','Source sheet'","'Must-have','Essential when','Source sheet'"),
 ('r.description,r.core,r.source.sheet','r.description,r.core,r.coreCondition||\'Always when assigned\',r.source.sheet'),
 ('## Detailed learning needs and outcomes', '''### Essential outcomes and depth

A must-have is essential to achieving the learning objective safely and effectively, at the depth appropriate to the person's work. Foundation learners recognise risks, explain examples and know the precaution or escalation. Practitioners apply precautions, check results and intervene. Builders and relevant specialists design, test and improve controls. N2 agent anatomy and safety components are conceptual at Foundation.

N3 explains AI limitations; N4 provides responsible-use training suitable for any bank employee; N5 provides cyber-focused security risk and threat awareness; N12 provides specialist security design and threat modelling. N5.8 is the overall risk map, N5.4 shows attacks on the bank's AI, and N12.1 develops detailed threat modelling. Deepfakes are a brief impersonation example within N5.1, not a standalone deep-dive objective.

N11.3 is must-have when automated judges are used. R6.1.2 is must-have when assurance itself uses AI. These activities are explicit profile choices in the planner; the outcomes remain available for broader learning. R3.1.3 belongs to multi-agent testing, N14.7 to leadership, and R9.1.2 delegated-token depth to identity integration rather than routine identity operations. The workbook's generic course coverage includes conditional must-haves when assessing the full need; profile planning applies the actual responsibility and activity choices.

The Strong band requires at least 70% coverage and no applicable must-have at zero. A mention can clear that zero gate; it does not demonstrate competence. Outcomes below 3 remain completion gaps. Internal exercises earn no coverage until assessed.

## Detailed learning needs and outcomes'''),
 ('## Crosswalk and compatibility','## Crosswalk and compatibility\n\nRetired outcome **N5.2 — Deepfakes** is merged into **N5.1 — AI-enabled social engineering and impersonation**. Original assessments are historical evidence, not automatically valid scores for the merged outcome.')
 ])
