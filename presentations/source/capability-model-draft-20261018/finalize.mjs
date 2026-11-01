import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {finalizePresentation} from '/Users/cyberk/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.11052/skills/presentations/container_tools/artifact_tool_utils.mjs';

const root='/Users/cyberk/projects/ai-era-training';
const build=path.join(root,'.presentation-build/capability-model-draft-20261018');
const skill='/Users/cyberk/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.11052/skills/presentations';
const reference=path.join(build,'source.pptx');
const finalPath=path.join(root,'outputs/.validated-draft/Agentic-Era_Workforce_Capability_Model_Briefing.pptx');
await fs.mkdir(path.dirname(finalPath),{recursive:true});
const result=await finalizePresentation({
 workspaceDir:root,
 candidatePath:path.join(build,'candidate.pptx'),finalPath,
 explicitTotalSlideCount:10,
 requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
 pythonExecutable:'/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
 fontPolicy:{basis:'reference',families:['IBM Plex Sans'],referencePath:reference,referenceSha256:createHash('sha256').update(await fs.readFile(reference)).digest('hex')},
 verifyArtifactToolImport:true,
 receiptPath:path.join(build,'validation.json')
});
console.log(JSON.stringify(result,null,2));
