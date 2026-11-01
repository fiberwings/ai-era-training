import {readFile,writeFile} from 'node:fs/promises';
import highsLoader from 'highs';
import {createScenario} from '../public/storage.js';
import {scope,selectedIds,recommendationCohort} from '../public/cohorts.js';
import {prepareProblem,solveProblem} from '../public/optimisation.js';
const data=JSON.parse(await readFile(new URL('../public/data/catalogue.json',import.meta.url))),highs=await highsLoader();
const s=createScenario(data,'Coverage-first workshop draft');
s.assumptions+=' Initial selections are recalculated independently for the new model, conditional on inherited learning. Global curriculum: TR-125, TR-128 and TR-129 are excluded from automatic selection as nationally targeted guidance; they remain available for scoped local use. Presets are proposals for functional-head review; no internal training is assumed complete.';
for(const c of s.cohorts){c.excluded=['TR-125','TR-128','TR-129'].filter(id=>data.courses.some(x=>x.id===id));const inherited=selectedIds(s,c,false).map(id=>data.courses.find(x=>x.id===id)),p=prepareProblem(data,recommendationCohort(data,s,c),scope(data,c,s),inherited,s.overrides),result=solveProblem(highs,p);c.selected=result.ids;c.recommendation={message:result.message,status:result.status};console.log(c.id,result.ids.join(', '),result.message);}
await writeFile(new URL('../public/data/default-scenario.json',import.meta.url),JSON.stringify(s,null,2));
