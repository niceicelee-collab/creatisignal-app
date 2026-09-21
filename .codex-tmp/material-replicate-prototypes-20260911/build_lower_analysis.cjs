const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
const {chromium} = require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260911';
const name = '拆解结果_下半页_建议与相似创意';
const source = fs.readFileSync('C:/Users/ice.li/AppData/Local/Temp/codex-clipboard-6475e9b5-ac34-4c6d-9d36-6085efbcda22.png');
const sourceWidth = source.readUInt32BE(16);
const src = 'data:image/png;base64,' + source.toString('base64');
const original = {
  prompt: '竖版9:16广告，深灰背景，快节奏换装。0-3.5秒：男模穿浅蓝T恤拉扯衣摆，后换薄荷绿侧身合十；字幕显示CLASICO 9 POLOS及价格；旁白强调最佳套装。3.5-6.8秒：俯视特写多色T恤叠放；字幕更新颜色数量；旁白介绍规格。6.8-9.2秒：男模穿白T恤插兜直视镜头；字幕展示尺码；旁白报出S-XL。9.2-13.7秒：男模穿深棕T恤调整领口；字幕强调面料质量；旁白承诺不褪色。13.7-15.8秒：男模穿灰粉T恤转身展示背部；字幕提示适用场景；旁白称完美百搭。15.8-19.8秒：男模穿酒红T恤整理头发走出画面；字幕显示物流支付信息；旁白说明货到付款。结尾定格品牌Logo。保持画面连续、光影与物理效果真实、动作流畅。',
  scene: '画面出现品牌标志动画，无口播内容，作为视频的视觉收尾。',
  why: '以品牌符号自然结束视频，强化品牌记忆但不施加额外购买压力。',
  visual: "0~2秒，中景，平视，静止机位，男模特身穿浅蓝色经典款纯色T恤套装站在深灰色背景前，双手拉扯衣摆展示面料弹性；2~4秒，中景，平视，静止机位，男模特换穿薄荷绿色经典款纯色T恤套装，侧身站立并双手合十；4~6秒，特写，俯视，静止机位，多件不同颜色的经典款纯色T恤套装平铺叠放于深色纹理表面；6~10秒，中景，平视，静止机位，男模特换穿白色经典款纯色T恤套装，低头看地后抬头直视镜头，双手插兜；10~13秒，中景，平视，静止机位，男模特换穿深棕色经典款纯色T恤套装，侧身展示后调整领口；13~16秒，中景，平视，静止机位，男模特换穿灰粉色经典款纯色T恤套装，背对镜头转身展示背部剪裁；16~19秒，中景，平视，静止机位，男模特换穿酒红色经典款纯色T恤套装，手抚后颈整理头发并向右侧走出画面。 显示：'品牌 Logo'（黑白圆形图标，包含侧面人脸剪影，出现在深色背景上）",
  suggestions: [
    ['增加面料耐用性实证', '在强调不褪色不缩水的段落，插入洗涤前后对比或拉扯回弹特写镜头，替代纯口播声称，提供视觉证据支撑质量承诺。', '提升信任度，降低用户对低价低质的顾虑，促进转化'],
    ['优化结尾直接CTA', '将结尾仅展示品牌Logo改为明确行动指令（如“点击购买”按钮或链接），配合紧迫感文案，引导用户立即下单而非被动结束。', '提高点击率与转化率，缩短决策路径'],
    ['强化多色上身效果差异', '在模特快速换装展示不同颜色时，增加近景细节或分屏对比，突出每种颜色的质感与搭配建议，避免视觉疲劳导致的注意力流失。', '增强产品吸引力，提升完播率与互动意愿']
  ],
  similarSubtitle: '基于本条素材的结构、受众与情绪曲线，从市场素材库匹配的高表现创意',
  creativeTitle: '🔥 LIMITED TIME BIG DEAL — 50% OFF EVERYTHING!',
  creativeInfo: '男装T恤品类，Facebook·US'
};
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const crop = (x,y,w,h,alt) => `<div class="crop" style="aspect-ratio:${w}/${h}"><img alt="${esc(alt)}" src="${src}" style="width:${sourceWidth/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></div>`;
const icons = {
  magic: '<path d="m4 20 11-11 3 3L7 23zM15 2v4M4 5v4M2 7h4M21 3v4M19 5h4"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  bulb: '<path d="M9 18h6M10 22h4M9 15c0-2-3-3-3-7a6 6 0 0 1 12 0c0 4-3 5-3 7z"/>'
};
const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]}</svg>`;
const thumbs = [[534,921,265,148],[815,921,265,148],[1098,921,264,148]];
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>拆解结果 · 下半页示例</title><style>
*{box-sizing:border-box}body{margin:0;background:linear-gradient(130deg,#edf5e7,#f4f6f4 60%);font-family:"Microsoft YaHei","PingFang SC",sans-serif;color:#1b2921;font-size:14px;-webkit-font-smoothing:antialiased}button{font:inherit;color:inherit;cursor:pointer}svg{width:16px;height:16px;flex:none}.window{width:calc(100% - 64px);max-width:1536px;margin:0 auto 32px;padding:0 28px 28px;background:#fff;border-radius:0 0 22px 22px}.layout{display:grid;grid-template-columns:326px minmax(0,1fr);gap:28px;align-items:start}.reference{min-width:0}.crop{position:relative;overflow:hidden;width:100%;background:#e9eeea}.crop img{position:absolute;max-width:none;height:auto}.video-tail{overflow:hidden;border-radius:0 0 11px 11px}.track{height:22px;background:#f4fbe7;border:1px solid #dde7d5;border-radius:5px;margin-top:16px;display:flex;overflow:hidden}.track span{flex:1;border-right:1px solid white}.track span:last-child{border:0}.caption{font-size:11px;color:#8b958e;margin:9px 0 20px}.prompt{border:1px solid #dfe5df;border-radius:12px;padding:17px}.prompt-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.prompt-head h2{font-size:14px;white-space:nowrap;margin:0;display:flex;align-items:center;gap:8px}.icon-tile{background:#c7f184;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;width:29px;height:29px}.prompt-actions{display:flex;gap:6px}.control{height:28px;border:1px solid #dde4df;border-radius:6px;padding:0 7px;display:inline-flex;align-items:center;gap:4px;font-size:11px;background:#fff}.control svg{width:12px;height:12px}.chevron{font-size:13px;color:#8c9790}.prompt-text{font-size:13px;line-height:1.95;color:#77837a;margin:16px 0 0;overflow-wrap:anywhere}.content{min-width:0;padding-top:20px}.scene{border:1px solid #dce4d7;border-radius:12px;overflow:hidden}.scene-head{display:flex;align-items:center;gap:13px;padding:17px 20px;background:#f8fcec;border-bottom:1px solid #e7ede1}.tag{font-size:11px;font-weight:700;border-radius:20px;padding:5px 11px;color:#708159;background:#edf6db;flex:none}.scene-head b{font-size:13px;line-height:1.65;font-weight:600;flex:1}.time{font-size:11px;color:#929c94;white-space:nowrap}.scene-body{padding:21px 22px 23px}.field-label{display:flex;align-items:center;gap:6px;font-size:12px;color:#8b978b;margin:0 0 8px;font-weight:400}.field-label svg{width:13px;height:13px}.field-text{margin:0;font-size:13px;line-height:1.95;overflow-wrap:anywhere}.field+.field{margin-top:19px;padding-top:19px;border-top:1px solid #edf0e9}.section{margin-top:22px;border:1px solid #dfe5df;border-radius:12px;padding:22px}.section h2{font-size:17px;font-weight:700;margin:0;line-height:1.5}.suggestions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:19px}.suggestion{padding:0 21px;border-left:1px solid #e6ebe3}.suggestion:first-child{padding-left:0;border-left:0}.suggestion:last-child{padding-right:0}.suggestion h3{font-size:14px;line-height:1.6;margin:0 0 10px}.suggestion p{font-size:13px;line-height:1.9;margin:0;color:#7a847e}.suggestion .effect{color:#52684b;margin-top:14px;line-height:1.8}.similar-head{display:flex;justify-content:space-between;align-items:center;gap:20px}.count{font-size:12px;color:#929b94;white-space:nowrap}.subtitle{margin:7px 0 20px;font-size:12px;color:#819087;line-height:1.8}.creatives{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}.creative{border:1px solid #e0e6df;border-radius:10px;overflow:hidden;background:#fff;min-width:0}.creative-text{padding:15px 15px 0}.creative h3{font-family:Arial,"Microsoft YaHei",sans-serif;font-size:14px;line-height:1.55;margin:0 0 11px;color:#17251f;min-height:44px}.platform{font-size:12px;color:#697c73;display:flex;gap:9px;align-items:center;line-height:1.7}.platform strong{font-weight:600}.platform i{font-style:normal;color:#a8b2aa}.creative-desc{font-size:12px;color:#79897d;margin:8px 0 19px;line-height:1.8}.metric{margin:0 15px;border-top:1px solid #edf0eb;padding:12px 0 14px;font-size:12px;color:#8a958d}.metric b{color:#526256;font-weight:600;margin-left:4px}.copy-state{color:#557346}
@media(max-width:1400px){.layout{grid-template-columns:292px minmax(0,1fr);gap:24px}.window{padding:0 24px 24px;width:calc(100% - 48px)}.prompt{padding:14px}.prompt-head h2{font-size:13px;gap:6px}.control{padding:0 5px}.suggestion{padding:0 15px}.section{padding:20px}.scene-head{gap:9px}.scene-head b{font-size:12px}.creatives{gap:13px}.creative-text{padding:13px 12px 0}.creative h3{font-size:13px}.metric{margin:0 12px}}
@media(max-width:1050px){.layout{grid-template-columns:240px minmax(0,1fr);gap:20px}.prompt-head{flex-wrap:wrap}.suggestions{grid-template-columns:1fr;gap:18px}.suggestion{padding:0;border:0}.suggestion+.suggestion{padding-top:18px;border-top:1px solid #e6ebe3}.creatives{grid-template-columns:1fr}.scene-head b{display:none}}
</style></head><body><div class="window"><main class="layout"><aside class="reference"><div class="video-tail">${crop(64,0,420,120,'参考视频播放器底部')}</div><div class="track" aria-hidden="true">${'<span></span>'.repeat(7)}</div><p class="caption">点击色块跳转到对应片段</p><section class="prompt"><div class="prompt-head"><h2><span class="icon-tile">${icon('magic')}</span>提示词反推</h2><div class="prompt-actions"><button class="control" type="button">中文 <span class="chevron">⌄</span></button><button class="control" type="button" id="copy-prompt">${icon('copy')}复制</button></div></div><p class="prompt-text" id="prompt-text">${esc(original.prompt)}</p></section></aside><div class="content"><article class="scene"><header class="scene-head"><span class="tag">transition</span><b>${esc(original.scene)}</b><span class="time">19.8–21.0s</span><span class="chevron">⌃</span></header><div class="scene-body"><div class="field"><h3 class="field-label">${icon('bulb')}为什么有效</h3><p class="field-text" id="why">${esc(original.why)}</p></div><div class="field"><h3 class="field-label">视觉描述</h3><p class="field-text" id="visual">${esc(original.visual)}</p></div></div></article><section class="section next"><h2>建议下一步</h2><div class="suggestions">${original.suggestions.map(s=>`<article class="suggestion"><h3>${esc(s[0])}</h3><p class="advice">${esc(s[1])}</p><p class="effect">${esc(s[2])}</p></article>`).join('')}</div></section><section class="section similar"><div class="similar-head"><h2>相似创意推荐</h2><span class="count">3 条素材</span></div><p class="subtitle">${esc(original.similarSubtitle)}</p><div class="creatives">${thumbs.map((t,i)=>`<article class="creative">${crop(...t,'截图中的第'+(i+1)+'条相似创意封面')}<div class="creative-text"><h3>${esc(original.creativeTitle)}</h3><div class="platform"><strong>Facebook</strong><i>·</i><span>US</span></div><p class="creative-desc">${esc(original.creativeInfo)}</p></div><div class="metric">覆盖 <b>0</b></div></article>`).join('')}</div></section></div></main></div><script>document.getElementById('copy-prompt').addEventListener('click',async function(){await navigator.clipboard.writeText(document.getElementById('prompt-text').textContent);this.classList.add('copy-state');});</script></body></html>`;
fs.writeFileSync(path.join(root,name+'.html'),html,'utf8');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1600,height:1160},deviceScaleFactor:1});
    await page.goto(pathToFileURL(path.join(root,name+'.html')).href);
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(x=>x.decode()));});
    const values = await page.locator('.suggestion').evaluateAll(xs=>xs.map(x=>[x.querySelector('h3').textContent,x.querySelector('.advice').textContent,x.querySelector('.effect').textContent]));
    if(JSON.stringify(values)!==JSON.stringify(original.suggestions))throw Error('Suggestions mismatch');
    for(const [id,value] of [['prompt-text',original.prompt],['why',original.why],['visual',original.visual]])if(await page.locator('#'+id).textContent()!==value)throw Error(id+' mismatch');
    if(await page.locator('.subtitle').textContent()!==original.similarSubtitle)throw Error('Subtitle mismatch');
    if(await page.locator('.creative').count()!==3)throw Error('Creative count mismatch');
    for(const v of await page.locator('.creative h3').allTextContents())if(v!==original.creativeTitle)throw Error('Creative title mismatch');
    for(const v of await page.locator('.creative-desc').allTextContents())if(v!==original.creativeInfo)throw Error('Creative info mismatch');
    const geometry=[];
    for(const width of [1600,1366]){
      await page.setViewportSize({width,height:1160});
      geometry.push(await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,images:[...document.images].map(x=>x.naturalWidth)})));
    }
    if(geometry.some(x=>x.width<x.scrollWidth||x.images.some(n=>!n)))throw Error('Layout or image failure');
    await page.setViewportSize({width:1600,height:1160});
    await page.screenshot({path:path.join(root,name+'.png'),fullPage:true});
    fs.writeFileSync(path.join(root,name+'_核对.json'),JSON.stringify({sourceWidth,fieldsPreserved:true,suggestions:values.length,creatives:3,geometry},null,2),'utf8');
    console.log(JSON.stringify({html:path.join(root,name+'.html'),png:path.join(root,name+'.png'),fieldsPreserved:true,geometry},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
