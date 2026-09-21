const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.dirname(__dirname);
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1200,height:760},deviceScaleFactor:2});
 if(process.argv.includes('--screens')){
  const names=JSON.parse(fs.readFileSync(path.join(__dirname,'screens.json'),'utf8'));
  const report=[];
  for(const name of names){
   await page.goto(pathToFileURL(path.join(__dirname,name+'.html')).href);await page.evaluate(()=>document.fonts.ready);
   const result=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,overflow:[...document.querySelectorAll('.cardbody,.panel,.modal,.content')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className),bottom:document.querySelector('.content').getBoundingClientRect().bottom}));
   await page.screenshot({path:path.join(root,'prototypes',name+'.png')});report.push({name,...result});
  }
  fs.writeFileSync(path.join(__dirname,'screen_qa.json'),JSON.stringify(report,null,2));console.log(report);
 }
 if(process.argv.includes('--pdf')){
  await page.goto(pathToFileURL(path.join(__dirname,'document.html')).href);await page.evaluate(()=>document.fonts.ready);
  await page.emulateMedia({media:'print'});
  const measurements=await page.evaluate(()=>[...document.querySelectorAll('.page')].map((p,i)=>{const b=p.querySelector('.pagebody').getBoundingClientRect();const f=p.querySelector('footer').getBoundingClientRect();return{page:i+1,title:p.querySelector('h1').textContent,bottom:b.bottom-p.getBoundingClientRect().top,available:f.top-p.getBoundingClientRect().top,overflow:b.bottom>f.top-10}}));
  fs.writeFileSync(path.join(__dirname,'document_qa.json'),JSON.stringify(measurements,null,2));console.log(measurements.filter(x=>x.overflow));
  await page.pdf({path:path.join(root,'UGC爆款_产品需求文档_V1.0.pdf'),printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
