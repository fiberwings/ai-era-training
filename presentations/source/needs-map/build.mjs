import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='/Users/cyberk/projects/ai-era-training';
const build=path.join(root,'.presentation-build/needs-map');
const skill='/Users/cyberk/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const pres=Presentation.create({slideSize:{width:2400,height:1350}});
const layouts=JSON.parse(await fs.readFile(path.join(build,'layout.json'),'utf8'));
for(const [i,layout] of layouts.entries()){
  const slide=pres.slides.add();slide.background.fill='#FFFFFF';
  for(const [j,t] of layout.shapes.entries()){
    const shape=slide.shapes.add({geometry:'textbox',name:`s${i+1}-text-${j}`,position:{left:t.x,top:t.y,width:t.w,height:t.h},fill:'none',line:{fill:'none',width:0}});
    shape.text=t.text;
    shape.text.style={typeface:'Arial',fontSize:t.size,bold:t.bold,color:t.color,insets:0,autoFit:'none',wrap:'none',verticalAlignment:'top',lineSpacing:1.05};
  }
  slide.speakerNotes.text=layout.notes;
}
const candidate=path.join(build,'candidate.pptx');
await (await PresentationFile.exportPptx(pres)).save(candidate);
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const finalPath=path.join(root,'outputs/AI-era-cyber-capability-needs.pptx');
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath,
 pythonExecutable:'/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','22860000,12858750','--validate-bullet-geometry','--validate-heading-fit'],
 explicitTotalSlideCount:2,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
 fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,
 receiptPath:path.join(build,'validation.json')});
console.log(JSON.stringify(result));
for(const [i,slide] of pres.slides.items.entries()){
 const blob=await pres.export({slide,format:'png',scale:1});
 await fs.writeFile(path.join(build,`slide-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));
}
