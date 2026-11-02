// Optional browser regression: with Playwright installed, run
// node --test training-planner/tests/component-ui.browser.cjs
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const starter=JSON.parse(fs.readFileSync(path.join(root,'public/data/component-starter.json')));
const store='cyber-training-planner-v1';
const app=pathToFileURL(path.join(root,'Training-Planner.html')).href;
let browser;
before(async()=>{browser=await chromium.launch({headless:true});});
after(async()=>{await browser?.close();});
const component=(s,id)=>s.components.find(c=>c.id===id);
const click=(page,action)=>page.locator(`main [data-cp="${action}"]`).first().click();
const own=page=>page.getByLabel('Internal learning for this component',{exact:true});
const inherited=page=>page.getByRole('region',{name:'Inherited learning',exact:true});
async function open(page,id){await page.locator('#cp-target').selectOption('component:'+id);}
async function saved(page){return page.evaluate(key=>{const {scenarios,activeId}=JSON.parse(localStorage.getItem(key));return scenarios.find(s=>s.id===activeId);},store);}
async function fixture(t,prepare=()=>{},source=app){
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 t.after(()=>context.close());
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(8000);
 page.on('pageerror',e=>errors.push(e.message));
 t.after(()=>assert.deepEqual(errors,[]));
 await page.goto(source);await page.locator('#cp-target').waitFor();
 const scenario=structuredClone(starter);prepare(scenario);
 await page.evaluate(({store,scenario})=>localStorage.setItem(store,JSON.stringify({scenarios:[scenario],activeId:scenario.id})),{store,scenario});
 await page.reload();await page.locator('#cp-target').waitFor();
 return page;
}
async function fillBrief(page,title,requirement='N1.1'){
 await page.locator('#cp-name').fill(title);
 await page.locator('#cp-owner').fill('Training owner');
 await page.locator('#cp-hours').fill('2');
 await page.locator('#cp-outcomes').fill('Teach and practise this outcome');
 await page.locator('[data-outcome-filter]').selectOption('all');
 await page.locator(`[data-outcome-id="${requirement}"]`).check();
 await page.locator('[data-cp="internal-save"]').click();
 await page.locator('#dialog').waitFor({state:'hidden'});
}

test('retired selections remain reviewable and exportable while catalogue discovery stays active only',async t=>{
 const page=await fixture(t,s=>{s.catalogueVersion='ff6d5a46d0450171';component(s,'l3').selected=['TR-229'];});
 await open(page,'l3');const before=await saved(page);
 const card=page.locator('.selection').filter({has:page.locator('[data-cp="course"][data-id="TR-229"]')}).first();
 assert.match(await card.innerText(),/Reasoning with o1/);assert.match(await card.innerText(),/Retired/);
 await card.locator('[data-cp="course"]').click();assert.match(await page.locator('#dialog').innerText(),/Retired training/);
 assert.match(await page.locator('#dialog').innerText(),/2026-11-02/);
 assert.match(await page.locator('#dialog').innerText(),/no current assessed coverage/);
 if(process.env.RETIREMENT_QA_DIR)await page.screenshot({path:path.join(process.env.RETIREMENT_QA_DIR,'planner-retired-selection.png')});
 await page.keyboard.press('Escape');assert.deepEqual(await saved(page),before);
 await page.locator('summary').filter({hasText:'Scenario & exports'}).click();
 await page.locator('[data-cp="export"]').first().click();
 const download=page.waitForEvent('download');await page.locator('#dialog a[download]').click();
 const exported=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));assert.deepEqual(exported,before);
 await page.keyboard.press('Escape');
 await page.locator('[data-cp="view"][data-id="catalogue"]').first().click();
 await page.locator('#cp-search').fill('TR-229');
 assert.equal(await page.locator('#cp-catalogue-results [data-cp="preview"][data-id="TR-229"]').count(),0);
 await open(page,'l3');await page.locator('[data-cp="remove"][data-id="TR-229"]').click();
 assert.deepEqual(component(await saved(page),'l3').selected,[]);
});

