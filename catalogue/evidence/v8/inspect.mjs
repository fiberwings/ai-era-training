import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load('AI_Era_Cyber_Training_Catalogue_v7.xlsx'));
console.log((await wb.inspect({kind:'sheet,table',maxChars:3500,tableMaxRows:1,tableMaxCols:3})).ndjson);
const preview=await wb.render({sheetName:'Scores',range:'C1:H6',scale:1.4,format:'png'});
await fs.writeFile('.catalogue-v8/before-scores.png',new Uint8Array(await preview.arrayBuffer()));
console.log('Rendered existing Scores');
