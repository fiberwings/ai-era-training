import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile,Workbook} from '@oai/artifact-tool';
const mode=process.argv[2],p=new URL('./',import.meta.url);
if(mode==='before'||mode==='after'){
 const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(new URL(`${mode}-view.xlsx`,p).pathname));
 for(const [label,sheetName,range] of [['metadata','Offers','A118:N118'],['review','Offers','R118:Y118'],['fluency','Offers','R66:Y66'],...(mode==='after'?[['scores','Scores','E16252:I16258']]:[])]){
  const blob=await wb.render({sheetName,range,scale:1,format:'png'});
  await fs.writeFile(new URL(`${mode}-${label}.png`,p),new Uint8Array(await blob.arrayBuffer()));
 }
 console.log('Rendered',mode);
}else{
 const edits=JSON.parse(await fs.readFile(new URL('edits.json',p)));
 const wb=Workbook.create(),sheet=wb.worksheets.add('Edits');
 sheet.getRange('A1:C1').values=[['Source sheet','Cell','Typed value']];
 sheet.getRange(`A2:C${edits.length+1}`).values=edits;
 wb.recalculate();
 console.log((await wb.inspect({kind:'table',range:'Edits!A1:C4',include:'values',tableMaxRows:4,tableMaxCols:3,maxChars:1000})).ndjson);
 const out=await SpreadsheetFile.exportXlsx(wb);await out.save(new URL('authored.xlsx',p).pathname);
 console.log('Authored',edits.length,'cell edits');
}
