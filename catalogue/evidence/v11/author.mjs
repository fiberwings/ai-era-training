import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile,Workbook} from '@oai/artifact-tool';
const mode=process.argv[2];
if(mode==='before'||mode==='after'){
 const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(new URL(`${mode}-view.xlsx`,import.meta.url).pathname));
 for(const [label,range] of mode==='before'?[['risk','A26:H32']]:[['risk','A26:H32'],['overview','A142:H142'],['method','A101:H103']]){
  const blob=await wb.render({sheetName:'Rubric',range,scale:1.2,format:'png'});
  await fs.writeFile(new URL(`${mode}-${label}.png`,import.meta.url),new Uint8Array(await blob.arrayBuffer()));
 }
 console.log('Rendered',mode);process.exit(0);
}
const edits=JSON.parse(await fs.readFile(new URL('edits.json',import.meta.url)));
const wb=Workbook.create();const sheet=wb.worksheets.add('Edits');
sheet.getRange('A1:C1').values=[['Source sheet','Cell','Typed value']];
sheet.getRange(`A2:C${edits.length+1}`).values=edits;
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:'Edits!A1:C5',include:'values',tableMaxRows:5,tableMaxCols:3,maxChars:1000})).ndjson);
const out=await SpreadsheetFile.exportXlsx(wb);await out.save(new URL('authored.xlsx',import.meta.url).pathname);
console.log('Authored',edits.length,'cell changes with artifact-tool');
