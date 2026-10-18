export function parseDuration(raw='') {
  const s=raw.toLowerCase().replace(/[–—]/g,'-');
  const result=(low,high,note='Explicit learning duration')=>({low,high,hours:high,note,raw});
  const unknown=note=>({low:null,high:null,hours:null,note,raw});
  if (/exam|practice tests?/.test(s) && !s.includes('+')) return unknown('Exam duration is not learning time');
  if (/days? labs|access|modules?|rooms|lectures|multi-module/.test(s) && !/\d\s*h/.test(s)) return unknown('Access period or content count; estimate learning hours');
  const learning=s.split('+')[0];
  if (/\d\s*h\s*\+/.test(s) && !/exam/.test(s)) return unknown('Open-ended duration; enter an estimate');
  let m=learning.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*h/);
  if(m) return result(+m[1],+m[2],'Range; upper bound used for budget');
  m=learning.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*min/);
  if(m) return result(+m[1]/60,+m[2]/60,'Range; upper bound used for budget');
  if (/<\s*1h/.test(s)) return result(0,1,'Less than one hour; one hour budgeted');
  m=learning.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?(?:\s*(\d+)\s*m)?/);
  if(m) { const h=+m[1]+(+(m[2]||0))/60; return result(h,h,/core about/.test(s)?'Full course; excerpt does not inherit full coverage':/exam/.test(s)?'Learning time only; exam excluded':'Explicit learning duration'); }
  m=learning.match(/(\d+)\s*m(?:in(?:utes?)?)?\b/);
  if(m) return result(+m[1]/60,+m[1]/60);
  return unknown('No explicit learning hours; enter a planner estimate');
}
export function duration(course, overrides={}) {
 const v=overrides[course.id];
 return Number.isFinite(v)&&v>=0 ? {hours:v,low:v,high:v,raw:course.duration,note:'Planner estimate (full course)'} : parseDuration(course.duration);
}
export function hoursLabel(hours) { return `${Number(hours.toFixed(2))}h`; }
