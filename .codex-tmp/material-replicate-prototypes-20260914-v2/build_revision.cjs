const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const previous = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260914';
const out = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260914-v2';
const pages = [
  { name: '01_拆解分析结果', title: '拆解分析结果', kind: 'analysis', count: 7 },
  { name: '02_复刻第二步_爆款拆解结果', title: '爆款拆解结果', kind: 'source', count: 7 },
  { name: '03_复刻第四步_脚本结果', title: '脚本结果', kind: 'script', count: 6 }
];

// This English line illustrates the requested original-language field. The supplied
// source screenshots do not contain an un-translated voiceover transcript.
const sourceVoiceoverExample = 'The best polo shirt set you can find.';
const sourceSpeechSegments = ['The best polo shirt set', 'you can find.'];
const scriptSpeechSegments = ['The ultimate performance polo with moisture wicking', 'and UPF 30+ protection.'];
const annotation = '原型说明：此处原片口播采用英文示例；真实结果展示识别出的原语言文本。';

const overrides = `
.stage-workspace{grid-template-columns:200px minmax(0,1fr);gap:18px}
.stage-list{gap:9px}
.stage-row,.source-grid .stage-row,.script-workspace .stage-row{min-height:50px;padding:13px 15px;display:flex;align-items:center}
.stage-top{display:flex!important;flex-wrap:nowrap!important;justify-content:space-between;width:100%;gap:12px!important}
.stage-name{white-space:nowrap;font-size:13px}
.stage-time,.source-grid .stage-top .stage-time,.script-workspace .stage-time{margin-left:auto;white-space:nowrap;font-size:11px}
.detail{min-height:0}
.detail .voice-text{font-family:Arial,"Microsoft YaHei",sans-serif;font-size:19px!important;font-weight:400;line-height:1.8!important;max-width:none}
.analysis-grid .detail{padding:24px 25px}
.analysis-grid .detail .field+.field{padding-top:23px;margin-top:23px}
.timed-description{display:flex;flex-direction:column;gap:15px;font-size:14px;line-height:1.95;color:#35423a}
.timed-row{display:grid;grid-template-columns:70px minmax(0,1fr);gap:12px;align-items:baseline}
.timestamp{font-size:12px;line-height:1.95;color:#8b9a7e;font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:500}
.timed-copy{margin:0;overflow-wrap:anywhere;line-height:1.95;font-size:14px}
.source-grid .stage-workspace{grid-template-columns:185px minmax(0,1fr)}
.source-grid .detail{padding:22px 26px}
.source-grid .stage-name{font-size:13px}
.shot-head{padding:0 0 12px;margin:0 0 17px;gap:10px}
.shot-head h3{font-size:14px}
.shot-head .shot-time{margin-left:auto;color:#8fa080;font-size:12px}
.shot-section+.shot-section{border-top:1px solid #e0e8d7;margin-top:26px;padding-top:22px}
.shot-section .field+.field{margin-top:17px!important;padding-top:16px!important;border-top:1px solid #edf1e8}
.shot-section .field-label{font-size:12px;margin-bottom:7px}
.shot-section .voice-text{font-size:18px!important;line-height:1.8!important}
.multi-shot>.section-head{margin-bottom:21px}
.multi-shot>.section-head h2{font-size:15px;gap:8px}
.multi-shot>.section-head .icon-tile{width:26px;height:26px;border-radius:7px}
.multi-shot>.section-head .icon-tile svg{width:15px;height:15px}
.source-grid .timeline-labeled{margin-bottom:0}
.prototype-note{font-size:11px;color:#84917d;line-height:1.8;margin-top:16px;padding:0 2px}
.script-workspace{grid-template-columns:260px minmax(0,1fr)}
.script-workspace .stage-row{min-height:55px;padding:15px 17px}
.script-workspace .stage-name{font-size:14px}
.script-workspace .detail{padding:24px 28px}
.script-workspace .keywords{padding-bottom:19px;margin-bottom:22px}
.script-workspace .shot-section .voice-text{font-size:20px!important}
.script-workspace .shot-section+.shot-section{margin-top:23px;padding-top:21px}
.script-workspace .timed-row{grid-template-columns:72px minmax(0,1fr)}
.account{margin-top:275px}
@media(max-width:1500px){
  .stage-workspace{grid-template-columns:183px minmax(0,1fr);gap:14px}
  .stage-row,.source-grid .stage-row{padding:12px}
  .stage-name{font-size:12px}
  .stage-time{font-size:10px}
  .source-grid .stage-workspace{grid-template-columns:165px minmax(0,1fr);gap:14px}
  .source-grid .stage-name{font-size:12px}
  .source-grid .stage-time{font-size:10px}
  .source-grid .detail{padding:20px}
  .timed-row{grid-template-columns:58px minmax(0,1fr);gap:9px}
  .timed-copy{font-size:13px}
  .script-workspace{grid-template-columns:220px minmax(0,1fr);gap:18px}
  .script-workspace .stage-row{padding:13px}
  .script-workspace .stage-name{font-size:13px}
  .script-workspace .detail{padding:22px}
}
`;

fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const reports = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1800, height: 1100 }, deviceScaleFactor: 1 });
    for (const p of pages) {
      await page.goto(pathToFileURL(path.join(previous, p.name + '.html')).href);
      const report = await page.evaluate(({ kind, overrides, sourceVoiceoverExample, sourceSpeechSegments, scriptSpeechSegments, annotation }) => {
        const el = (tag, className, content) => {
          const node = document.createElement(tag);
          if (className) node.className = className;
          if (content !== undefined) node.textContent = content;
          return node;
        };
        const getValue = key => document.querySelector(`[data-verify="${key}"]`)?.textContent;
        const originalVisual = getValue(kind === 'script' ? 'newVisual' : 'visual');
        const originalScriptSpeech = getValue('scriptSpeech');
        const unchangedIds = kind === 'analysis' ? ['strategy','audience','prompt'] : kind === 'source' ? ['strategy','audience'] : ['newStrategy'];
        const unchangedBefore = Object.fromEntries(unchangedIds.map(id=>[id,getValue(id)]));
        const recommendationsBefore = kind==='analysis' ? [...document.querySelectorAll('.suggestions,.creative-grid')].map(n=>n.textContent) : null;
        const style = el('style','',overrides);
        document.head.append(style);
        document.title += ' · 调整版 V2';
        const normalizedTime = value => value.replace(/[–~～]/g,'-').replace(/秒|岁/g,'s');

        document.querySelectorAll('.stage-time,.shot-time').forEach(n=>{n.textContent=normalizedTime(n.textContent);});
        document.querySelectorAll('.stage-row').forEach(row=>{
          row.querySelector('.seq')?.remove();
          row.querySelector('.stage-purpose')?.remove();
          const top = row.querySelector('.stage-top');
          const time = row.querySelector('.stage-time');
          if(time && time.parentElement!==top)top.append(time);
        });
        document.querySelectorAll('.translation').forEach(n=>n.remove());

        // Keep every clause after its original time marker. Only the time notation
        // and row layout change; no visual wording is summarized or re-written.
        const parts = [...originalVisual.matchAll(/(\d+(?:\.\d+)?)~(\d+(?:\.\d+)?)秒，([\s\S]*?)(?=\d+(?:\.\d+)?~\d+(?:\.\d+)?秒，|$)/g)].map(m=>({start:m[1],end:m[2],copy:m[3]}));
        if(parts.length!==2)throw Error('Expected two timestamped visual clauses');
        if(parts.map(s=>`${s.start}~${s.end}秒，${s.copy}`).join('')!==originalVisual)throw Error('Timestamp parsing discarded source text');
        const visualField = (rows, id) => {
          const field = el('div','field visual-field');
          field.append(el('div','field-label',kind==='analysis'?'视觉描述':'画面内容'));
          const description=el('div','timed-description');
          description.dataset.visual=id;
          for(const row of rows){
            const line=el('div','timed-row');
            line.append(el('span','timestamp',`${row.start}-${row.end}s`),el('p','timed-copy',row.copy));
            description.append(line);
          }
          field.append(description);
          return field;
        };
        const speechField = (text,id) => {
          const field=el('div','field voice');
          field.append(el('div','field-label',kind==='analysis'?'旁白':'口播内容'));
          const value=el('p','field-value voice-text',text);
          value.dataset.verify=id;
          field.append(value);
          return field;
        };

        const detail=document.querySelector('.detail');
        if(kind==='analysis'){
          detail.replaceChildren(speechField(sourceVoiceoverExample,'narration'),visualField(parts,'analysisVisual'));
        }else{
          const keywords = detail.querySelector('.keywords');
          detail.replaceChildren();
          if(keywords)detail.append(keywords);
          detail.classList.add('multi-shot');
          const sectionTitle=el('div','section-head');
          sectionTitle.append(el('h2','','分镜'));
          detail.append(sectionTitle);
          parts.forEach((part,i)=>{
            const section=el('section','shot-section');
            section.dataset.shot=String(i+1);
            const head=el('div','shot-head');
            head.append(el('h3','',`分镜 ${i+1}`),el('span','shot-time',`${part.start}-${part.end}s`));
            section.append(head,speechField((kind==='source'?sourceSpeechSegments:scriptSpeechSegments)[i],`${kind}Speech${i+1}`),visualField([part],`${kind}Visual${i+1}`));
            detail.append(section);
          });
        }
        if(kind==='source'){
          document.querySelectorAll('.prompt,.entities').forEach(n=>n.remove());
        }
        if(kind==='script'){
          const model = [...document.querySelectorAll('.setting')].find(n=>n.textContent.includes('种子舞'));
          const textNode=[...model.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
          textNode.textContent='Seedance2.0';
          document.querySelector('.script-summary .count').textContent='6 个叙事阶段 · 7 个分镜';
          if(scriptSpeechSegments.join(' ')!==originalScriptSpeech)throw Error('English script narration was changed');
        }else{
          const note=el('p','prototype-note',annotation);
          if(kind==='analysis')document.querySelector('.main').append(note);
          else document.querySelector('.workspace-shell').after(note);
        }
        const unchangedAfter=Object.fromEntries(unchangedIds.map(id=>[id,getValue(id)]));
        if(JSON.stringify(unchangedBefore)!==JSON.stringify(unchangedAfter))throw Error('Unrelated field changed');
        if(recommendationsBefore && JSON.stringify(recommendationsBefore)!==JSON.stringify([...document.querySelectorAll('.suggestions,.creative-grid')].map(n=>n.textContent)))throw Error('Analysis recommendations changed');
        const renderedClauses=[...document.querySelectorAll('.timed-copy')].map(n=>n.textContent);
        if(JSON.stringify(renderedClauses)!==JSON.stringify(parts.map(x=>x.copy)))throw Error('Visual clauses changed');
        return {kind,unchangedIds,visualClausesPreserved:true,timestampRows:parts.length,shotCount:document.querySelectorAll('.shot-section').length,sourceVoiceover:kind==='script'?'existing English script, split between two shots':'explicitly labeled English example, original transcript unavailable'};
      }, {kind:p.kind,overrides,sourceVoiceoverExample,sourceSpeechSegments,scriptSpeechSegments,annotation});

      const html='<!doctype html>\n'+await page.locator('html').evaluate(n=>n.outerHTML);
      fs.writeFileSync(path.join(out,p.name+'.html'),html,'utf8');
      await page.goto(pathToFileURL(path.join(out,p.name+'.html')).href);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(n=>n.decode()));});
      const check = await page.evaluate(kind=>{
        const labels=[...document.querySelectorAll('.field-label')].map(n=>n.textContent);
        const removed=['为什么有效','口播翻译'];
        if(labels.some(l=>removed.includes(l)))throw Error('Removed field still present');
        if(document.querySelector('.seq,.stage-purpose,.translation'))throw Error('Red-marked content still present');
        if(kind==='source'&&document.querySelector('.prompt,.entities'))throw Error('Unwanted source module remains');
        if(kind==='analysis'&&(!document.querySelector('.prompt')||document.querySelectorAll('.suggestion').length!==3||document.querySelectorAll('.creative').length!==3))throw Error('Analysis module missing');
        if(kind==='script'&&(!document.body.innerText.includes('Seedance2.0')||document.body.innerText.includes('种子舞')))throw Error('Model label incorrect');
        if(kind!=='analysis'&&document.querySelectorAll('.shot-section').length!==2)throw Error('Two-shot example missing');
        const voices=[...document.querySelectorAll('.voice-text')].map(n=>{const s=getComputedStyle(n);return{text:n.textContent,background:s.backgroundColor,border:s.borderTopWidth,padding:s.padding};});
        if(voices.some(v=>v.background!=='rgba(0, 0, 0, 0)'||v.border!=='0px'||v.padding!=='0px'))throw Error('Narration rendered as a box');
        if(document.querySelector('input,textarea'))throw Error('Unexpected editable controls');
        return {voices,stageCount:document.querySelectorAll('.stage-row').length};
      },p.kind);
      if(check.stageCount!==p.count)throw Error('Stage records removed');
      const geometry=[];
      for(const width of [1800,1366]){
        await page.setViewportSize({width,height:1100});
        geometry.push(await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,brokenImages:[...document.images].filter(n=>!n.naturalWidth).length,overflow:[...document.querySelectorAll('.timed-copy,.voice-text,.stage-top,.stage-time')].filter(n=>n.scrollWidth>n.clientWidth+1).map(n=>n.className),stageNamesAndTimesInline:[...document.querySelectorAll('.stage-row')].every(n=>{const name=n.querySelector('.stage-name').getBoundingClientRect(),time=n.querySelector('.stage-time').getBoundingClientRect();return Math.abs(name.top+name.height/2-time.top-time.height/2)<2;})})));
      }
      if(geometry.some(g=>g.width>g.viewport||g.brokenImages||g.overflow.length||!g.stageNamesAndTimesInline))throw Error('Layout check failed: '+JSON.stringify(geometry));
      await page.setViewportSize({width:1800,height:1100});
      await page.screenshot({path:path.join(out,p.name+'.png'),fullPage:true});
      reports.push({...p,...report,...check,geometry});
    }
    fs.writeFileSync(path.join(out,'字段与布局核对.json'),JSON.stringify({version:'V2',source:previous,pages:reports},null,2),'utf8');
    fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>结果页面原型 V2</title><style>body{font:16px/1.8 'Microsoft YaHei',sans-serif;background:#f2f6eb;margin:60px;color:#263829}h1{font-size:26px}a{color:#28704f}li{margin:24px 0}</style><h1>结果页面原型 V2</h1><p>按最新标注删减字段；时间戳分行；两个复刻结果页均含一个阶段、两个分镜的展示示例。</p><p>${annotation}</p><ol>${pages.map(p=>`<li><a href="${p.name}.html">${p.title} · HTML</a>　<a href="${p.name}.png">完整原型图 · PNG</a></li>`).join('')}</ol></html>`,'utf8');
    console.log(JSON.stringify({output:out,pages:reports},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
