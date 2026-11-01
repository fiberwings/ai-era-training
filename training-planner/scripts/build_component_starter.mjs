import {readFile,writeFile} from 'node:fs/promises';
import {createComponentScenario,validateComponentScenario} from '../public/components.js';
const data=JSON.parse(await readFile(new URL('../public/data/catalogue.json',import.meta.url)));
const legacy=JSON.parse(await readFile(new URL('../public/data/default-scenario.json',import.meta.url)));
const starter=createComponentScenario(data,'Blank component curriculum',legacy);
starter.id='blank-component-curriculum-v1';starter.created='2026-10-31T00:00:00.000Z';
validateComponentScenario(starter,data);
await writeFile(new URL('../public/data/component-starter.json',import.meta.url),JSON.stringify(starter,null,2)+'\n');
console.log(`${starter.components.length} blank components; ${starter.audiences.length} audience templates.`);
