// Optional browser regression: with Playwright installed, run
// node --test learning-path/tests/quick-setup.browser.cjs
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const source=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
const storage='my-ai-learning-path-v1';
let browser;
before(async()=>{browser=await chromium.launch({headless:true});});
after(async()=>{await browser?.close();});
async function fixture(t,viewport={width:1440,height:1000}){
  const context=await browser.newContext({viewport});t.after(()=>context.close());
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(10000);
  page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
  await page.goto(source);await page.locator('#quick-setup-form').waitFor();return page;
}
const stored=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),storage);
const submit=page=>page.getByRole('button',{name:'Show my learning path',exact:true}).click();
async function choose(page,level='3',role='6'){
  await page.locator(`#quick-setup-form [name="level"][value="${level}"]`).check();
  await page.locator(`#quick-setup-form [name="roles"][value="${role}"]`).check();
  await page.locator('#quick-setup-form [name="tools"][value="Microsoft 365 Copilot"]').check();
}
test('one form completes L3 without a quiz, granular choices or optional coding comfort',async t=>{
  const page=await fixture(t),form=page.locator('#quick-setup-form');
  assert.deepEqual(await form.locator('input,select,textarea').evaluateAll(els=>[...new Set(els.map(e=>e.name))]),['level','roles','tools','codingReady']);
  assert.equal(await form.locator('[name="roles"]').count(),9);
  assert.equal(await form.locator('[name="level"]:checked').count(),0);
  await page.locator('#quick-setup-form [name="level"][value="3"]').check();
  await submit(page);assert.match(await page.locator('#dialog-error').innerText(),/responsibility area/);
  await page.locator('#quick-setup-form [name="roles"][value="6"]').check();
  await submit(page);assert.match(await page.locator('#dialog-error').innerText(),/tool/);
  await choose(page);
  if(process.env.LEARNER_QA_DIR){await page.locator('#dialog').evaluate(el=>el.scrollTop=0);await page.screenshot({path:path.join(process.env.LEARNER_QA_DIR,'quick-setup-desktop.png')});}
  await submit(page);await page.locator('#dialog').waitFor({state:'hidden'});
  let saved=await stored(page);
  assert(saved.onboarding);assert.equal(saved.profile.level,3);assert.equal(saved.profile.codingReady,false);
  assert.deepEqual(saved.profile.answers,{});assert.deepEqual(saved.profile.activityAnswers,{});assert.deepEqual(saved.profile.toolUses,{});
  assert.equal(await page.getByRole('button',{name:'Complete my path',exact:true}).count(),0);
  assert.match(await page.locator('.starting-guidance').innerText(),/L3 practice/);
  await page.reload();await page.locator('#main-content').waitFor();
  assert.equal(await page.locator('#dialog[open]').count(),0);assert.deepEqual(await stored(page),saved);
  await page.locator('nav [data-view="profile"]').click();
  await page.getByRole('button',{name:'Save my path',exact:true}).click();
  assert.match(await page.locator('#toast').innerText(),/path is saved/);
  assert.equal((await stored(page)).profile.level,3);
  // The old quiz is available only when deliberately opened from My profile.
  await page.getByRole('button',{name:'Review my starting point',exact:true}).click();
  for(const [id,value] of Object.entries({verify:'0',safe:'0',agent:'1',build:'0'}))await page.locator(`#starting-checks-form [name="${id}"][value="${value}"]`).check();
  await page.getByRole('button',{name:'Save starting point',exact:true}).click();
  saved=await stored(page);assert.equal(saved.profile.level,3);assert.equal(saved.profile.answers.verify,0);
  assert.match(await page.locator('.starting-guidance').innerText(),/L1 practice/);
});
test('mobile quick setup keeps the action reachable and accepts awareness without detailed responsibilities',async t=>{
  const page=await fixture(t,{width:390,height:844});
  await choose(page,'1','7');await page.locator('#quick-setup-form [name="codingReady"]').check();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('#dialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
  if(process.env.LEARNER_QA_DIR){await page.locator('#dialog').evaluate(el=>el.scrollTop=0);await page.screenshot({path:path.join(process.env.LEARNER_QA_DIR,'quick-setup-mobile.png')});}
  await submit(page);await page.locator('#dialog').waitFor({state:'hidden'});
  const saved=await stored(page);assert.equal(saved.profile.level,1);assert.equal(saved.profile.codingReady,true);assert.deepEqual(saved.profile.specialisms,[]);
  assert.equal(await page.getByRole('button',{name:'Complete my path',exact:true}).count(),0);
});
test('returning learners keep their records and cancelling quick setup makes no changes',async t=>{
  const page=await fixture(t);await choose(page,'2','8');await submit(page);
  await page.locator('#dialog').waitFor({state:'hidden'});
  const saved=await stored(page);
  saved.onboarding=false;delete saved.profile.quickSetup;
  saved.profile.roleResponsibilities={8:['identity-operations']};saved.profile.specialisms=['identity-operations'];
  saved.profile.toolUses={'Microsoft 365 Copilot':['administer']};
  saved.profile.name='Alex';saved.profile.weeklyHours=4;
  saved.items['TR-096']={status:'completed',source:'personal',title:'Existing learning',order:0,notes:'Keep my notes',dueDate:'2026-12-01',actualHours:2,completedOn:'2026-11-01',completionContext:{groupId:'old-group',groupName:'Original group',catalogueVersion:'old-version'}};
  saved.feedback=[{id:'response-1',courseId:'TR-096',courseTitle:'Existing learning',groupId:'old-group',groupName:'Original group',catalogueVersion:'old-version',completedOn:'2026-11-01',usefulness:4,difficulty:'About right',actualHours:2,comment:'Keep this'}];
  saved.history=[{event:'Existing history'}];
  await page.evaluate(({storage,saved})=>localStorage.setItem(storage,JSON.stringify(saved)),{storage,saved});
  await page.reload();await page.locator('#quick-setup-form').waitFor();
  await page.locator('#quick-setup-form [name="level"][value="3"]').check();
  await page.getByRole('button',{name:'Browse first',exact:true}).click();assert.deepEqual(await stored(page),saved);
  await page.getByRole('button',{name:'Complete my path',exact:true}).click();
  await page.locator('#quick-setup-form [name="level"][value="3"]').check();await submit(page);
  await page.locator('#dialog').waitFor({state:'hidden'});
  const result=await stored(page);
  for(const key of ['items','feedback','history','formsTemplate'])assert.deepEqual(result[key],saved[key]);
  for(const key of ['roleResponsibilities','toolUses','weeklyHours','name'])assert.deepEqual(result.profile[key],saved.profile[key]);
  assert.equal(result.profile.level,3);
});
