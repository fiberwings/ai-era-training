import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile,Workbook} from '@oai/artifact-tool';
const root=process.cwd(),p=root+'/catalogue/evidence/v13/',w=root+'/.work/catalogue/v13/',mode=process.argv[2];
if(mode==='before'||mode==='after'){
 const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(w+mode+'-view.xlsx'));
 for(const [label,range] of [['isc2','R15:Y16'],...(mode==='after'?[['secai','R413:Y413']]:[])]){
  const image=await wb.render({sheetName:'Offers',range,scale:1,format:'png'});
  await fs.writeFile(w+mode+'-'+label+'.png',new Uint8Array(await image.arrayBuffer()));
 }
 console.log('Rendered '+mode);
}else if(mode==='edit'){
 const rows=JSON.parse(await fs.readFile(p+'edits.json','utf8'));
 const wb=Workbook.create(),sh=wb.worksheets.add('Edits');
 sh.getRange('A1:C1').values=[['Source sheet','Cell','Typed value']];sh.getRange(`A2:C${rows.length+1}`).values=rows;
 wb.recalculate();
 console.log((await wb.inspect({kind:'table',range:'Edits!A1:C4',include:'values',tableMaxRows:4,tableMaxCols:3,maxChars:800})).ndjson);
 await (await SpreadsheetFile.exportXlsx(wb)).save(w+'authored.xlsx');
 console.log('Authored '+rows.length+' edits.');
}else if(mode==='calculate'){
 const d=JSON.parse(await fs.readFile(w+'calc-inputs.json','utf8'));
 const wb=Workbook.create();for(const name of ['Inputs','Rubric','Coverage','Needs','Results'])wb.worksheets.add(name);
 const sh=name=>wb.worksheets.getItem(name);
 sh('Inputs').getRange(`A2:F${d.inputs.length+1}`).values=d.inputs;
 sh('Rubric').getRange(`A2:F${d.rubric.length+1}`).values=d.rubric;
 sh('Rubric').getRange(`G2:I${d.rubric.length+1}`).formulas=d.rubricFormulas;
 sh('Coverage').getRange(`A2:E${d.coverage.length+1}`).values=d.coverage;
 sh('Coverage').getRange(`F2:K${d.coverage.length+1}`).formulas=d.coverageFormulas;
 sh('Needs').getRange(`A2:C${d.needs.length+1}`).values=d.needs;
 sh('Needs').getRange(`D2:G${d.needs.length+1}`).formulas=d.needFormulas;
 sh('Results').getRange(`A2:B${d.results.length+1}`).values=d.results.map(r=>r.slice(0,2));
 for(let i=0;i<d.results.length;i++){
  const v=d.results[i][2],r=sh('Results').getRange('C'+(i+2));
  if(typeof v==='string'&&v.startsWith('='))r.formulas=[[v]];else r.values=[[v]];
 }
 wb.recalculate();
 if(d.inputs[0][0]!=='TR-014'||d.inputs[0][1]!=='N1.1')throw Error('Unexpected recalculation probe input');
 const before=sh('Coverage').getRange('H2').values[0][0],prior=sh('Inputs').getRange('F2').values[0][0];
 sh('Inputs').getRange('F2').values=[[0]];wb.recalculate();
 if(Math.abs(before-sh('Coverage').getRange('H2').values[0][0]-prior/9)>1e-10||sh('Coverage').getRange('I2').values[0][0]!==1)throw Error('Recalculation probe failed');
 sh('Inputs').getRange('F2').values=[[prior]];wb.recalculate();
 if(Math.abs(before-sh('Coverage').getRange('H2').values[0][0])>1e-10)throw Error('Probe restoration failed');
 console.log('Score-change, coverage and must-have-gap recalculation verified; original inputs restored.');
 console.log((await wb.inspect({kind:'table',range:'Coverage!A2:K5',include:'values',tableMaxRows:4,tableMaxCols:11,maxChars:1500})).ndjson);
 console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:10},maxChars:1500})).ndjson);
 const values=sh('Results').getRange(`C2:C${d.results.length+1}`).values;
 const result=d.results.map((r,i)=>[r[0],r[1],values[i][0]]);
 if(result.some(r=>r[2]===null||r[2]===undefined||String(r[2]).startsWith('#')))throw Error('Invalid calculated cache result');
 await fs.writeFile(w+'calculated-caches.json',JSON.stringify(result));
 await (await SpreadsheetFile.exportXlsx(wb)).save(w+'calculated.xlsx');console.log('Calculated '+result.length+' results.');
}
