const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const previous = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260914-v3';
const out = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260914-v4';
const pages = [
  { name:'01_拆解分析结果', title:'拆解分析结果', groups:0 },
  { name:'02_复刻第二步_爆款拆解结果', title:'爆款拆解结果', groups:2 },
  { name:'03_复刻第四步_脚本结果', title:'脚本结果', groups:2 }
];
fs.mkdirSync(out,{recursive:true});

(async()=>{
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const reports=[];
  try{
    const page=await browser.newPage({viewport:{width:1800,height:1100},deviceScaleFactor:1});
    for(const p of pages){
      await page.goto(pathToFileURL(path.join(previous,p.name+'.html')).href);
      const expected=await page.evaluate(()=>{
        const selector='.field-value,.timed-copy,.timestamp,.stage-row,.keywords,.prompt,.suggestions,.creative-grid,.script-summary .count';
        const before=[...document.querySelectorAll(selector)].map(n=>n.textContent);
        const labels={'口播内容':'口播','旁白':'口播','视觉描述':'画面','画面内容':'画面'};
        const renamed=[];
        document.querySelectorAll('.detail .field-label').forEach(n=>{
          const original=n.textContent.trim();
          if(labels[original]){n.textContent=labels[original];renamed.push({from:original,to:labels[original]});}
        });
        let removedHeaders=0;
        document.querySelectorAll('.multi-shot .shot-head').forEach(n=>{n.remove();removedHeaders++;});
        document.title=document.title.replace('V3','V4');
        const after=[...document.querySelectorAll(selector)].map(n=>n.textContent);
        if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Retained field values changed');
        return {renamed,removedHeaders,bodyText:document.body.textContent,retainedTextUnchanged:true};
      });
      if(expected.removedHeaders!==p.groups)throw Error('Wrong removed header count');
      fs.writeFileSync(path.join(out,p.name+'.html'),'<!doctype html>\n'+await page.locator('html').evaluate(n=>n.outerHTML),'utf8');
      await page.goto(pathToFileURL(path.join(out,p.name+'.html')).href);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(n=>n.decode()));});
      if(await page.locator('body').textContent()!==expected.bodyText)throw Error('Saved text mismatch');
      if(await page.locator('.shot-section').count()!==p.groups)throw Error('Content group lost');
      const labels=await page.locator('.detail .field-label').allTextContents();
      if(labels.some(v=>['口播内容','旁白','视觉描述','画面内容'].includes(v)))throw Error('Old field label remains');
      if(await page.locator('.shot-head,.shot-time').count())throw Error('Repeated header/timestamp remains');
      if(await page.locator('.timestamp').count()!==2)throw Error('Visual timestamps lost');
      const geometry=[];
      for(const width of [1800,1366]){
        await page.setViewportSize({width,height:1100});
        geometry.push(await page.evaluate(()=>({
          viewport:innerWidth,width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
          brokenImages:[...document.images].filter(n=>!n.naturalWidth).length,
          overflow:[...document.querySelectorAll('.voice-text,.timed-copy')].some(n=>n.scrollWidth>n.clientWidth+1),
          speechInline:[...document.querySelectorAll('.field.voice')].every(n=>{
            const label=n.querySelector('.field-label').getBoundingClientRect(),value=n.querySelector('.voice-text').getBoundingClientRect();
            return label.right<=value.left&&label.top<value.bottom&&value.top<label.bottom;
          })
        })));
      }
      if(geometry.some(g=>g.width>g.viewport||g.brokenImages||g.overflow||!g.speechInline))throw Error('Layout issue: '+JSON.stringify(geometry));
      await page.setViewportSize({width:1800,height:1100});
      await page.screenshot({path:path.join(out,p.name+'.png'),fullPage:true});
      reports.push({page:p.name,renamed:expected.renamed,removedHeaders:expected.removedHeaders,retainedTextUnchanged:true,groups:p.groups,geometry});
    }
    fs.writeFileSync(path.join(out,'字段与布局核对.json'),JSON.stringify({version:'V4',source:previous,pages:reports},null,2),'utf8');
    fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>结果页面原型 V4</title><style>body{font:16px/1.8 'Microsoft YaHei',sans-serif;background:#f2f6eb;margin:60px;color:#263829}h1{font-size:26px}a{color:#28704f}li{margin:24px 0}</style><h1>结果页面原型 V4</h1><p>字段统一为“口播”和“画面”；已移除分镜编号标题及右上角重复时间，保留画面中的时间戳。</p><p>原片口播仍为标注过的英文示例。</p><ol>${pages.map(p=>`<li><a href="${p.name}.html">${p.title} · HTML</a>　<a href="${p.name}.png">完整原型图 · PNG</a></li>`).join('')}</ol></html>`,'utf8');
    console.log(JSON.stringify({output:out,pages:reports},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
