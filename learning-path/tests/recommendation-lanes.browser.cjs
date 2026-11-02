// Run with Playwright: node --test learning-path/tests/recommendation-lanes.browser.cjs
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
async function setup(t,level=1,role=1){
  const context=await browser.newContext({viewport:{width:1440,height:1050}});t.after(()=>context.close());
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(10000);
  page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
  await page.goto(source);
  await page.locator(`#quick-setup-form [name="level"][value="${level}"]`).check();
  await page.locator(`#quick-setup-form [name="roles"][value="${role}"]`).check();
  await page.locator('#quick-setup-form [name="tools"][value="Microsoft 365 Copilot"]').check();
  await page.getByRole('button',{name:'Show my learning path',exact:true}).click();
  await page.locator('#dialog').waitFor({state:'hidden'});
  return page;
}
const stored=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),storage);
async function usePlan(page,scenario){
  // The same persisted override is validated and prepared by the app on load.
  await page.evaluate(({storage,scenario})=>localStorage.setItem(storage+'-central',JSON.stringify({scenario,version:'lane-test'})),{storage,scenario});
  await page.reload();await page.locator('.central-lane').first().waitFor();
}
async function screenshot(page,name){if(process.env.LEARNER_QA_DIR)await page.screenshot({path:path.join(process.env.LEARNER_QA_DIR,name),fullPage:true});}