test('legacy saved plans retain retired selections and open their retirement details',async t=>{
 const context=await browser.newContext();t.after(()=>context.close());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(app);await page.locator('#cp-target').waitFor();
 const scenario=JSON.parse(fs.readFileSync(path.join(root,'scenario-history/default-before-v16-retirements.json')));
 const stored={scenarios:[scenario],activeId:scenario.id};
 await page.evaluate(({store,stored})=>localStorage.setItem(store,JSON.stringify(stored)),{store,stored});
 await page.reload();const details=page.locator('.overview-courses').filter({has:page.locator('[data-action="course"][data-id="TR-229"]')});
 await details.locator('summary').click();await details.locator('[data-action="course"][data-id="TR-229"]').click();
 assert.match(await page.locator('#dialog').innerText(),/Retired training/);
 assert.match(await page.locator('#dialog').innerText(),/Reasoning with o1/);
 assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),store),stored);
 assert.deepEqual(errors,[]);
});

test('internal selections stay local like catalogue courses, with prerequisites inherited separately',async t=>{
 const page=await fixture(t,s=>{component(s,'foundation').selected=['INT-437'];component(s,'l1').selected=['TR-078'];});
 await open(page,'foundation');await click(page,'internal-new');await fillBrief(page,'Foundation practice');
 assert.match(await own(page).innerText(),/Foundation practice/);
 assert.equal(await inherited(page).count(),0);
 const initial=await saved(page),foundationItem=component(initial,'foundation').internal[0];
 for(const [index,id] of ['l1','l2','l3'].entries()){
  await open(page,id);
  assert.doesNotMatch(await own(page).innerText(),/Foundation practice/);
  assert.match(await inherited(page).innerText(),/Foundation practice/);
  const card=inherited(page).locator('.internal-item').filter({hasText:'Foundation practice'});
  assert.match(await card.innerText(),/Foundation · shared learning/);
  assert.equal(await card.locator('[data-cp="internal-edit"], [data-cp="internal-remove"]').count(),0);
  assert.equal(await page.locator('main section').first().locator('[data-cp="course"][data-id="INT-437"]').count(),0);
  assert.equal(await inherited(page).locator('[data-cp="course"][data-id="INT-437"]').count(),1);
  await click(page,'internal-new');await fillBrief(page,id+' practice');
  assert.equal(await own(page).locator('.internal-item').count(),1);
  assert.match(await own(page).innerText(),new RegExp(id+' practice'));
  assert.equal(await inherited(page).locator('.internal-item').count(),index+1);
 }
 const s=await saved(page);
 assert.deepEqual(component(s,'foundation').internal,[foundationItem]);
 for(const id of ['l1','l2','l3'])assert.deepEqual(component(s,id).internal.map(i=>i.title),[id+' practice']);
 await open(page,'specialism-vendor-evaluation');
 assert.equal(await own(page).locator('.internal-item').count(),0);assert.equal(await inherited(page).count(),0);
 await page.locator('#cp-target').selectOption('audience:governance');
 const audienceItems=page.getByLabel('Internal learning for this audience',{exact:true});
 assert.equal(await audienceItems.locator('.internal-item').count(),3);
 assert.equal(await audienceItems.locator('[data-cp="internal-edit"], [data-cp="internal-remove"]').count(),0);
 assert.match(await page.locator('main .coverage-summary-footer').innerText(),/3 internal items/);
 await open(page,'l2');await page.reload();await page.locator('#cp-target').waitFor();await open(page,'l2');
 assert.deepEqual(await saved(page),s);
 assert.deepEqual(await own(page).locator('.internal-item strong').allTextContents(),['l2 practice']);
 assert.equal(await inherited(page).locator('.internal-item').count(),2);
 if(process.env.PLANNER_QA_DIR)await page.screenshot({path:path.join(process.env.PLANNER_QA_DIR,'internal-learning-components.png'),fullPage:true});
});

