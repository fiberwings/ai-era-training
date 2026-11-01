import {startComponentPlanner} from './component-ui.js';
import {startLegacyPlanner} from './legacy-app.js';
import {STORE} from './storage.js';
let legacy=false;
try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');legacy=!!saved?.scenarios?.some(s=>s.id===saved.activeId&&[1,2].includes(s.schema));}catch{}
try{if(legacy)await startLegacyPlanner();else await startComponentPlanner();}catch(error){document.getElementById('app').textContent='The planner could not start: '+error.message;console.error(error);}
