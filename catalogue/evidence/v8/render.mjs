import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const [input,output,range]=process.argv.slice(2);
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const p=await wb.render({sheetName:'Preview',range,scale:1.3,format:'png'});
await fs.writeFile(output,new Uint8Array(await p.arrayBuffer()));
console.log(output);