test('catalogue destination does not redirect add/edit from the current component',async t=>{
 const item=(id,title)=>({id,title,owner:'Trainer',hours:2,status:'Proposed',outcomes:'Teach N1.1',requirements:['N1.1']});
 const page=await fixture(t,s=>{component(s,'foundation').internal=[item('foundation-item','Foundation original')];component(s,'l1').internal=[item('l1-item','L1 original')];});
 const originalFoundation=component(await saved(page),'foundation').internal;
 async function staleDestination(){
  await page.locator('nav [data-cp="view"][data-id="catalogue"]').click();
  await page.locator('#cp-candidate-component').selectOption('foundation');
  await page.locator('nav [data-cp="view"][data-id="coverage"]').click();
  await click(page,'view');
 }
 await open(page,'l1');await staleDestination();await click(page,'internal-new');
 assert.equal(await page.locator('#cp-internal-component').inputValue(),'l1');
 await fillBrief(page,'L1 additional');
 assert.equal(component(await saved(page),'l1').internal.length,2);
 await staleDestination();await own(page).locator('.internal-item').filter({hasText:'L1 original'}).locator('[data-cp="internal-edit"]').click();
 assert.equal(await page.locator('#cp-name').inputValue(),'L1 original');
 assert.equal(await page.locator('#cp-internal-component').inputValue(),'l1');
 await page.locator('#cp-name').fill('L1 edited');await page.locator('[data-cp="internal-save"]').click();
 let s=await saved(page);assert.equal(component(s,'l1').internal.length,2);
 assert.equal(component(s,'l1').internal.find(i=>i.id==='l1-item').title,'L1 edited');
 assert.deepEqual(component(s,'foundation').internal,originalFoundation);
 await own(page).locator('.internal-item').filter({hasText:'L1 edited'}).locator('[data-cp="internal-remove"]').click();
 s=await saved(page);assert.deepEqual(component(s,'l1').internal.map(i=>i.title),['L1 additional']);
 assert.deepEqual(component(s,'foundation').internal,originalFoundation);
 // A teaching brief started in the catalogue still respects its explicit destination.
 await page.locator('nav [data-cp="view"][data-id="coverage"]').click();
 await page.locator('[data-coverage-outcome] > summary').first().click();
 await click(page,'gap');await page.locator('#cp-candidate-component').selectOption('foundation');await click(page,'internal-for');
 assert.equal(await page.locator('#cp-internal-component').inputValue(),'foundation');
 await fillBrief(page,'Catalogue foundation brief');
 s=await saved(page);assert.equal(component(s,'foundation').internal.length,2);
 assert.deepEqual(component(s,'l1').internal.map(i=>i.title),['L1 additional']);
});

