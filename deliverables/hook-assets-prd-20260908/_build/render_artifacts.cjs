const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.dirname(__dirname);
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1200,height:740},deviceScaleFactor:2});
 if(process.argv.includes('--screens')){
  const names=JSON.parse(fs.readFileSync(path.join(__dirname,'screens.json'),'utf8'));const report=[];
  for(const name of names){
   await page.goto(pathToFileURL(path.join(__dirname,name+'.html')).href);await page.evaluate(()=>document.fonts.ready);
   const result=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,overflow:[...document.querySelectorAll('.panel,.field,.content,.cardbody')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className),bottom:document.querySelector('.content').getBoundingClientRect().bottom}));
   await page.screenshot({path:path.join(root,'prototypes',name+'.png')});report.push({name,...result});
  }
  fs.writeFileSync(path.join(__dirname,'screen_qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }
 if(process.argv.includes('--pdf')){
  await page.goto(pathToFileURL(path.join(root,'Hook资产_产品需求文档_V1.0.html')).href);await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'print'});
  const report=await page.evaluate(()=>[...document.querySelectorAll('.page')].map((p,i)=>{const b=p.querySelector('.pagebody').getBoundingClientRect(),f=p.querySelector('footer').getBoundingClientRect(),t=p.getBoundingClientRect();return{page:i+1,title:p.querySelector('h1').textContent,bottom:b.bottom-t.top,available:f.top-t.top,overflow:b.bottom>f.top-10}}));
  fs.writeFileSync(path.join(__dirname,'document_qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pages:report.length,overflow:report.filter(x=>x.overflow)}));
  await page.pdf({path:path.join(root,'Hook资产_产品需求文档_V1.0.pdf'),printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
 }
 if(process.argv.includes('--gallery')){
  await page.goto(pathToFileURL(path.join(root,'Hook资产_功能原型浏览.html')).href);
  await page.getByRole('button',{name:'F08 换上你的人物和产品'}).click();
  console.log(JSON.stringify({galleryButtons:await page.getByRole('button').count(),selectedImage:await page.locator('#screen').getAttribute('alt')}));
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
