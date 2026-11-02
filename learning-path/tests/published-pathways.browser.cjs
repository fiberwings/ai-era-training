const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const source=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
const storage='my-ai-learning-path-v1';
let browser;
before(async()=>{browser=await chromium.launch({headless:true});});
after(async()=>{await browser?.close();});
async function setup(t,level,role,viewport={width:1440,height:1050}){
 const context=await browser.newContext({viewport});t.after(()=>context.close());
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(12000);
 page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
 await page.goto(source);await page.locator('#quick-setup-form').waitFor();
 await page.locator(`#quick-setup-form [name="level"][value="${level}"]`).check();
 await page.locator(`#quick-setup-form [name="roles"][value="${role}"]`).check();
 await page.locator('#quick-setup-form [name="tools"][value="Microsoft 365 Copilot"]').check();
 await page.getByRole('button',{name:'Show my learning path',exact:true}).click();await page.locator('#dialog').waitFor({state:'hidden'});
 return page;
}
const stored=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),storage);
test('published Foundation/L1 is reviewed and AI use cases stays upcoming on mobile',async t=>{
 const page=await setup(t,'1','7',{width:390,height:844});
 assert.match(await page.locator('.publication-status').innerText(),/Recommended Training Pathways v0.1/);
 const foundation=page.locator('#layer-foundation');
 for(const id of ['TR-281','TR-145']){
  const card=foundation.locator('.course-card').filter({has:page.locator(`[data-action="course"][data-id="${id}"]`)});
  assert.match(await card.innerText(),/Reviewed/);
 }
 assert.match(await page.locator('#layer-level .pathway-review-label').innerText(),/Reviewed/);
 const upcoming=foundation.locator('.pending-row').filter({hasText:'AI use cases'});
 assert.match(await upcoming.innerText(),/Proposed/);assert.match(await upcoming.innerText(),/Reviewed/);
 assert.equal(await upcoming.locator('[data-action="add"]').count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(process.env.LEARNER_QA_DIR)await page.screenshot({path:path.join(process.env.LEARNER_QA_DIR,'published-foundation-mobile.png'),fullPage:true});
});
test('existing completion and feedback survive publication and switching to coached practice',async t=>{
 const page=await setup(t,'3','5');const saved=await stored(page);
 saved.acknowledged='previous-catalogue:old-central-plan:old-version';
 saved.items['TR-229']={status:'completed',source:'central',title:'Reasoning with o1',order:0,notes:'Keep the completed history',dueDate:'2026-12-01',actualHours:2,completedOn:'2026-11-01',completionContext:{groupId:'technical',groupName:'Previous central plan',catalogueVersion:'old-version'}};
 saved.feedback=[{id:'response-old',courseId:'TR-229',courseTitle:'Reasoning with o1',groupId:'technical',groupName:'Previous central plan',catalogueVersion:'old-version',completedOn:'2026-11-01',usefulness:4,difficulty:'About right',actualHours:2,comment:'Retain this feedback'}];
 await page.evaluate(({storage,saved})=>localStorage.setItem(storage,JSON.stringify(saved)),{storage,saved});
 await page.reload();await page.locator('#main-content').waitFor();
 assert.match(await page.locator('#main-content').innerText(),/updated central pathway/);
 assert.deepEqual(await stored(page),saved);
 assert.match(await page.locator('#layer-level .pathway-review-label').innerText(),/AI recommendation - to be reviewed/);
 assert.equal(await page.locator('#layer-level [data-action="course"][data-id="TR-229"]').count(),0);
 assert.ok(await page.locator('#layer-level [data-action="course"][data-id="TR-198"]').count());
 await page.getByLabel('Learning route',{exact:true}).selectOption('coached');
 assert.equal(await page.locator('#layer-level [data-action="course"][data-id="TR-198"]').count(),0);
 assert.match(await page.locator('#layer-level').innerText(),/Supported no-code agent build and evaluation/);
 const after=await stored(page);assert.equal(after.profile.learningRoute,'coached');
 assert.deepEqual(after.items,saved.items);assert.deepEqual(after.feedback,saved.feedback);
 if(process.env.LEARNER_QA_DIR)await page.screenshot({path:path.join(process.env.LEARNER_QA_DIR,'published-l3-coached.png'),fullPage:true});
 await page.reload();assert.equal(await page.getByLabel('Learning route',{exact:true}).inputValue(),'coached');
});