test('proposed training exports to its own catalogue tab and reloads with all details',async t=>{
 const os=require('node:os');
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'planner-proposals-'));t.after(()=>fs.rmSync(out,{recursive:true,force:true}));
 const brief={id:'excel-roundtrip',title:'=Literal title & review',owner:'Trainer\nCo-owner',hours:0,status:'In development',outcomes:'Line one\nLine two <practice> "quotes"',requirements:['N1.1','N2.1']};
 const page=await fixture(t,s=>{component(s,'foundation').internal=[brief];component(s,'l1').internal=[{...brief,title:'L1 variant',hours:null,status:'Ready'}];});
 async function exportWorkbook(file,dest){
  if(await page.locator('.menu').getAttribute('open')===null)await page.locator('.menu > summary').click();await page.locator('[data-cp="proposed-export"]').first().click();
  await page.locator('#cp-proposed-file').setInputFiles(file);await page.locator('[data-cp="proposed-export-save"]').click();
  const link=page.locator('#dialog a[download]');await link.waitFor();
  const promise=page.waitForEvent('download');await link.click();await (await promise).saveAs(dest);
  await page.locator('#dialog [data-cp="close"]').click();
 }
 const catalogue=JSON.parse(fs.readFileSync(path.join(root,'public/data/catalogue.json'),'utf8'));
 const existing=catalogue.proposedTraining?.rows.length||0;
 const original=path.resolve(root,'../catalogue',catalogue.filename),first=path.join(out,'first.xlsx');
 await exportWorkbook(original,first);
 // Independent file verification is performed by the Python workbook reader.
 const {execFileSync}=require('node:child_process');
 const python=process.env.PLANNER_TEST_PYTHON||'python3';
 execFileSync(python,[path.join(__dirname,'verify_proposed_workbook.py'),original,first],{stdio:'pipe'});
 const newPlan=structuredClone(starter);newPlan.id='new-plan';
 await page.evaluate(({store,s})=>localStorage.setItem(store,JSON.stringify({scenarios:[s],activeId:s.id})),{store,s:newPlan});
 await page.reload();await page.locator('#cp-target').waitFor();await open(page,'foundation');
 async function loadWorkbook(file){
  await click(page,'proposed-import');await page.locator('#cp-proposed-file').setInputFiles(file);await page.locator('[data-cp="proposed-import-load"]').click();
  await page.locator('#cp-proposed-row').waitFor();await page.locator('#cp-proposed-row').selectOption(String(existing));
 }
 await loadWorkbook(first);
 assert.equal(await page.locator('#cp-proposed-row option').count(),existing+2);
 assert.match(await page.locator('#cp-proposed-preview').innerText(),/Line two <practice> "quotes"/);
 await page.locator('[data-cp="proposed-import-save"]').click();
 let s=await saved(page);assert.deepEqual(component(s,'foundation').internal,[brief]);assert.equal(component(s,'l1').internal.length,0);
 await loadWorkbook(first);await page.locator('[data-cp="proposed-import-save"]').click();
 assert.equal(component(await saved(page),'foundation').internal.length,1);
 // Export a second plan into the same workbook: the first plan's records remain.
 const second=path.join(out,'second.xlsx');await exportWorkbook(first,second);await loadWorkbook(second);
 assert.equal(await page.locator('#cp-proposed-row option').count(),existing+3);
 if(process.env.PLANNER_QA_DIR)await page.screenshot({path:path.join(process.env.PLANNER_QA_DIR,'proposed-training-import.png'),fullPage:true});
 await page.locator('#dialog [data-cp="close"]').click();
 if(await page.locator('.menu').getAttribute('open')===null)await page.locator('.menu > summary').click();await page.locator('[data-cp="proposed-export"]').first().click();
 await page.locator('#cp-proposed-file').setInputFiles(second);await page.locator('[data-cp="proposed-export-save"]').click();
 await page.locator('#dialog a[download]').waitFor();
 assert.ok((await page.locator('#dialog-content').innerText()).includes(`${existing+3} assignments (0 new; 1 updated)`));
 if(process.env.PLANNER_QA_DIR){fs.copyFileSync(second,path.join(process.env.PLANNER_QA_DIR,'proposed-training-roundtrip.xlsx'));}
});

test('proposals retained by catalogue refresh are reusable without choosing Excel again',async t=>{
 const os=require('node:os'),out=fs.mkdtempSync(path.join(os.tmpdir(),'planner-bundled-proposals-'));t.after(()=>fs.rmSync(out,{recursive:true,force:true}));
 const {PROPOSED_HEADERS,proposedRows}=await import('../public/proposed-training.js');
 const source=structuredClone(starter);component(source,'foundation').internal=[{id:'bundled',title:'Saved catalogue workshop',owner:'Trainer',hours:1,status:'Proposed',outcomes:'Teach the outcome',requirements:['N1.1']}];
 const rows=proposedRows(source,{requirements:[]});
 let html=fs.readFileSync(path.join(root,'Training-Planner.html'),'utf8');
 const marker='<script type="application/json" id="embedded-catalogue">',start=html.indexOf(marker)+marker.length,end=html.indexOf('</script>',start);
 const catalogue=JSON.parse(html.slice(start,end));catalogue.proposedTraining={formatVersion:1,columns:PROPOSED_HEADERS,rows};
 html=html.slice(0,start)+JSON.stringify(catalogue).replaceAll('<','\\u003c')+html.slice(end);
 const file=path.join(out,'Planner.html');fs.writeFileSync(file,html);
 const page=await fixture(t,()=>{},pathToFileURL(file).href);await open(page,'foundation');
 assert.equal(await own(page).locator('.internal-item').count(),0);
 await click(page,'proposed-import');await page.locator('[data-cp="proposed-bundled"]').click();
 assert.match(await page.locator('#cp-proposed-preview').innerText(),/Saved catalogue workshop/);
 await page.locator('[data-cp="proposed-import-save"]').click();
 assert.equal(component(await saved(page),'foundation').internal[0].id,'bundled');
});


