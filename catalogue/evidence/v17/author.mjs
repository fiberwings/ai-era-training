import fs from 'node:fs/promises';
import {Workbook,SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const root=process.cwd(),work=root+'/.work/catalogue/v17/',mode=process.argv[2];
if(mode==='before'||mode==='after'){
 const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(work+mode+'-view.xlsx'));
 const ranges=mode==='before'?[['Offers','A1:H3'],['README','A1:D4']]:process.argv[3]==='guide'?[['Scoring guide','A1:C24'],['Scoring guide','A27:C51']]:[
  ['Offers','A1:H3'],['Tool track','A1:H3'],['Proposed training','A1:F2'],['Needs','A1:F3'],['Rubric','A1:G3'],
  ['Scoring guide','A1:C24'],['Build items','A1:D4'],['Scores','A1:G3'],['Coverage','A1:M3'],
  ['Retirements','A1:D3'],['V8 audit','A1:D3'],['README','A1:D27'],['Scoring guide','A27:C52']];
 for(const [sheetName,range]of ranges){const b=await wb.render({sheetName,range,scale:1,format:'png'});await fs.writeFile(work+mode+'-'+sheetName.replaceAll(' ','-')+'-'+range.replace(':','-')+'.png',new Uint8Array(await b.arrayBuffer()));}
 console.log('Rendered '+ranges.length+' '+mode+' views.');
}else{
 const inputs=JSON.parse(await fs.readFile(root+'/catalogue/evidence/v17/inputs.json','utf8'));
 const wb=Workbook.create(),s=wb.worksheets.add('README'),g=wb.worksheets.add('Scoring guide');
 s.showGridLines=false;s.getRange('A1:D27').format.font={name:'Calibri',size:11};
 s.getRange('A1:D27').format.verticalAlignment='top';s.getRange('A1:D27').format.wrapText=true;
 for(const [c,w]of [['A',25],['B',37],['C',28],['D',28]])s.getRange(c+'1:'+c+'27').format.columnWidth=w;
 s.mergeCells('A2:D2');s.getRange('A2').values=[['AI Era Cyber Training Catalogue v17']];
 s.getRange('A2:D2').format.font={name:'Calibri',size:17,bold:true,color:'#17365D'};s.getRange('A2:D2').format.rowHeight=32;
 const lines=[
  [4,'Release','2 November 2026. Workbook simplification; no reassessment or change to recommended selections.'],
  [5,'Active catalogue','516 resources: 403 general Offers and 113 product-specific Tool track entries.'],
  [6,'Assessment evidence','140 active outcomes across 23 scoring groups; 56,140 numeric scores and 280 explicitly unassessed rows for active resources.'],
  [7,'Preserved records','534 total resources, including 18 retired records. Original evidence, retired outcomes and source row numbers are retained.'],
  [9,'Everyday use','Browse Offers and Tool track with Lifecycle = Active. Clear the filter to inspect retired records. Proposed training holds reusable internal briefs.'],
  [10,'Assessment work','Needs, Rubric and Scoring guide define the assessment structure. Record scores and evidence in Scores; Coverage calculates and validates course/need results.'],
  [11,'Internal teaching','Build items supplies six optional design templates. Proposed training retains actual saved briefs, delivery status, learner hours and stable assignment IDs. Neither supplies assessed course scores.'],
  [12,'Supporting history','Retirements owns course lifecycle. V8 audit preserves historical source reviews; later dated outcome assessments take precedence.'],
  [14,'Curriculum authority','Use the capability framework and Recommended Training Pathways for current curriculum and review decisions. The workbook owns course records, assessments and evidence.'],
  [15,'Interpretation','Coverage measures published teaching, not learner competence or operational authorisation. A numeric zero and an unassessed blank have different meanings.'],
  [17,'Saving and publishing','Save and recalculate in Excel, validate the workbook, then intentionally refresh the catalogue and rebuild the apps. Saving Excel alone does not publish an app update.'],
  [18,'Stable identifiers','Preserve course/outcome IDs and source rows. Retire records rather than deleting them. Keep the Proposed training headers and original IDs for repeat exports.'],
  [19,'Hidden details','Older descriptive fields and proposal IDs are hidden to simplify browsing. Unhide columns to inspect them. Retained notes, decisions and sources have not been discarded.'],
  [21,'Archived material','The unchanged v16 workbook retains Matrix, Paths, Path detail, Tool adoption, Screening log, Codes and the full release chronology. Relevant code definitions are retained in Scoring guide.'],
  [22,'Removed columns','Legacy Matrix references and duplicate Offers need/coverage summaries were removed. Build templates retain their titles, teaching descriptions and notes.'],
  [24,'Maintenance guide','See catalogue/README.md in the project for validation, publishing and proposed-training instructions.'],
  [25,'Historical workbook','archive/catalogues/AI_Era_Cyber_Training_Catalogue_v16.xlsx'],
 ];
 for(const [r,label,text]of lines){s.getRange('A'+r).values=[[label]];s.getRange('A'+r).format.font={name:'Calibri',size:11,bold:true,color:'#17365D'};s.mergeCells('B'+r+':D'+r);s.getRange('B'+r).values=[[text]];s.getRange('A'+r+':D'+r).format.rowHeight=[6,10,11,17,18,21].includes(r)?47:35;}
 g.showGridLines=false;
 g.getRange('B23').values=[['A must-have is essential to achieving the objective safely and effectively at the assigned depth. Conditional essentials are identified in Rubric Notes. Strong requires no applicable must-have at zero; a mention can clear that gate but does not establish competence.']];
 g.getRange('B24').values=[['Each outcome takes the best score among selected courses. Use the current planner and Recommended Training Pathways for composition, applicability and shared-learning deduplication.']];
 g.getRange('B23:B24').format={font:{name:'Calibri',size:11},wrapText:true,verticalAlignment:'top',rowHeight:48};
 g.getRange('A27:C27').values=[['Reference codes','Definitions retained for legacy build briefs','']];g.mergeCells('B27:C27');
 const defs=inputs.definitions.map(([code,meaning])=>[code,code==='Base'?'Foundation: common learning for everyone in cyber, not a fourth level.':meaning]);
 g.getRange('A28:B'+(27+defs.length)).values=defs;
 g.getRange('A27:C51').format={font:{name:'Calibri',size:11},wrapText:true,verticalAlignment:'top',rowHeight:26};
 for(let r=28;r<=27+defs.length;r++)g.mergeCells(`B${r}:C${r}`);
 g.getRange('A27:C27').format={fill:'#17365D',font:{name:'Calibri',size:11,bold:true,color:'#FFFFFF'},rowHeight:28};
 // These widths also make the authored overlay inspectable; assembly preserves existing guide widths.
 for(const [c,w]of [['A',25],['B',58],['C',65]])g.getRange(c+'1:'+c+'56').format.columnWidth=w;
 wb.recalculate();
 console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',options:{useRegex:true,maxResults:5},maxChars:500})).ndjson);
 await(await SpreadsheetFile.exportXlsx(wb)).save(work+'authored.xlsx');
 console.log('Authored concise guide and retained glossary definitions.');
}
