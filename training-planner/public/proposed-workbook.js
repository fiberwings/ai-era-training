import {WorkbookZip} from './workbook-zip.js';
import {PROPOSED_SHEET,PROPOSED_HEADERS,validateProposedRows,mergeProposedRows} from './proposed-training.js';

const MAIN='http://schemas.openxmlformats.org/spreadsheetml/2006/main',REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships',PKG='http://schemas.openxmlformats.org/package/2006/relationships';
const xmlText=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const elements=(doc,name)=>[...doc.getElementsByTagNameNS('*',name)];
function parse(text){const doc=new DOMParser().parseFromString(text,'application/xml');if(elements(doc,'parsererror').length)throw Error('The workbook contains unreadable XML.');return doc;}
function serial(doc){return new XMLSerializer().serializeToString(doc);}
function append(doc,parent,name,attrs,ns=parent.namespaceURI){const el=doc.createElementNS(ns,name);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));parent.appendChild(el);return el;}
function partPath(target){const parts=[];for(const x of (target.startsWith('/')?target.slice(1):'xl/'+target).split('/')){if(x==='..')parts.pop();else if(x&&x!=='.')parts.push(x);}return parts.join('/');}
async function readXml(zip,path){const file=zip.file(path);if(!file)throw Error('Missing workbook part: '+path);return parse(await file.async('string'));}
async function openWorkbook(bytes){
 let zip;try{zip=await WorkbookZip.loadAsync(bytes);}catch{throw Error('Choose a valid, unencrypted .xlsx catalogue workbook.');}
 const workbook=await readXml(zip,'xl/workbook.xml'),rels=await readXml(zip,'xl/_rels/workbook.xml.rels'),sheets=elements(workbook,'sheet');
 const paths=new Map(sheets.map(s=>{const id=s.getAttributeNS(REL,'id'),r=elements(rels,'Relationship').find(r=>r.getAttribute('Id')===id);if(!r||r.getAttribute('TargetMode')==='External')throw Error('Invalid worksheet relationship.');return [s.getAttribute('name'),partPath(r.getAttribute('Target'))];}));
 return {zip,workbook,rels,sheets,paths};
}
async function sheetRows(zip,path){
 const doc=await readXml(zip,path),shared=zip.file('xl/sharedStrings.xml')?elements(await readXml(zip,'xl/sharedStrings.xml'),'si').map(si=>elements(si,'t').map(t=>t.textContent).join('')):[];
 return elements(doc,'row').map(row=>{
  const values=Array(PROPOSED_HEADERS.length).fill('');
  for(const cell of elements(row,'c')){
   const col=(cell.getAttribute('r')||'').match(/^[A-Z]+/)?.[0];if(!col)throw Error('Proposed training contains an invalid cell reference.');
   let index=0;for(const ch of col)index=index*26+ch.charCodeAt(0)-64;index--;
   if(index>=values.length)throw Error('Unexpected columns in Proposed training.');
   if(elements(cell,'f').length)throw Error('Proposed training must contain values, not formulas.');
   const type=cell.getAttribute('t'),v=elements(cell,'v')[0]?.textContent;
   values[index]=type==='inlineStr'?elements(cell,'t').map(t=>t.textContent).join(''):type==='s'?shared[Number(v)]:type==='n'||!type?v===undefined?'':Number(v):v||'';
  }
  return values;
 }).filter(row=>row.some(v=>v!==''));
}
async function existingRows(w){
 const path=w.paths.get(PROPOSED_SHEET);if(!path)return [];
 const [headers,...rows]=await sheetRows(w.zip,path);
 if(!headers||headers.some((v,i)=>v!==PROPOSED_HEADERS[i]))throw Error('The Proposed training tab uses a different layout. Keep its original column headers.');
 for(const row of rows)for(const index of [2,9])if(row[index]==='')row[index]=null;
 return validateProposedRows(rows);
}
export async function readProposedWorkbook(bytes){const w=await openWorkbook(bytes);if(!w.paths.has(PROPOSED_SHEET))throw Error('This workbook has no Proposed training tab.');return existingRows(w);}
function colName(i){let name='';for(i++;i;i=Math.floor((i-1)/26))name=String.fromCharCode(65+(i-1)%26)+name;return name;}
function sheetXml(rows,headerStyle,bodyStyle){
 const widths=[44,24,15,20,64,26,72,30,24,10,26,24,22,36,18,40,38,40];
 const cell=(v,r,c,style)=>{const ref=colName(c)+r;if(v===null||v==='')return `<c r="${ref}" s="${style}"/>`;if(typeof v==='number')return `<c r="${ref}" s="${style}"><v>${v}</v></c>`;if(v.length>32767||/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(v))throw Error('A proposed-training field exceeds Excel text limits or contains unsupported control characters. Shorten or clean it before exporting.');return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xmlText(v)}</t></is></c>`;};
 const rowHeight=row=>Math.min(409.5,Math.max(90,12+15*Math.max(...row.map((value,col)=>String(value??'').split(/\r?\n/).reduce((lines,line)=>lines+Math.max(1,Math.ceil(line.length/(widths[col]*.9))),0)))));
 const all=[PROPOSED_HEADERS,...rows],end='R'+all.length;
 if(all.length>1048576)throw Error('Too many proposed items for one Excel worksheet.');
 return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="${MAIN}"><sheetPr><tabColor rgb="FFD6AB51"/></sheetPr><dimension ref="A1:${end}"/><sheetViews><sheetView showGridLines="0" workbookViewId="0"><pane xSplit="1" ySplit="1" topLeftCell="B2" activePane="bottomRight" state="frozen"/><selection pane="bottomRight" activeCell="B2" sqref="B2"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="30"/><cols>${widths.map((width,i)=>`<col min="${i+1}" max="${i+1}" width="${width}" customWidth="1"/>`).join('')}</cols><sheetData>${all.map((row,i)=>`<row r="${i+1}" ht="${i?rowHeight(row):32}" customHeight="1">${row.map((v,c)=>cell(v,i+1,c,i?bodyStyle:headerStyle)).join('')}</row>`).join('')}</sheetData><autoFilter ref="A1:${end}"/><dataValidations count="2"><dataValidation type="list" allowBlank="0" sqref="D2:D1048576"><formula1>"Proposed,In development,Ready"</formula1></dataValidation><dataValidation type="decimal" operator="greaterThanOrEqual" allowBlank="1" sqref="C2:C1048576"><formula1>0</formula1></dataValidation></dataValidations><pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>`;
}
export async function writeProposedWorkbook(bytes,incoming){
 const w=await openWorkbook(bytes);
 for(const name of ['Offers','Rubric','Scores','Build items'])if(!w.paths.has(name))throw Error('Choose the training catalogue workbook. Missing tab: '+name);
 const existing=await existingRows(w),rows=mergeProposedRows(existing,incoming);
 const source=await readXml(w.zip,w.paths.get('Build items')),cells=elements(source,'c');
 const headerStyle=cells.find(c=>c.getAttribute('r')==='A1')?.getAttribute('s')||'0',bodyStyle=cells.find(c=>c.getAttribute('r')==='A2')?.getAttribute('s')||'0';
 let path=w.paths.get(PROPOSED_SHEET);
 if(!path){
  let i=1;while(w.zip.file('xl/worksheets/proposed'+i+'.xml'))i++;path='xl/worksheets/proposed'+i+'.xml';
  const ids=new Set(elements(w.rels,'Relationship').map(r=>r.getAttribute('Id')));let rid=1;while(ids.has('rIdProposed'+rid))rid++;
  const id='rIdProposed'+rid,sheet=append(w.workbook,elements(w.workbook,'sheets')[0],'sheet',{name:PROPOSED_SHEET,sheetId:Math.max(...w.sheets.map(s=>Number(s.getAttribute('sheetId'))))+1});sheet.setAttributeNS(REL,'r:id',id);
  append(w.rels,w.rels.documentElement,'Relationship',{Id:id,Type:REL+'/worksheet',Target:path.slice(3)},PKG);
  const types=await readXml(w.zip,'[Content_Types].xml');append(types,types.documentElement,'Override',{PartName:'/'+path,ContentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml'});
  w.zip.file('xl/workbook.xml',serial(w.workbook),{createFolders:false});w.zip.file('xl/_rels/workbook.xml.rels',serial(w.rels),{createFolders:false});w.zip.file('[Content_Types].xml',serial(types),{createFolders:false});
 }
 w.zip.file(path,sheetXml(rows,headerStyle,bodyStyle),{createFolders:false});
 return {bytes:await w.zip.generateAsync({type:'uint8array',compression:'DEFLATE'}),count:rows.length,added:rows.length-existing.length,updated:incoming.filter(row=>existing.some(r=>r[15]===row[15]&&r[16]===row[16]&&r[17]===row[17])).length};
}