test('maintained internal catalogue is searchable and assigns only to the chosen component',async t=>{
 const page=await fixture(t);await open(page,'l1');
 await page.locator('nav [data-cp="view"][data-id="catalogue"]').click();
 await page.locator('#cp-catalogue-kind').selectOption('internal');
 await page.locator('#cp-search').fill('AI use cases');
 const results=page.locator('#cp-catalogue-results');
 await results.getByText('AI use cases',{exact:true}).waitFor();
 assert.match(await results.innerText(),/N1.1, N1.2, N1.3/);
 await page.locator('#cp-candidate-component').selectOption('foundation');
 await click(page,'catalogue-internal-preview');
 assert.equal(await page.locator('#cp-proposed-target').inputValue(),'foundation');
 assert.match(await page.locator('#cp-proposed-preview').innerText(),/existing use in our organization/);
 await page.locator('[data-cp="proposed-import-save"]').click();
 const data=JSON.parse(fs.readFileSync(path.join(root,'public/data/catalogue.json'),'utf8'));
 const {proposedItem}=await import('../public/proposed-training.js');
 const actual=proposedItem(data.proposedTraining.rows[0]);
 assert.deepEqual(component(await saved(page),'foundation').internal,[actual]);
 for(const id of ['l1','l2','l3'])assert.deepEqual(component(await saved(page),id).internal,[]);
 await page.reload();await page.locator('#cp-target').waitFor();
 assert.deepEqual(component(await saved(page),'foundation').internal,[actual]);
 if(process.env.PLANNER_QA_DIR){await page.locator('nav [data-cp="view"][data-id="catalogue"]').click();await page.locator('#cp-catalogue-kind').selectOption('internal');await page.screenshot({path:path.join(process.env.PLANNER_QA_DIR,'internal-catalogue.png'),fullPage:true});}
});

test('specialisms expose the same pathway editor and recommendations as shared levels',async t=>{
 const page=await fixture(t);
 const specialisms=page.getByRole('region',{name:'Specialism pathways',exact:true});
 assert.equal(await specialisms.locator('.component-card').count(),17);
 const card=specialisms.locator('.component-card').filter({has:page.getByRole('heading',{name:'Vendor evaluation and tool selection',exact:true})});
 await card.getByRole('button',{name:'Review pathway →',exact:true}).click();
 assert.equal(await page.locator('#cp-target').inputValue(),'component:specialism-vendor-evaluation');
 await page.locator('#cp-budget').fill('8');await page.locator('#cp-budget').press('Tab');
 await click(page,'recommend');
 await page.locator('main [data-cp="apply"]').waitFor({timeout:25000});
 await click(page,'apply');
 let s=await saved(page);assert.ok(component(s,'specialism-vendor-evaluation').selected.length>0);
 assert.deepEqual(component(s,'foundation').selected,[]);
 await click(page,'internal-new');await fillBrief(page,'Vendor evaluation practice','N11.4');
 s=await saved(page);assert.equal(component(s,'specialism-vendor-evaluation').internal.length,1);
 await page.locator('nav [data-cp="view"][data-id="library"]').click();
 const roles=page.locator('#cp-specialism-role');
 for(const option of await roles.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value))){
  await page.locator('#cp-specialism-role').selectOption(option);
  assert.ok(await specialisms.locator('.component-card,.empty').count()>0);
 }
 if(process.env.PLANNER_QA_DIR){await page.locator('#cp-specialism-role').selectOption('');await specialisms.screenshot({path:path.join(process.env.PLANNER_QA_DIR,'specialism-pathways.png')});}
 await page.reload();await page.locator('#cp-target').waitFor();
 assert.deepEqual(await saved(page),s);
});

