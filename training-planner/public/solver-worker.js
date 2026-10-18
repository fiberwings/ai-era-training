importScripts('./vendor/highs.js');
let solver;
self.onmessage=async({data})=>{try{solver??=await Module({locateFile:f=>'./vendor/'+f});const {solveProblem}=await import('./optimisation.js');self.postMessage({result:solveProblem(solver,data,15)});}catch(e){self.postMessage({error:e.message});}};
