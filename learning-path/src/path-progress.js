import {courseMap, unavailable} from './core.js';
import {pathLayers, flattenLayers, matchesTool} from './layers.js';

function supports(course,layer) {
  if(layer.centralIds.includes(course.id)||layer.internalIds.includes(course.id))return true;
  if(layer.kind==='tool')return course.track==='tool'&&matchesTool(course,[layer.tool]);
  if(course.track==='tool')return false;
  return layer.requirements.some(r=>course.internal?course.requirements.includes(r.id):(course.scores[r.id]?.score||0)>=2);
}

// Completion follows published training and personal commitments. Suggestions can
// refresh after every completion, so they are counted separately from progress.
export function pathwayProgress(bundle,learner,layers=pathLayers(bundle,learner)) {
  const map=courseMap(bundle),foundation=layers.find(l=>l.kind==='foundation');
  const chosen=Object.entries(learner.items).filter(([,item])=>['planned','in-progress','completed'].includes(item.status));
  return Object.fromEntries(['foundation','level','specialist','tool'].map(kind=>{
    const section=layers.filter(l=>l.kind===kind),ids=new Set(section.flatMap(l=>[...l.centralIds,...l.internalIds]));
    // Foundation courses are displayed once, but can also fulfil shared level practice.
    const shared=kind==='level'?(foundation?.centralIds||[]).filter(id=>map.has(id)&&section.some(l=>supports(map.get(id),l))):[];
    shared.forEach(id=>ids.add(id));
    for(const [id] of chosen){const course=map.get(id);if(course&&section.some(l=>supports(course,l)))ids.add(id);}
    const trainingIds=[],upcomingIds=[];
    for(const id of ids){
      const course=map.get(id);if(!course)continue;
      // Retain credit for a genuine earlier completion if availability changes.
      (unavailable(course)&&learner.items[id]?.status!=='completed'?upcomingIds:trainingIds).push(id);
    }
    const optionIds=[...new Set(flattenLayers(section).flatMap(l=>(l.suggestions||[]).map(x=>x.course.id)))].filter(id=>!ids.has(id)&&map.has(id)&&!unavailable(map.get(id)));
    const total=trainingIds.length,completed=trainingIds.filter(id=>learner.items[id]?.status==='completed').length;
    const inProgress=trainingIds.filter(id=>learner.items[id]?.status==='in-progress').length;
    return [kind,{total,completed,inProgress,percent:total?Math.floor(completed/total*100):0,trainingIds,upcomingIds,optionIds,shared:shared.filter(id=>trainingIds.includes(id)).length,configured:section.length>0}];
  }));
}
