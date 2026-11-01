// Intended-task metadata for catalogue v11, reviewed 31 October 2026.
// Based on the catalogue titles/descriptions, not new syllabus assessments.
// Empty or absent mappings require task-fit review and are never auto-suggested.
export const TOOL_USES = [
  {id:'use',name:'Use for my own tasks',description:'Work with an assistant and check its outputs.'},
  {id:'supervise',name:'Supervise agents',description:'Delegate work, monitor runs and intervene.'},
  {id:'build',name:'Build or configure agents',description:'Design agents, workflows and evaluations.'},
  {id:'administer',name:'Administer and secure',description:'Manage access, deployment, governance and controls.'}
];
const groups = [
  [['use'],['TR-151','TR-150','TR-080','TR-084','TR-082','TR-096','INT-B27','INT-B40','INT-B41','INT-B43','INT-B44','INT-B46','INT-B47','INT-B48','INT-B49','INT-B51','INT-B53','INT-B54','INT-B56','INT-B57','INT-B58','INT-B59','INT-B60','INT-B61','INT-B62','INT-B63','INT-B70','INT-B72','INT-B31','INT-B33','INT-B34']],
  [['supervise'],['TR-152','TR-091','TR-092','TR-079','TR-065','TR-083','TR-086','INT-B50']],
  [['use','supervise'],['TR-054']],
  [['build'],['TR-147','TR-056','TR-149','TR-081','TR-085','TR-075','TR-076','TR-066','TR-068','TR-058','TR-087','INT-B01','INT-B38','INT-B39','INT-B74']],
  [['build','supervise'],['TR-175']],
  [['administer'],['TR-148','TR-169','TR-174','TR-073','TR-074','TR-171','TR-055','TR-059','TR-170','INT-B10','INT-B11','INT-B12','INT-B42']],
  [['build','administer'],['TR-057','TR-172']]
];
export const TOOL_AUDIENCES = Object.fromEntries(groups.flatMap(([uses,ids])=>ids.map(id=>[id,{uses,basis:'Intended tasks from the catalog title and description; syllabus coverage is unchanged.'}])));
export function toolAudience(course) { return TOOL_AUDIENCES[course.id]?.uses||[]; }
export function toolUseMatch(course,profile,tool) {
  const chosen=profile.toolUses?.[tool]||[];
  return chosen.some(use=>toolAudience(course).includes(use));
}
export function validateToolUses(profile) {
  for(const tool of profile.tools)if(!profile.toolUses?.[tool]?.length)throw Error(`Choose what you do with ${tool}.`);
  return profile;
}
