const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const previous = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260914-v2';
const out = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260914-v3';
const pages = [
  { name: '01_拆解分析结果', title: '拆解分析结果', shots: 0 },
  { name: '02_复刻第二步_爆款拆解结果', title: '爆款拆解结果', shots: 2 },
  { name: '03_复刻第四步_脚本结果', title: '脚本结果', shots: 2 }
];
const css = `
.detail .field.voice{display:flex;flex-wrap:nowrap;align-items:baseline;gap:15px}
.detail .field.voice>.field-label{flex:none;white-space:nowrap;margin:0;line-height:1.8}
.detail .field.voice>.voice-text{flex:1;min-width:0;margin:0}
`;
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const reports = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1800, height: 1100 }, deviceScaleFactor: 1 });
    for (const p of pages) {
      await page.goto(pathToFileURL(path.join(previous, p.name + '.html')).href);
      const expected = await page.evaluate(css => {
        const fieldsBefore = [...document.querySelectorAll('.field,.stage-row,.keywords,.shot-head,.prompt,.suggestions,.creative-grid,.script-summary .count')].map(n=>n.textContent);
        let removed = 0;
        document.querySelectorAll('.multi-shot > .section-head').forEach(n => {
          if (n.querySelector('h2')?.textContent.trim() === '分镜') { n.remove(); removed++; }
        });
        const style = document.createElement('style');
        style.textContent = css;
        document.head.append(style);
        document.title = document.title.replace('V2','V3');
        const fieldsAfter = [...document.querySelectorAll('.field,.stage-row,.keywords,.shot-head,.prompt,.suggestions,.creative-grid,.script-summary .count')].map(n=>n.textContent);
        if(JSON.stringify(fieldsBefore)!==JSON.stringify(fieldsAfter))throw Error('Retained text changed');
        return { removed, bodyText:document.body.textContent, fieldsPreserved:true };
      },css);
      if(expected.removed!==(p.shots?1:0))throw Error('Unexpected removed heading count');
      fs.writeFileSync(path.join(out,p.name+'.html'),'<!doctype html>\n'+await page.locator('html').evaluate(n=>n.outerHTML),'utf8');
      await page.goto(pathToFileURL(path.join(out,p.name+'.html')).href);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(n=>n.decode()));});
      if(await page.locator('body').textContent()!==expected.bodyText)throw Error('Saved text changed');
      if(await page.locator('.shot-section').count()!==p.shots)throw Error('Shot headings removed');
      const geometry=[];
      for(const width of [1800,1366]){
        await page.setViewportSize({width,height:1100});
        const result=await page.evaluate(()=>({
          viewport:innerWidth,width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
          brokenImages:[...document.images].filter(n=>!n.naturalWidth).length,
          voiceRows:[...document.querySelectorAll('.field.voice')].map(n=>{
            const label=n.querySelector('.field-label'),voice=n.querySelector('.voice-text');
            const a=label.getBoundingClientRect(),b=voice.getBoundingClientRect(),s=getComputedStyle(voice);
            const range=document.createRange();range.selectNodeContents(voice);
            return {label:label.textContent,text:voice.textContent,labelBeforeContent:a.right<=b.left,verticalOverlap:a.top<b.bottom&&b.top<a.bottom,singleLine:range.getClientRects().length===1,overflow:voice.scrollWidth>voice.clientWidth+1,background:s.backgroundColor,border:s.borderTopWidth,padding:s.padding};
          })
        }));
        if(result.width>result.viewport||result.brokenImages||result.voiceRows.some(r=>!r.labelBeforeContent||!r.verticalOverlap||!r.singleLine||r.overflow||r.border!=='0px'||r.background!=='rgba(0, 0, 0, 0)'||r.padding!=='0px'))throw Error('Inline narration check failed: '+JSON.stringify(result));
        geometry.push(result);
      }
      await page.setViewportSize({width:1800,height:1100});
      await page.screenshot({path:path.join(out,p.name+'.png'),fullPage:true});
      reports.push({page:p.name,removedHeading:expected.removed,retainedTextUnchanged:true,shots:p.shots,geometry});
    }
    fs.writeFileSync(path.join(out,'字段与布局核对.json'),JSON.stringify({version:'V3',source:previous,pages:reports},null,2),'utf8');
    fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>结果页面原型 V3</title><style>body{font:16px/1.8 'Microsoft YaHei',sans-serif;background:#f2f6eb;margin:60px;color:#263829}h1{font-size:26px}a{color:#28704f}li{margin:24px 0}</style><h1>结果页面原型 V3</h1><p>已删除两个复刻结果页中独立的“分镜”大标题；旁白标签与内容同排显示。</p><p>原片口播仍为标注过的英文示例。</p><ol>${pages.map(p=>`<li><a href="${p.name}.html">${p.title} · HTML</a>　<a href="${p.name}.png">完整原型图 · PNG</a></li>`).join('')}</ol></html>`,'utf8');
    console.log(JSON.stringify({output:out,pages:reports},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
