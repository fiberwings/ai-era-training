import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url).pathname;
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
for(const [label,file] of [['planner','training-planner/Training-Planner.html'],['learner','learning-path/index.html']]){
 await page.goto('file://'+root+file);
 await page.waitForTimeout(1200);
 await page.screenshot({path:root+`.catalogue-v12/${label}.png`});
 console.log(label,await page.title());
}
await browser.close();
await fs.writeFile(root+'.catalogue-v12/browser-verification.json',JSON.stringify({errors},null,2));
if(errors.length)throw Error(errors.join('\n'));
