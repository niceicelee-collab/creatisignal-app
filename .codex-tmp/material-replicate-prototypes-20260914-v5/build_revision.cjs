const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source='D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260914-v4';
const out='D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260914-v5';
const pages=[['01_拆解分析结果','拆解分析结果'],['02_复刻第二步_爆款拆解结果','爆款拆解结果'],['03_复刻第四步_脚本结果','脚本结果']];
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const reports=[];
  try{
    const page=await browser.newPage({viewport:{width:1800,height:1100},deviceScaleFactor:1});
    for(const [name] of pages){
      await page.goto(pathToFileURL(path.join(source,name+'.html')).href);
      const before=await page.locator('body').textContent();
      await page.evaluate(()=>{
        const style=document.createElement('style');
        style.textContent='.detail .field.voice + .field.visual-field{border-top:0!important}';
        document.head.append(style);
        document.title=document.title.replace('V4','V5');
      });
      fs.writeFileSync(path.join(out,name+'.html'),'<!doctype html>\n'+await page.locator('html').evaluate(n=>n.outerHTML),'utf8');
      await page.goto(pathToFileURL(path.join(out,name+'.html')).href);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(n=>n.decode()));});
      if(await page.locator('body').textContent()!==before)throw Error('Text changed');
      const checked=await page.evaluate(()=>({
        removedLines:[...document.querySelectorAll('.voice + .visual-field')].map(n=>getComputedStyle(n).borderTopWidth),
        groupDividers:[...document.querySelectorAll('.shot-section + .shot-section')].map(n=>getComputedStyle(n).borderTopWidth),
        width:document.documentElement.scrollWidth,viewport:innerWidth,
        brokenImages:[...document.images].filter(n=>!n.naturalWidth).length
      }));
      if(!checked.removedLines.length||checked.removedLines.some(n=>n!=='0px')||checked.groupDividers.some(n=>n!=='1px')||checked.width>checked.viewport||checked.brokenImages)throw Error('Visual check failed');
      await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
      reports.push({page:name,textUnchanged:true,...checked});
    }
    fs.writeFileSync(path.join(out,'字段与布局核对.json'),JSON.stringify({version:'V5',pages:reports},null,2),'utf8');
    fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>结果页面原型 V5</title><style>body{font:16px/1.8 'Microsoft YaHei',sans-serif;background:#f2f6eb;margin:60px;color:#263829}h1{font-size:26px}a{color:#28704f}li{margin:24px 0}</style><h1>结果页面原型 V5</h1><p>已删除三张原型中口播下方的横线。</p><p>原片口播仍为标注过的英文示例。</p><ol>${pages.map(([name,title])=>`<li><a href="${name}.html">${title} · HTML</a>　<a href="${name}.png">完整原型图 · PNG</a></li>`).join('')}</ol></html>`,'utf8');
    console.log(JSON.stringify({out,reports},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
