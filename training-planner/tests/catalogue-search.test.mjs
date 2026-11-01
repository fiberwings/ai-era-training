import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {matchesCourseSearch} from '../public/catalogue-search.js';

test('catalogue search matches course names, providers and descriptions independently',()=>{
 const course={title:'Building effective teams',provider:'Anthropic Academy',description:'Five lessons on multiplayer agents'};
 for(const query of ['effective teams','anthropic','multiplayer','  ANTHROPIC  ','Anthropic teams',' \t '])assert.equal(matchesCourseSearch(course,query),true,query);
 assert.equal(matchesCourseSearch(course,'Microsoft'),false);
 assert.equal(matchesCourseSearch({},'Anthropic'),false);
 assert.equal(matchesCourseSearch({id:'TR-123',tool:'Claude Code'},'TR-123 Claude'),true);
});
test('Anthropic catalogue search includes provider-only and description-only matches',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../public/data/catalogue.json',import.meta.url)));
 const ids=data.courses.filter(c=>matchesCourseSearch(c,'anthropic')).map(c=>c.id);
 assert.equal(ids.length,18);
 assert.ok(ids.includes('TR-089')); // Anthropic Academy provider, absent from title and description.
 assert.ok(ids.includes('TR-062')); // Microsoft course mentioning Anthropic only in its description.
 assert.ok(ids.includes('TR-191')); // Course name includes Anthropic.
 assert.deepEqual(data.courses.filter(c=>matchesCourseSearch(c,'  ANTHROPIC  ')).map(c=>c.id),ids);
});
