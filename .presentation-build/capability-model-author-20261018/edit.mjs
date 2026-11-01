import fs from 'node:fs/promises';
import path from 'node:path';
import {GlobalFonts} from '@napi-rs/canvas';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='/Users/cyberk/projects/ai-era-training';
const build=path.join(root,'.presentation-build/capability-model-author-20261018');
for(const weight of ['Regular','Bold'])GlobalFonts.registerFromPath(path.join(root,`.presentation-build/capability-model-20261018/assets/IBMPlexSans-${weight}.ttf`));
const deck=await PresentationFile.importPptx(await FileBlob.load(path.join(build,'source.pptx')));
const slide=deck.slides.items[0];
for(const spec of [
 {name:'prepared-by',text:'Prepared by Marco Ceci - GBIS ASIA CISO',left:72,width:680,alignment:'left'},
 {name:'version-date',text:'Version 1, 18 October 2026',left:820,width:300,alignment:'right'}
]){
 const shape=slide.shapes.add({geometry:'textbox',name:spec.name,position:{left:spec.left,top:674,width:spec.width,height:24},fill:'none',line:{fill:'none',width:0}});
 shape.text=spec.text;
 shape.text.style={typeface:'IBM Plex Sans',fontSize:17,color:'#B4C2CD',alignment:spec.alignment,verticalAlignment:'top',insets:0,wrap:'none',autoFit:'none'};
}
await (await PresentationFile.exportPptx(deck)).save(path.join(build,'authored.pptx'));
console.log('Added author credit, version and date to slide 1.');
