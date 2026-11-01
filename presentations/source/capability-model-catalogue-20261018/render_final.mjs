import fs from 'node:fs/promises';
import path from 'node:path';
import {GlobalFonts,createCanvas,loadImage} from '@napi-rs/canvas';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='/Users/cyberk/projects/ai-era-training';
const out=path.join(root,'.presentation-build/capability-model-catalogue-20261018/final-previews');
await fs.mkdir(out,{recursive:true});
for(const weight of ['Regular','Bold'])GlobalFonts.registerFromPath(path.join(root,`.presentation-build/capability-model-20261018/assets/IBMPlexSans-${weight}.ttf`));
const deck=await PresentationFile.importPptx(await FileBlob.load(path.join(root,'outputs/.validated-catalogue-v2/Agentic-Era_Workforce_Capability_Model_Briefing.pptx')));
const sheet=createCanvas(1280,2160), ctx=sheet.getContext('2d');
ctx.fillStyle='#DDDDDD';ctx.fillRect(0,0,1280,2160);
for(let i=0;i<deck.slides.items.length;i++){
 const img=await deck.export({slide:deck.slides.items[i],format:'png',scale:1.5});
 const bytes=new Uint8Array(await img.arrayBuffer());
 await fs.writeFile(path.join(out,`slide-${i+1}.png`),bytes);
 ctx.drawImage(await loadImage(bytes),(i%2)*640,Math.floor(i/2)*360,640,360);
}
await fs.writeFile(path.join(out,'contact-sheet.png'),await sheet.encode('png'));
console.log('Rendered all 12 final slides.');
