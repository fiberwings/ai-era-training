import {toolAudience} from './tool-audiences.js';
import {duration} from './duration.js';

// Product/task metadata supports resource discovery, never assessment credit.
export function matchesToolPathway(course,component){
 const product=component.tool?.trim().toLowerCase();
 return !!product&&!!course.tool?.toLowerCase().includes(product)&&toolAudience(course).some(task=>component.tasks.includes(task));
}
export function toolBudgetFit(course,spent,budget,overrides={}){
 const hours=duration(course,overrides).hours;
 if(hours===null||spent.unknown)return 'Duration unresolved; budget fit unknown';
 if(budget===null)return 'Course budget unset';
 return spent.hours+hours<=budget+1e-8?'Fits remaining component budget':'Outside remaining component budget';
}
