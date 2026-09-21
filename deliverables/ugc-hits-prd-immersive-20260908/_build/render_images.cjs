const fs=require('fs');const path=require('path');const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.dirname(__dirname);
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1200,height:760},deviceScaleFactor:2});const results=[];
for(const name of JSON.parse(fs.readFileSync(path.join(__dirname,'screens.json'),'utf8'))){
 await page.goto(pathToFileURL(path.join(__dirname,name+'.html')).href);await page.evaluate(()=>document.fonts.ready);
 const qa=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,overflow:[...document.querySelectorAll('.modal,.caption,.panel')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)}));
 await page.screenshot({path:path.join(root,'prototypes',name+'.png')});results.push({name,...qa});}
fs.writeFileSync(path.join(__dirname,'screen_qa.json'),JSON.stringify(results,null,2));console.log(results);await browser.close();})();
