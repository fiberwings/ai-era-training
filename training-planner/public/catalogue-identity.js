export function catalogueIdentity(data){return {version:data.version,filename:data.filename,sourceSha256:data.sourceSha256,assessmentDate:data.assessmentDate};}
export function catalogueReview(s,data,previous){
 const retiredIds=new Set((data.retiredCourses||[]).map(c=>c.id));
 const used=new Set((s.components||s.cohorts||[]).flatMap(c=>[...c.selected,...c.pinned,...c.excluded.filter(id=>!retiredIds.has(id))]));
 const refs=new Set((s.components||s.cohorts||[]).flatMap(c=>[...(c.requirements||[]),...c.addedRequirements,...c.removedRequirements,...c.internal.flatMap(i=>i.requirements)]));
 const courses=new Map(data.courses.map(c=>[c.id,c])),reqs=new Map(data.requirements.map(r=>[r.id,r]));
 const missingCourses=[...used].filter(id=>!courses.has(id)),missingOutcomes=[...refs].filter(id=>!reqs.has(id));
 const usable=previous?.version===s.catalogueVersion;
 const changedCourses=usable?previous.courses.filter(c=>used.has(c.id)&&courses.has(c.id)&&JSON.stringify(c)!==JSON.stringify(courses.get(c.id))).map(c=>c.id):[];
 const changedOutcomes=usable?previous.requirements.filter(r=>reqs.has(r.id)&&JSON.stringify(r)!==JSON.stringify(reqs.get(r.id))).map(r=>r.id):[];
 return {matches:s.catalogueVersion===data.version,saved:s.catalogueVersion,current:data.version,missingCourses,missingOutcomes,changedCourses,changedOutcomes,comparisonAvailable:!!usable};
}
export function catalogueWarning(s,data){const r=catalogueReview(s,data);return r.matches?'':`Catalogue version differs: saved ${r.saved}; loaded ${data.filename} (${r.current}), assessed ${data.assessmentDate}. Coverage uses the loaded catalogue. ${r.missingCourses.length?'Missing courses: '+r.missingCourses.join(', ')+'. ':''}${r.missingOutcomes.length?'Missing outcomes: '+r.missingOutcomes.join(', ')+'. ':''}Earlier snapshot not loaded; a detailed change comparison is unavailable. Review the references and acknowledge the update in scenario settings.`;}
