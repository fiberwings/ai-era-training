import fs from 'node:fs/promises';
import path from 'node:path';
import {GlobalFonts} from '@napi-rs/canvas';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='/Users/cyberk/projects/ai-era-training';
const build=path.join(root,'.presentation-build/capability-model-draft-20261018');
for(const weight of ['Regular','Bold'])GlobalFonts.registerFromPath(path.join(root,`.presentation-build/capability-model-20261018/assets/IBMPlexSans-${weight}.ttf`));
const deck=await PresentationFile.importPptx(await FileBlob.load(path.join(build,'source.pptx')));
for(let i=0;i<deck.slides.items.length;i++){
 const slide=deck.slides.items[i];
 const shape=slide.shapes.add({geometry:'textbox',name:'draft-for-discussion',position:{left:960,top:8,width:280,height:21},fill:'none',line:{fill:'none',width:0}});
 shape.text='DRAFT FOR DISCUSSION';
 shape.text.style={typeface:'IBM Plex Sans',fontSize:16,bold:true,color:[0,5].includes(i)?'#FF6B6B':'#C62828',alignment:'right',verticalAlignment:'top',insets:0,wrap:'none',autoFit:'none'};
}
await (await PresentationFile.exportPptx(deck)).save(path.join(build,'authored.pptx'));
console.log(`Added disclaimer to ${deck.slides.items.length} slides.`);