test('overview and scrolling layers retain their layout while recommendations have distinct lanes',async t=>{
  const page=await setup(t);
  assert.equal(await page.locator('.path-composition>.composition-layer').count(),4);
  assert.deepEqual(await page.locator('.learning-layer').evaluateAll(els=>els.map(e=>e.id)),['layer-foundation','layer-level','layer-specialist','layer-tool']);
  const lanes=await page.locator('.source-split').evaluateAll(els=>els.map(e=>[...e.querySelectorAll(':scope>.source-lane')].map(l=>l.classList.contains('central-lane')?'central':'suggested')));
  assert.ok(lanes.every(pair=>JSON.stringify(pair)==='["central","suggested"]'));
  const foundation=page.locator('#layer-foundation'),level=page.locator('#layer-level');
  for(const id of ['TR-281','TR-145']){
    assert.equal(await foundation.locator(`.central-lane [data-action="course"][data-id="${id}"]`).count(),1);
    assert.equal(await page.locator(`.suggested-lane [data-action="course"][data-id="${id}"]`).count(),0);
  }
  assert.match(await level.locator('.central-lane').innerText(),/shares Foundation learning/);
  assert.equal(await level.locator('.central-lane .course-card').count(),0);
  await level.getByRole('button',{name:'View Foundation learning',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'heading-foundation');
  const upcoming=foundation.locator('.pending-row').filter({hasText:'AI use cases'});
  assert.equal(await upcoming.locator('[data-action="add"]').count(),0);
  await upcoming.getByRole('button',{name:'Save for later',exact:true}).click();
  assert.equal(await upcoming.getByRole('button',{name:'Saved for later',exact:true}).getAttribute('aria-pressed'),'true');
  const tools=page.locator('#layer-tool');
  assert.match(await tools.locator('.central-lane').innerText(),/No central recommendation published/);
  assert.equal(await tools.locator('.central-lane .pathway-review-label').count(),0);
  assert.ok(await tools.locator('.suggested-lane .course-card').count()>0);
  await screenshot(page,'recommendation-lanes-desktop.png');
  for(const width of [768,390,320]){
    await page.setViewportSize({width,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`width ${width}`);
  }
  await screenshot(page,'recommendation-lanes-mobile.png');
});

test('adding from either lane preserves source and shared completion with existing feedback',async t=>{
  const page=await setup(t),foundation=page.locator('#layer-foundation');
  const optional=foundation.locator('.suggested-lane [data-action="add"]').first(),optionalId=await optional.getAttribute('data-id');
  await optional.click();
  await foundation.locator('.central-lane [data-action="add"][data-id="TR-281"]').click();
  let saved=await stored(page);
  assert.equal(saved.items[optionalId].source,'personalised');assert.equal(saved.items['TR-281'].source,'central');
  assert.match(await foundation.locator('.central-lane .course-card').filter({has:page.locator('[data-action="course"][data-id="TR-281"]')}).innerText(),/Centrally recommended[\s\S]*In my plan/);
  Object.assign(saved.items['TR-281'],{status:'completed',completedOn:'2026-11-02',notes:'Preserve my notes',actualHours:6.2});
  saved.feedback=[{id:'feedback-lanes',courseId:'TR-281',courseTitle:saved.items['TR-281'].title,groupId:'entry',groupName:'Original group',catalogueVersion:'original',completedOn:'2026-11-02',usefulness:4,difficulty:'About right',actualHours:6.2,comment:'Keep my feedback'}];
  await page.evaluate(({storage,saved})=>localStorage.setItem(storage,JSON.stringify(saved)),{storage,saved});
  await page.reload();await foundation.waitFor();
  assert.equal(await page.locator('.notice.error').count(),0);
  const after=await stored(page);assert.deepEqual(after.items,saved.items);assert.deepEqual(after.feedback,saved.feedback);
  for(const kind of ['foundation','level'])assert.equal(await page.locator(`.composition-layer.${kind} .layer-progress-count strong`).innerText(),'1');
});

test('pending central AI selections and proposed delivery remain separate from optional suggestions',async t=>{
  const page=await setup(t,2,1),level=page.locator('#layer-level');
  assert.match(await level.locator('.central-lane .pathway-review-label').innerText(),/AI recommendation - to be reviewed/);
  await level.locator('.central-lane .layer-more summary').click();
  for(const id of ['TR-100','TR-191','TR-110']){
    assert.equal(await level.locator(`.central-lane [data-action="course"][data-id="${id}"]`).count(),1);
    assert.equal(await page.locator(`.suggested-lane [data-action="course"][data-id="${id}"]`).count(),0);
  }
  assert.equal(await level.locator('.source-upcoming .pending-row').count(),4);
  assert.equal(await level.locator('.source-upcoming [data-action="add"]').count(),0);
  await page.getByLabel('Learning route',{exact:true}).selectOption('coached');
  assert.match(await level.locator('.source-upcoming').innerText(),/Supported evaluation practice/);
  assert.equal(await level.locator('.central-lane [data-action="course"][data-id="TR-100"]').count(),0);
});

test('a revised component plan shows its own name, review, level selections and empty Foundation',async t=>{
  const page=await setup(t),before=await stored(page);
  const scenario=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../recommended-pathways/Recommended-Training-Pathways.json')));
  scenario.name='Example revised central selection';
  const foundation=scenario.components.find(c=>c.id==='foundation');foundation.selected=[];foundation.internal=[];
  const entry=scenario.components.find(c=>c.level===1);entry.selected=['TR-089'];entry.reviewStatus='AI recommendation - to be reviewed';
  await usePlan(page,scenario);
  assert.match(await page.locator('#layer-foundation .central-lane').innerText(),/None published/);
  assert.equal(await page.locator('#layer-foundation .pathway-review-label').count(),0);
  const level=page.locator('#layer-level .central-lane');
  assert.match(await level.innerText(),/Example revised central selection/);
  assert.match(await level.innerText(),/AI recommendation - to be reviewed/);
  assert.equal(await level.locator('[data-action="course"][data-id="TR-089"]').count(),1);
  assert.equal(await level.locator('[data-action="layer-jump"]').count(),0);
  assert.doesNotMatch(await page.locator('.publication-status').innerText(),/Foundation and L1: Reviewed/);
  assert.deepEqual((await stored(page)).items,before.items);
});

test('legacy plans retain other-level role options and explicit unknown review status',async t=>{
  const page=await setup(t,3,8),saved=await stored(page);
  saved.profile.roleResponsibilities={8:['identity-operations']};saved.profile.specialisms=['identity-operations'];
  await page.evaluate(({storage,saved})=>localStorage.setItem(storage,JSON.stringify(saved)),{storage,saved});
  const scenario=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../training-planner/public/data/default-scenario.json')));
  scenario.name='Legacy central path';await usePlan(page,scenario);
  const central=page.locator('#layer-specialist .central-lane');
  assert.match(await central.innerText(),/Legacy central path/);
  assert.match(await central.innerText(),/Central role option/);
  assert.match(await central.innerText(),/Check prerequisites/);
  assert.match(await central.locator('.pathway-review-label').innerText(),/Review status not recorded/);
  assert.equal(await page.locator('.suggested-lane .tag.central-role').count(),0);
});
