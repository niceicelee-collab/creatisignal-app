const fs = require('fs');
const path = require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root='D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260911';
const name='拆解结果_保留旁白与提示词反推';
const sourcePath='C:/Users/ice.li/AppData/Local/Temp/codex-clipboard-6a803aeb-649a-4020-9df8-0a21522d5c35.png';
const source=fs.readFileSync(sourcePath);
const sourceWidth=source.readUInt32BE(16);
const original={
  title:'牛仔裤动态复刻',
  overall:'纯视觉展示+情绪BGM驱动，通过多模特动态对比传递产品审美价值。',
  audience:'追求时尚穿搭与身材修饰效果的年轻女性消费者。',
  why:'利用高颜值模特与精致刺绣细节的视觉反差，在黄金三秒内建立时尚审美吸引力。',
  narration:'"And I hope you cry for me"',
  prompt:'竖版9:16广告，白色摄影棚，时尚清新。0-2.5秒：全景平视静止，金发女穿白T恤和蝴蝶结刺绣牛仔裤背对镜头，双手插兜展示细节后转身微笑；旁白：And I hope you cry for me。2.5-4.8秒：中景平视静止，黑发女坐藤椅穿白T恤经典高腰牛仔裤，双手交叠看镜头；旁白：like I cry for you。4.8-7秒：全景平视静止，两女并排站立，随音乐轻摆展示裤型动态；旁白：Every night for you。7-11秒：前段同上，后切特写低角度缓慢推近，黑发女侧身拉扯牛仔裤后腰展示弹性及品牌标；旁白：Take it easy on me baby cause I tried with you。保持画面连续、光影与物理效果真实、动作流畅。',
  video:'0~3秒，全景，平视，静止机位，全身可见，金发女性身穿白色短袖紧身T恤和蝴蝶结刺绣牛仔裤背对镜头站立，双手插在后袋展示粉色蝴蝶结刺绣细节，随后转身面向镜头微笑',
  scenes:[['Hook 钩子','0.0–2.5s'],['产品特点','2.5–4.8s'],['场景应用','4.8–7.0s'],['产品特点','7.0–11.0s']],
};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const field=(label,value,cls='')=>`<div class="field ${cls}"><div class="field-label">${label}</div><div class="field-value">${esc(value)}</div></div>`;
const base=fs.readFileSync(path.join(root,'爆款视频拆解结果.html'),'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];
const symbols={
  back:'<path d="m12 5-7 7 7 7M5 12h14"/>',
  magic:'<path d="m5 19 11-11 3 3L8 22zM15 3v3M5 5v4M3 7h4M21 4v4M19 6h4"/>',
  share:'<circle cx="6" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 10 6-3M9 14l6 3"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
};
const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[n]}</svg>`;
const css=`
${base}
.prompt-card{margin-top:22px;border:1px solid #e0e6e1;border-radius:11px;background:#fff;padding:16px}.prompt-head{display:flex;align-items:center;gap:7px;justify-content:space-between}.prompt-head h2{display:flex;align-items:center;gap:7px;margin:0;font-size:13px;white-space:nowrap}.prompt-head .block-icon{width:26px;height:26px;border-radius:7px}.prompt-head .block-icon svg{width:14px;height:14px}.prompt-actions{display:flex;align-items:center;gap:5px}.prompt-actions .control{min-height:27px;padding:0 7px;font-size:10px;gap:4px;border-radius:5px}.prompt-actions .control svg{width:11px;height:11px}.prompt-language span{font-size:10px;color:#8c998b}.prompt-text{margin:15px 0 0;font-size:12px;line-height:1.85;color:#7e8980;overflow-wrap:anywhere}
body{background:linear-gradient(135deg,#eff4e7,#edf7f3 35%,#f4f5f5 80%)}.analysis-window{margin:32px auto;width:calc(100% - 64px);max-width:1500px;border-radius:20px;background:#fff;min-height:914px;overflow:hidden;border:1px solid #edf0ed;box-shadow:0 14px 60px #1d312405}.analysis-bar{height:72px;padding:0 27px;border-bottom:1px solid #e2e7e3;display:flex;align-items:center;justify-content:space-between;gap:20px}.analysis-meta{display:flex;align-items:center;gap:13px}.analysis-meta .back{color:#819087;display:flex;margin-right:7px}.analysis-meta h1{font-size:19px;margin:0;font-weight:700;white-space:nowrap}.status{font-size:11px;padding:4px 8px;color:#209a67;border-radius:7px;background:#effaee}.category{font-size:11px;padding:5px 10px;border-radius:20px;color:#78905d;background:#f5faed}.meta-detail{font-size:11px;color:#97a098;display:flex;gap:12px;align-items:center}.meta-detail i{font-style:normal;color:#c5ccc5}.analysis-actions{display:flex;align-items:center;gap:10px}.analysis-actions .control{min-height:33px}.analysis-actions .plain{border:none}.analysis-actions .primary{padding:0 12px;font-size:12px}.analysis-actions .primary svg{order:0}.analysis-main{padding:27px;display:grid;grid-template-columns:316px minmax(0,1fr);gap:27px;align-items:start}.analysis-reference{min-width:0}.analysis-video{width:100%;aspect-ratio:420/747;position:relative;overflow:hidden;border-radius:12px;background:#e8e7e5}.analysis-video img{position:absolute;max-width:none;height:auto;width:${sourceWidth/420*100}%;left:${-53/420*100}%;top:${-118/747*100}%}.analysis-track{display:flex;height:21px;border:1px solid #dae4d4;border-radius:6px;overflow:hidden;margin-top:15px;background:#f5fbe9}.analysis-track span{border-right:1px solid white;flex:1}.analysis-track span:first-child{flex:0 0 22.727%;background:#b2ee19}.analysis-track span:nth-child(2){flex:0 0 20.909%}.analysis-track span:nth-child(3){flex:0 0 20%}.analysis-track-caption{font-size:11px;color:#94a08e;margin-top:9px}.analysis-content .summary{padding:21px 23px;margin:0 0 25px;border-radius:12px;box-shadow:none}.analysis-content .summary-grid{grid-template-columns:1.1fr 1fr;gap:22px;margin-top:18px}.analysis-content .summary-grid .field+.field{padding-left:22px}.analysis-content .field-value{font-size:14px;line-height:1.95}.analysis-content .block-title{font-size:15px}.analysis-content .section-title{margin-bottom:14px}.analysis-content .section-title .count{margin-left:10px}.analysis-scenes{display:grid;grid-template-columns:206px minmax(0,1fr);gap:17px;align-items:start}.analysis-scenes .stage-list{gap:10px}.scene-nav{border:1px solid #e0e6e1;border-radius:10px;padding:18px 16px;background:#fff;min-height:80px;display:flex;flex-direction:column;justify-content:center;gap:9px}.scene-nav.current{background:#f8fde9;border-color:#afe34c;box-shadow:inset 3px 0 0 #ade222}.scene-nav .scene-role{font-size:13px;font-weight:700;color:#4a574c}.scene-nav .scene-time{font-size:11px;color:#95a08e}.scene-nav.current .scene-role{color:#375b16}.analysis-detail{border:1px solid #dce5d5;background:white;border-radius:11px;overflow:hidden;min-width:0;min-height:475px}.analysis-detail .detail-head{background:#fafdf4;padding:19px 23px}.analysis-detail .detail-head b{font-size:14px}.analysis-detail .detail-head .stage-time{font-size:11px}.analysis-detail .detail-body{padding:24px}.analysis-detail .field-label{color:#819080;font-weight:400;font-size:12px;margin-bottom:8px}.analysis-detail .detail-body>.field+.field{padding-top:21px;margin-top:21px;border-top:1px solid #edf0e9}.analysis-detail .narration .field-value{border:none;background:transparent;box-shadow:none;border-radius:0;padding:0;font-style:normal;font-size:15px;color:#26352a;min-height:0}.analysis-detail .field-value{line-height:2.05}.analysis-detail .narration+.field{border-top:1px solid #edf0e9}.analysis-content{min-width:0}
@media(max-width:1350px){.analysis-meta{gap:10px}.meta-detail{gap:7px}.analysis-main{grid-template-columns:275px minmax(0,1fr);gap:22px}.analysis-scenes{grid-template-columns:174px minmax(0,1fr)}.analysis-content .summary-grid{grid-template-columns:1fr;gap:15px}.analysis-content .summary-grid .field+.field{padding:0;border:0}}
@media(max-width:1000px){.meta-detail{display:none}.analysis-main{grid-template-columns:230px minmax(0,1fr);padding:20px;gap:20px}.analysis-scenes{grid-template-columns:1fr}.analysis-scenes .stage-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}.scene-nav{padding:12px 9px;min-height:74px}.scene-nav .scene-role{font-size:11px}.analysis-window{width:calc(100% - 28px);margin:14px auto}.analysis-detail{min-height:0}}
`;
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>拆解结果 有旁白</title><style>${css}</style></head><body><div class="analysis-window"><header class="analysis-bar"><div class="analysis-meta"><span class="back">${icon('back')}</span><h1>${original.title}</h1><span class="status">已完成</span><span class="category">时尚展示</span><div class="meta-detail"><span>生成于 9月10日 17:08</span><i>·</i><span>11.0s 视频</span><i>·</i><span>4 个镜头 / 4 元素</span></div></div><div class="analysis-actions"><button class="control primary">${icon('magic')}去复刻</button><button class="control plain">${icon('share')}分享</button></div></header><main class="analysis-main"><aside class="analysis-reference"><div class="analysis-video"><img src="data:image/png;base64,${source.toString('base64')}" alt="用户提供截图中的牛仔裤参考视频"></div><div class="analysis-track" aria-hidden="true"><span></span><span></span><span></span><span></span></div><div class="analysis-track-caption">Hook 钩子 · 0.0s - 2.5s</div></aside><div class="analysis-content"><section class="summary"><h2 class="block-title"><span class="block-icon">${icon('magic')}</span>叙事策略全景</h2><div class="summary-grid">${field('整体策略',original.overall)}${field('目标受众',original.audience)}</div></section><div class="section-title"><h2><span class="block-icon">${icon('layers')}</span>场景拆解<span class="count">4 个场景</span></h2></div><div class="analysis-scenes"><nav class="stage-list" aria-label="场景拆解">${original.scenes.map((s,i)=>`<div class="scene-nav ${i===0?'current':''}" ${i===0?'aria-current="true"':''}><span class="scene-role">${s[0]}</span><span class="scene-time">${s[1]}</span></div>`).join('')}</nav><article class="analysis-detail"><div class="detail-head"><b>Hook 钩子</b><span class="stage-time">0.0–2.5s</span></div><div class="detail-body">${field('为什么有效',original.why)}${field('旁白',original.narration,'narration')}${field('视频描述',original.video)}</div></article></div></div></main></div></body></html>`;
const htmlPath=path.join(root,name+'.html');
const promptBlock=`<section class="prompt-card"><div class="prompt-head"><h2><span class="block-icon">${icon('magic')}</span>提示词反推</h2><div class="prompt-actions"><button type="button" class="control prompt-language">中文 <span>⌄</span></button><button type="button" class="control" id="copy-prompt">${icon('copy')}复制</button></div></div><p class="prompt-text" id="prompt-text">${esc(original.prompt)}</p></section>`;
const restoredHtml=html.replace('</aside>',promptBlock+'</aside>').replace('</body>','<script>document.getElementById("copy-prompt").addEventListener("click",()=>navigator.clipboard.writeText(document.getElementById("prompt-text").textContent));</script></body>');
fs.writeFileSync(htmlPath,restoredHtml,'utf8');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1600,height:990},deviceScaleFactor:1});
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(x=>x.decode()));});
    const labels=await page.locator('.field-label').allTextContents();
    const values=await page.locator('.field-value').allTextContents();
    if(JSON.stringify(labels)!==JSON.stringify(['整体策略','目标受众','为什么有效','旁白','视频描述']))throw Error('Field label mismatch');
    if(JSON.stringify(values)!==JSON.stringify([original.overall,original.audience,original.why,original.narration,original.video]))throw Error('Field value mismatch');
    if(await page.locator('.prompt-text').textContent()!==original.prompt)throw Error('Prompt text mismatch');
    if(await page.locator('.prompt-head h2').textContent()!=='提示词反推')throw Error('Prompt label mismatch');
    const style=await page.locator('.narration .field-value').evaluate(x=>{const s=getComputedStyle(x);return{background:s.backgroundColor,border:s.borderTopWidth,padding:s.padding,shadow:s.boxShadow};});
    if(style.background!=='rgba(0, 0, 0, 0)'||style.border!=='0px'||style.padding!=='0px'||style.shadow!=='none')throw Error('Narration must be plain text');
    await page.screenshot({path:path.join(root,name+'.png'),fullPage:true});
    const geometry=[];
    for(const width of [1600,1366]){
      await page.setViewportSize({width,height:990});
      geometry.push(await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight})));
    }
    if(geometry.some(x=>x.scrollWidth>x.width))throw Error('Horizontal overflow');
    console.log(JSON.stringify({name,labels,valuesPreserved:true,narrationStyle:style,geometry},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