test('tool pathways find matching training, retain unknown time, and compose into audience paths',async t=>{
 const page=await fixture(t);
 await click(page,'tool-new');await page.locator('#cp-tool').fill('Claude');
 await page.locator('.cp-task[value="use"]').check();await page.locator('#cp-hours').fill('2');
 await page.locator('[data-cp="tool-save"]').click();await page.locator('#dialog').waitFor({state:'hidden'});
 let s=await saved(page);const tool=s.components.find(c=>c.category==='Tooling');
 assert.equal(tool.name,'Claude');assert.equal(tool.budget,2);
 assert.equal(await page.locator('main [data-cp="recommend"]').count(),0);
 await click(page,'tool-resources');
 assert.equal(await page.locator('#cp-tool-fit').inputValue(),'matching');
 const rows=page.locator('#cp-catalogue-results tbody tr');assert.ok(await rows.count()>0);
 assert.doesNotMatch(await page.locator('#cp-catalogue-results').innerText(),/GitHub Copilot/);
 const row=rows.filter({has:page.locator('[data-cp="preview"][data-id="TR-151"]')});
 assert.match(await row.innerText(),/Duration unresolved/);
 await row.locator('[data-cp="preview"]').click();assert.match(await page.locator('#dialog-content').innerText(),/budget fit unknown/);
 await page.locator('#dialog [data-cp="add"]').click();await page.locator('#dialog').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'← Back to pathway',exact:true}).click();await click(page,'internal-new');
 await page.locator('#cp-name').fill('Claude local practice');await page.locator('#cp-hours').fill('1');
 await page.locator('#cp-outcomes').fill('Use approved data and review the result.');await page.locator('[data-cp="internal-save"]').click();
 assert.match(await own(page).innerText(),/Claude local practice/);
 await page.locator('nav [data-cp="view"][data-id="audiences"]').click();
 await page.locator('[data-cp="audience-edit"][data-id="iam"]').click();
 await page.locator(`.cp-tool-component[value="${tool.id}"]`).check();await page.locator('[data-cp="audience-save"]').click();
 s=await saved(page);assert.ok(s.audiences.find(a=>a.id==='iam').components.includes(tool.id));
 assert.match(await page.locator('main .coverage-summary-footer').innerText(),/1 unresolved/);
 assert.deepEqual(component(s,'foundation').selected,[]);
 await open(page,tool.id);await click(page,'component-edit');
 await page.locator('#cp-tool').fill('No matching product');await page.locator('[data-cp="component-save"]').click();
 await click(page,'tool-resources');assert.match(await page.locator('#cp-catalogue-results').innerText(),/No resources match/);
 await page.locator('#cp-tool-fit').selectOption('all');assert.ok(await rows.count()>0);
 await page.reload();await page.locator('#cp-target').waitFor();await open(page,tool.id);
 assert.deepEqual(component(await saved(page),tool.id).selected,['TR-151']);
 assert.match(await own(page).innerText(),/Claude local practice/);
 if(process.env.PLANNER_QA_DIR){
  await click(page,'component-edit');await page.locator('#cp-tool').fill('Claude');await page.locator('[data-cp="component-save"]').click();
  await page.screenshot({path:path.join(process.env.PLANNER_QA_DIR,'tool-pathway.png'),fullPage:true});
  await click(page,'tool-resources');await page.screenshot({path:path.join(process.env.PLANNER_QA_DIR,'tool-pathway-resources.png'),fullPage:true});
 }

});
