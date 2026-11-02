import fs from 'node:fs/promises';
import {Workbook,SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const root=process.cwd(),work=root+'/.work/catalogue/v16/',mode=process.argv[2];
if(mode==='before'||mode==='after'){
 const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(work+mode+'-view.xlsx'));
 const ranges=mode==='before'?[['offers','Offers','A361:D363'],['readme','README','A1:D4']]:[['offers','Offers','X361:Z363'],['tools','Tool track','M90:O95'],['readme','README','A1:D4'],['retirements','Retirements','A1:D7']];
 for(const [label,sheetName,range]of ranges){const b=await wb.render({sheetName,range,scale:1,format:'png'});await fs.writeFile(work+mode+'-'+label+'.png',new Uint8Array(await b.arrayBuffer()));}
 console.log('Rendered '+mode+' workbook views.');
}else{
 const inputs=JSON.parse(await fs.readFile(root+'/catalogue/evidence/v16/inputs.json','utf8'));
 const wb=Workbook.create();for(const name of ['Retirements','Offers','Tool track','README'])wb.worksheets.add(name);
 const r=wb.worksheets.getItem('Retirements');r.showGridLines=false;
 r.getRange('A1:F1').values=[['ID','Title','Retired on','Reason','Decision','Sources']];
 const rows=inputs.retirements.map(x=>[x[0],x[1],new Date(x[2]+'T00:00:00Z'),...x.slice(3)]);
 r.getRange('A2:F19').values=rows;r.getRange('C2:C19').format.numberFormat='yyyy-mm-dd';
 r.getRange('A1:F19').format.font={name:'Calibri',size:11};r.getRange('A1:F19').format.wrapText=true;r.getRange('A1:F19').format.verticalAlignment='top';
 r.getRange('A1:F1').format={fill:'#17365D',font:{name:'Calibri',size:11,bold:true,color:'#FFFFFF'},rowHeight:30};
 for(const [col,width]of [['A',14],['B',46],['C',16],['D',85],['E',30],['F',70]])r.getRange(col+'1:'+col+'19').format.columnWidth=width;
 r.getRange('A2:F19').format.rowHeight=100;r.freezePanes.freezeRows(1);
 for(const [sheet,column]of [['Offers','Z'],['Tool track','O']]){
  const s=wb.worksheets.getItem(sheet),courses=inputs.courses.filter(c=>c.sheet===sheet);
  s.getRange(column+'1').values=[['Lifecycle']];
  for(const c of courses)s.getRange('A'+c.row).values=[[c.id]];
  s.getRange(column+'2:'+column+(courses.length+1)).formulas=courses.map(c=>[`=IF(COUNTIFS(Retirements!$A$2:$A$19,A${c.row})>0,"Retired","Active")`]);
 }
 for(const [address,value]of inputs.readme)wb.worksheets.getItem('README').getRange(address).values=[[value]];
 wb.recalculate();
 const retired=inputs.courses.filter(c=>wb.worksheets.getItem(c.sheet).getRange((c.sheet==='Offers'?'Z':'O')+c.row).values[0][0]==='Retired');
 if(retired.length!==18)throw Error('Lifecycle recalculation failed');
 // Verify the dependency responds to a changed register ID, then restore it.
 const prior=r.getRange('A2').values[0][0];r.getRange('A2').values=[['PROBE-ONLY']];wb.recalculate();
 const probe=inputs.courses.find(c=>c.id===prior);if(wb.worksheets.getItem(probe.sheet).getRange('Z'+probe.row).values[0][0]!=='Active')throw Error('Lifecycle dependency failed');
 r.getRange('A2').values=[[prior]];wb.recalculate();
 console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',options:{useRegex:true,maxResults:5},maxChars:800})).ndjson);
 await(await SpreadsheetFile.exportXlsx(wb)).save(work+'authored.xlsx');
 console.log('Authored 18 retirement records, 534 lifecycle formulas and README changes.');
}
