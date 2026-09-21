const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const out = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260914';
const specification = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-fields-20260914/三个结果页面_精简字段与原文示例.md';
const spec = fs.readFileSync(specification, 'utf8');
const quotes = [...spec.matchAll(/^> (.+)$/gm)].map(m => m[1]);
const [visual, prompt, advice1, advice2, advice3, newStrategy, newVisual] = quotes;
if (quotes.length !== 7) throw new Error('Unexpected source paragraphs');
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const tableRows = (start, end) => spec.slice(spec.indexOf(start), spec.indexOf(end, spec.indexOf(start))).split('\n').filter(l => l.startsWith('|')).slice(2).map(l => l.split('|').slice(1, -1).map(s => s.trim()));
const scenes = tableRows('场景名称和时间全部保留：', '### 示例A');
const sourceStages = tableRows('完整阶段列表：', '说明：阶段6');
const newStageSection = spec.lastIndexOf('完整阶段列表：');
const scriptStages = spec.slice(newStageSection, spec.indexOf('### 示例C', newStageSection)).split('\n').filter(l => l.startsWith('|')).slice(2).map(l => l.split('|').slice(1,-1).map(s=>s.trim()));
const data = {
  strategy: '以量贩低价钩子开场，依次叠加规格、品质、场景与履约保障，构建高性价比信任闭环。',
  audience: '追求基础款高性价比的秘鲁男性消费者。',
  why: '利用极致评价与视觉冲击组合，在黄金三秒内建立高性价比预期并留住用户。',
  narration: '“你能找到的最好的 polo 衫套装。”',
  sourceSpeech: '你能找到的最好的 polo 衫套装。',
  sourceTranslation: '你将找到的最好的T恤套装。',
  scriptSpeech: 'The ultimate performance polo with moisture wicking and UPF 30+ protection.',
  scriptTranslation: '极致性能Polo衫，吸湿排汗且具备UPF 30+防晒保护。',
  keywords: ['高性能吸湿排汗', 'UPF 30+ 防晒', '四向弹力面料'],
  suggestions: [['增加面料耐用性实证', advice1], ['优化结尾直接CTA', advice2], ['强化多色上身效果差异', advice3]],
  creativeTitle: '🔥限时特惠——全场五折!',
  platform: 'Facebook · 我们',
  entities: [['商品信息', '经典款纯色T恤套装', 'box'], ['人物信息', '男模特', 'person'], ['环境信息', '室内-摄影棚', 'home']]
};
for (const val of [data.strategy, data.audience, data.why, data.narration, data.sourceSpeech, data.sourceTranslation, data.scriptSpeech, data.scriptTranslation, ...data.keywords, data.creativeTitle, data.platform]) {
  if (!spec.includes(val)) throw new Error('Text not in approved specification: ' + val);
}
const imageFile = name => {
  const b = fs.readFileSync('C:/Users/ice.li/AppData/Local/Temp/' + name);
  return { src: 'data:image/png;base64,' + b.toString('base64'), width: b.readUInt32BE(16) };
};
const sourceImage = imageFile('codex-clipboard-57d03a30-6b6b-4423-9748-0f56ca508625.png');
const creativeImage = imageFile('codex-clipboard-4a382b69-b5e5-4449-858e-c1157565f41f.png');
const crop = (image, x, y, w, h, alt) => `<div class="crop" style="aspect-ratio:${w}/${h}"><img src="${image.src}" alt="${esc(alt)}" style="width:${image.width / w * 100}%;left:${-x / w * 100}%;top:${-y / h * 100}%"></div>`;
const icons = {
  arrow: '<path d="m12 5-7 7 7 7M5 12h14"/>', right: '<path d="m12 5 7 7-7 7M5 12h14"/>',
  down: '<path d="m7 10 5 5 5-5"/>', refresh: '<path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>',
  magic: '<path d="m4 20 10-10 3 3L7 23zM16 2v5M13.5 4.5h5M5 3v5M2.5 5.5h5M21 11v4M19 13h4"/>',
  share: '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 10 6-3M9 14l6 3"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  bulb: '<path d="M9 18h6M10 22h4M9 15c0-2-3-3-3-7a6 6 0 0 1 12 0c0 4-3 5-3 7z"/>',
  home: '<path d="m3 10 9-7 9 7v11H3zM9 21v-8h6v8"/>',
  chart: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m6 14 4-5 4 3 4-6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6z"/>',
  picture: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-5 4 3 4-6 4 7"/>',
  tool: '<path d="M15 3a6 6 0 0 0-6 7L3 16a3 3 0 0 0 5 5l6-6a6 6 0 0 0 7-6l-4 3-5-5z"/>',
  box: '<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10M7 4l10 6"/>',
  folder: '<path d="M3 6h6l2 2h10v13H3zM7 14l3-3M7 14l3 3M17 14l-3-3M17 14l-3 3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m9 2-1 3-3 1-3 3 2 3-1 4 4 1 2 4 4-1 3 1 2-4 3-2-1-4 1-3-4-2-2-3z"/>',
  person: '<circle cx="10" cy="7" r="4"/><path d="M2 22v-3a8 8 0 0 1 16 0v3M18 4a4 4 0 0 1 0 8M22 22v-3a6 6 0 0 0-3-5"/>',
  edit: '<path d="m4 16 12-12 4 4-12 12-5 1zM13 7l4 4"/>',
  sound: '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
  bolt: '<path d="m13 2-8 12h6l-1 8 9-13h-7z"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  subtitle: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M5 11h5M5 15h7M14 11h5M15 15h4"/>',
  sliders: '<path d="M3 6h6m4 0h8M3 12h11m4 0h3M3 18h3m4 0h11M9 3v6M14 9v6M6 15v6"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>'
};
const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n] || icons.layers}</svg>`;
const button = (text, name, className = '') => `<button type="button" class="button ${className}">${name ? icon(name) : ''}${esc(text)}${className.includes('setting') ? icon('down') : ''}</button>`;
const tag = text => `<span class="tag">${esc(text)}</span>`;
const field = (label, content, id, className = '') => `<div class="field ${className}"><div class="field-label">${esc(label)}</div><p class="field-value ${className.includes('voice') ? 'voice-text' : ''}" ${id ? `data-verify="${id}"` : ''}>${esc(content)}</p></div>`;
const heading = (text, name, count = '') => `<div class="section-head"><h2><span class="icon-tile">${icon(name)}</span>${esc(text)}</h2>${count ? `<span class="count">${esc(count)}</span>` : ''}</div>`;

const css = `
*{box-sizing:border-box}body{margin:0;background:linear-gradient(145deg,#eef5e4 0,#eff6f1 18%,#f4f5f4 45%);color:#202722;font:15px/1.65 "Microsoft YaHei","PingFang SC",Arial,sans-serif;-webkit-font-smoothing:antialiased}button{font:inherit;cursor:default}button,svg{flex-shrink:0}svg{width:18px;height:18px}p,h1,h2,h3{margin:0}h1,h2,h3{color:#1b221e}h1{font-size:24px;font-weight:700}h2{font-size:18px;font-weight:700}h3{font-size:15px;font-weight:600}.sidebar{position:absolute;top:0;left:0;width:210px;min-height:100vh;padding:27px 20px}.brand{display:flex;align-items:center;gap:9px;font-size:23px;letter-spacing:-.8px;color:#141c16;white-space:nowrap;margin-bottom:39px}.brand svg{width:34px;height:40px;color:#11c400;stroke-width:2.4}.nav{display:flex;flex-direction:column;gap:7px}.nav-item{display:flex;gap:13px;align-items:center;height:45px;padding:0 14px;font-size:16px;color:#424e46}.nav-item .chev{margin-left:auto;width:14px}.nav-item.active{background:#cef493;color:#079d79;border-radius:25px}.nav-item.parent{color:#119e7c}.subnav{padding:10px 22px 10px 45px;background:#cef493;border-radius:24px;color:#079d79;font-size:15px;margin-top:-4px;margin-bottom:6px}.account{margin-top:340px;padding:0 2px;color:#3b5144;font-size:13px}.credits,.user{background:#ffffffad;border:1px solid #fff8;border-radius:28px;padding:11px 15px;display:flex;align-items:center;gap:9px}.credits{justify-content:space-between;margin-bottom:10px}.credits strong{color:#242e28}.sparkle{color:#32bfba}.avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#587f9f,#cbb79c);display:grid;place-items:center;font-size:13px;color:white}.user .chev{margin-left:auto}.main{margin-left:210px;padding:30px 32px 36px;min-width:0}.window{background:#fff;border:1px solid #e5eae4;border-radius:20px;overflow:hidden;box-shadow:0 9px 32px #233b201f}.window-header{height:82px;padding:0 28px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e5e9e3;gap:20px}.header-meta,.actions{display:flex;align-items:center;gap:14px}.header-meta h1{font-size:22px}.button{height:38px;padding:0 13px;display:inline-flex;align-items:center;justify-content:center;gap:8px;color:#465149;background:white;border:1px solid #e1e6e1;border-radius:8px;white-space:nowrap;font-size:13px}.button.primary{background:#1c211d;color:white;border-color:#1c211d;font-weight:600}.button.plain{background:transparent;border-color:transparent}.button.icon-only{padding:0;width:36px;color:#87928a}.button.small{font-size:12px;height:30px;padding:0 8px;gap:5px}.button.small svg{width:14px;height:14px}.status{background:#eaf9e6;color:#159668;font-size:12px;padding:4px 9px;border-radius:7px;font-weight:600}.meta,.count{font-size:13px;color:#89958c;white-space:nowrap}.window-body{padding:27px}.analysis-grid,.source-grid{display:grid;grid-template-columns:330px minmax(0,1fr);gap:28px;align-items:start}.reference,.results{min-width:0}.crop{width:100%;position:relative;overflow:hidden;background:#e6ece6}.crop img{position:absolute;max-width:none;height:auto;display:block}.video{border-radius:12px;overflow:hidden;box-shadow:0 0 0 1px #00000008}.timeline{display:flex;height:23px;margin-top:15px;border:1px solid #dfe6d4;border-radius:5px;overflow:hidden;background:#f4fae9}.timeline span{flex:1;border-right:1px solid #fff}.timeline span:last-child{border:0}.timeline span:first-child{background:#b5ef0a}.timeline-caption{margin-top:8px;font-size:12px;color:#889281}.prompt{margin-top:23px;border:1px solid #e2e8de;border-radius:12px;padding:19px;background:#fff}.prompt .section-head{gap:8px;margin-bottom:16px}.prompt h2{font-size:15px;gap:8px}.prompt .icon-tile{width:28px;height:28px}.prompt-actions{display:flex;gap:6px;margin-left:auto}.prompt-text{font-size:13px;line-height:1.95;color:#69786c;overflow-wrap:anywhere}.section-head{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:19px}.section-head h2{display:flex;align-items:center;gap:10px}.icon-tile{display:inline-grid;place-items:center;width:33px;height:33px;border-radius:9px;background:#d1f6a3;color:#314c25}.summary{background:#fff;border:1px solid #e2e8de;border-radius:13px;padding:22px 24px;margin-bottom:24px}.summary .section-head{margin-bottom:16px}.summary-grid{display:grid;grid-template-columns:1.65fr 1fr;gap:28px}.summary-grid>.field+.field{border-left:1px solid #e9ede7;padding-left:27px}.field-label{font-size:12px;font-weight:500;color:#879388;line-height:1.5;margin-bottom:8px}.field-value{font-size:14px;line-height:1.95;overflow-wrap:anywhere;color:#35423a}.stage-workspace{display:grid;grid-template-columns:159px minmax(0,1fr);gap:17px;align-items:start}.stage-list{display:flex;flex-direction:column;gap:9px}.stage-row{border:1px solid #e4e9e0;border-radius:9px;background:#fff;padding:13px 15px;min-width:0;min-height:65px}.stage-row.selected{background:#f2fadf;border-color:#b5df80;box-shadow:inset 3px 0 0 #b7e846}.stage-row .stage-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;line-height:1.6}.stage-name{font-size:13px;font-weight:600}.stage-time{font-size:11px;color:#95a08f;white-space:nowrap;font-variant-numeric:tabular-nums}.stage-row>.stage-time{display:block;margin-top:4px}.stage-purpose{font-size:12px;line-height:1.6;color:#7a887a;margin-top:5px}.stage-row.selected .stage-purpose{color:#5a713e}.seq{font-size:10px;color:#8d9a7d;white-space:nowrap}.stage-row.selected .seq{color:#5b713e}.detail{border:1px solid #dfe7d8;border-radius:12px;padding:23px 25px;background:#fff;min-width:0;min-height:100%}.detail .field+.field{border-top:1px solid #e8ede4;margin-top:22px;padding-top:22px}.detail .field-value{line-height:2}.detail .why{background:#f5faeb;border-left:3px solid #bfe375;border-radius:0 8px 8px 0;padding:14px 17px}.detail .why .field-label{color:#607943;display:flex;align-items:center;gap:7px;font-weight:600}.detail .why .field-value{font-size:13px;color:#526843}.why svg{width:14px;height:14px}.voice-text{border:0;background:transparent;box-shadow:none;padding:0;border-radius:0;font-size:19px!important;color:#223229!important;line-height:1.85!important;font-weight:500}.translation .voice-text{font-size:15px!important;color:#6b796e!important;font-weight:400}.detail .voice .field-label{color:#68796c}.lower-section{margin-top:26px;padding-top:24px;border-top:1px solid #e6ebe1}.suggestions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}.suggestion{padding:0 21px;border-left:1px solid #e8ece4}.suggestion:first-child{padding-left:0;border:0}.suggestion:last-child{padding-right:0}.suggestion h3{font-size:14px;margin-bottom:10px}.suggestion p{font-size:13px;line-height:1.9;color:#748074}.creative-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.creative{border:1px solid #e1e6dd;border-radius:11px;overflow:hidden;background:#fff}.creative-body{padding:13px 15px 16px}.creative h3{font-size:14px;line-height:1.65;margin-bottom:8px}.platform{font-size:12px;color:#839087}.project-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:27px}.project-header .header-meta{gap:12px}.project-header h1{font-size:22px}.project-header .edit-icon{color:#a6afa5;width:16px;height:16px}.stepper{display:flex;align-items:center;margin:0 6px 33px;gap:0}.step{display:flex;gap:10px;align-items:center;white-space:nowrap;font-size:13px;color:#85927e;font-weight:500}.step.active{color:#202a23;font-weight:600}.step-circle{width:30px;height:30px;border:1px solid #cce593;border-radius:50%;display:grid;place-items:center;color:#8ba458;background:#f2ffd0;font-size:13px}.step-circle svg{width:16px;height:16px}.step.active .step-circle{background:#1c211e;border-color:#1c211e;color:#fff}.step-line{height:1px;background:#c6e393;flex:1;margin:0 23px}.page-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px;gap:16px}.page-heading h1{font-size:23px}.page-subtitle{font-size:13px;color:#88958a;line-height:1.8;margin-top:6px}.workspace-shell{border:1px solid #e3e8e1;border-radius:17px;background:#ffffffd9;padding:25px;box-shadow:0 6px 22px #2a3c2410}.source-grid .stage-workspace{grid-template-columns:220px minmax(0,1fr)}.source-grid .stage-row{padding:11px 14px;min-height:78px}.source-grid .stage-top .stage-time{margin-left:auto}.source-grid .summary-grid{grid-template-columns:1.5fr 1fr}.shot-head{display:flex;align-items:center;gap:14px;padding-bottom:17px;margin-bottom:20px;border-bottom:1px solid #e8ede4}.shot-head h3{font-size:14px}.shot-id{font-size:11px;padding:3px 8px;background:#f0f4ec;border-radius:4px;color:#7a8b70}.shot-time{font-size:12px;color:#95a28c}.entities{margin-top:21px;display:flex;flex-direction:column;border:1px solid #e1e7dc;border-radius:12px;background:#fff;padding:6px 17px}.entity{display:flex;gap:13px;align-items:center;padding:13px 0}.entity+.entity{border-top:1px solid #ebeee8}.entity>svg{width:19px;height:19px;color:#8e9d82}.entity .field-label{font-size:11px;margin-bottom:3px}.entity .value{font-size:13px;color:#465440}.source-prompt{margin-top:24px;padding:19px 22px;background:#fbfdf8}.source-prompt .prompt-text{font-size:13px;line-height:1.9}.source-prompt .section-head{margin-bottom:11px}.footer{margin-top:25px;border-top:1px solid #e3e8df;padding:19px 2px 0;display:flex;align-items:center;justify-content:space-between;gap:12px}.footer-right{display:flex;align-items:center;gap:12px}.boundary{font-size:11px;color:#8b9584;display:flex;align-items:center;gap:14px}.boundary strong{color:#4e5d43;font-weight:600}.boundary b{color:#67765b;margin-right:5px}.footer .primary{height:43px;padding:0 18px}.footer .button.plain{font-size:12px}.script-summary{margin-bottom:26px;padding:23px 26px;background:#fff;border:1px solid #e1e8dd;border-radius:14px;box-shadow:0 6px 22px #2a3c240b}.script-summary .section-head{margin-bottom:17px}.script-summary .count{font-size:12px;background:#f0ffd0;color:#799540;padding:4px 11px;border:1px solid #d8edac;border-radius:18px}.script-summary .field-value{font-size:14px;line-height:2}.script-workspace{display:grid;grid-template-columns:302px minmax(0,1fr);gap:23px;align-items:start}.script-workspace .stage-row{padding:16px 18px;min-height:86px}.script-workspace .stage-top{column-gap:9px}.script-workspace .stage-name{font-size:14px}.script-workspace .stage-time{margin-left:auto}.script-workspace .stage-purpose{margin-top:7px}.script-workspace .detail{padding:27px 30px;border-color:#dfe7d6;box-shadow:0 5px 20px #273c2009}.keywords{padding-bottom:22px;margin-bottom:21px;border-bottom:1px solid #e7ede0}.tags{display:flex;gap:10px;flex-wrap:wrap}.tag{font-size:12px;border-radius:18px;background:#f0ffd0;color:#67863d;border:1px solid #daedb0;padding:4px 11px}.script-workspace .voice-text{font-family:Arial,"Microsoft YaHei",sans-serif;font-size:22px!important;font-weight:400;line-height:1.7!important;max-width:920px}.script-workspace .translation .voice-text{font-family:"Microsoft YaHei",sans-serif;font-size:15px!important}.script-footer{background:#fff;border:1px solid #e2e8df;border-radius:12px;padding:17px 18px;margin-top:27px}.script-footer .footer-right{gap:9px}.setting{border-radius:21px;background:#f8faf7;font-size:12px;height:37px;padding:0 13px}.cost{display:flex;align-items:center;gap:6px;background:#f0ffc3;color:#657f2e;font-size:13px;font-weight:600;padding:8px 12px;border-radius:21px}.cost svg{fill:currentColor;width:15px;height:15px}.script-caption{font-size:12px;color:#7a877d;margin-left:11px;font-weight:400}.script-section-head h2{font-size:18px}.script-section-head{display:flex;align-items:center;margin-bottom:16px}.script-section-head .edit-caption{color:#8d9b84;font-size:12px;margin-left:12px}.script-section-head .page-subtitle{margin:0 0 0 auto;font-size:12px}.section-head.prompt-head{flex-wrap:wrap}
.timeline-labeled{height:44px;margin-bottom:8px;background:#f8faf5}.timeline-labeled span{font-size:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;color:#737e69;white-space:nowrap}.timeline-labeled span:first-child{color:#3e4e23}.timeline-labeled small{font-size:9px}.setting svg:last-child{width:12px;height:12px;color:#9da993}
@media(max-width:1500px){.sidebar{width:184px;padding-left:15px;padding-right:15px}.brand{font-size:21px;gap:6px}.brand svg{width:30px}.main{margin-left:184px;padding:25px}.analysis-grid,.source-grid{grid-template-columns:286px minmax(0,1fr);gap:22px}.window-body{padding:23px}.window-header{padding:0 23px}.stage-workspace{grid-template-columns:143px minmax(0,1fr);gap:14px}.detail{padding:20px}.summary{padding:20px}.summary-grid{grid-template-columns:1fr;gap:15px}.summary-grid>.field+.field{border:0;padding-left:0}.source-grid .summary-grid{grid-template-columns:1fr}.source-grid .stage-workspace{grid-template-columns:192px minmax(0,1fr);gap:14px}.source-grid .stage-top .stage-time{margin-left:0}.source-grid .stage-row{min-height:82px}.source-grid .detail{padding:19px}.prompt{padding:16px}.prompt-actions .button{font-size:11px}.prompt h2{font-size:14px}.prompt-actions{gap:5px}.prompt-text{font-size:12px}.suggestion{padding:0 14px}.creative-grid{gap:12px}.creative h3{font-size:13px}.boundary{gap:9px;flex-wrap:wrap;max-width:570px;font-size:10px}.script-workspace{grid-template-columns:266px minmax(0,1fr);gap:20px}.script-workspace .stage-row{padding:14px}.script-workspace .stage-purpose{font-size:11px}.script-footer .button{padding:0 9px;font-size:11px}.script-footer .footer-right{gap:6px}.step-line{margin:0 15px}.page-subtitle{font-size:12px}}
`;

function sidebar(replica = false) {
  const links = replica ? [['首页','home'],['洞察','chart'],['发现','compass'],['创作','picture'],['工具','tool'],['资产','box'],['任务','folder'],['设置','settings']] : [['首页','home'],['洞察','chart'],['发现','compass'],['创作','picture'],['工具','tool'],['资产','box'],['任务','folder'],['设置','settings']];
  return `<aside class="sidebar"><div class="brand"><svg viewBox="0 0 34 40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14a13 13 0 0 1 23-5M29 28a13 13 0 0 1-23 4M2 22h9l5-13 6 23 4-12h6"/><circle cx="31" cy="14" r="1"/><circle cx="31" cy="24" r="1"/></svg>CreatiSignal</div><nav class="nav">${links.map(([text,name])=>`<div class="nav-item ${!replica&&text==='任务'?'active':''} ${replica&&text==='创作'?'parent':''}">${icon(name)}<span>${text}</span>${['洞察','发现','创作','工具','资产','设置'].includes(text)?icon('down').replace('<svg','<svg class="chev"'):''}</div>${replica&&text==='创作'?'<div class="subnav">高保真复刻</div>':''}`).join('')}</nav><div class="account"><div class="credits"><span><span class="sparkle">♛</span> 升级</span><strong><span class="sparkle">✦</span> 7,587</strong></div><div class="user"><span class="avatar">李</span><strong>李冰</strong>${icon('down').replace('<svg','<svg class="chev"')}</div></div></aside>`;
}
function wrap(title, body, replica = false) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><style>${css}</style></head><body>${sidebar(replica)}<main class="main">${body}</main></body></html>`;
}
function video(stage = false) {
  const player = `<div class="video">${crop(sourceImage,451,233,481,855,'T恤多色快剪广告视频画面')}</div>`;
  if(stage)return player + `<div class="timeline timeline-labeled" aria-label="视频时间轴">${sourceStages.map((s,i)=>`<span>${esc(s[1])}<small>#${i+1}</small></span>`).join('')}</div>`;
  return player + `<div class="timeline" aria-label="视频时间轴">${'<span></span>'.repeat(7)}</div><p class="timeline-caption">Hook 钩子 · 0.0s - 3.5s</p>`;
}
function promptBlock(extra = '') {
  return `<section class="prompt ${extra}"><div class="section-head prompt-head"><h2><span class="icon-tile">${icon('magic')}</span>提示词反推</h2><div class="prompt-actions">${button('中文','down','small')}${button('复制','copy','small')}</div></div><p class="prompt-text" data-verify="prompt">${esc(prompt)}</p></section>`;
}
function summary(title) {
  return `<section class="summary">${heading(title,'magic')}<div class="summary-grid">${field('整体策略',data.strategy,'strategy')}${field('目标受众',data.audience,'audience')}</div></section>`;
}
function sceneList() {
  return `<nav class="stage-list" aria-label="场景拆解">${scenes.map(([name,time],i)=>`<div class="stage-row ${i===0?'selected':''}" data-scene="${i}"><div class="stage-top"><span class="stage-name">${esc(name)}</span></div><span class="stage-time">${esc(time)}</span></div>`).join('')}</nav>`;
}
function stageList(stages) {
  return `<nav class="stage-list" aria-label="阶段列表">${stages.map(([seq,name,time,purpose],i)=>`<div class="stage-row ${i===0?'selected':''}" data-stage="${i}"><div class="stage-top"><span class="seq">${esc(seq)}</span><span class="stage-name">${esc(name)}</span><span class="stage-time">${esc(time)}</span></div><div class="stage-purpose">${esc(purpose)}</div></div>`).join('')}</nav>`;
}
function analysisPage() {
  const detail = `<article class="detail"><div class="field why"><div class="field-label">${icon('bulb')}为什么有效</div><p class="field-value" data-verify="why">${esc(data.why)}</p></div>${field('旁白',data.narration,'narration','voice')}${field('视觉描述',visual,'visual')}</article>`;
  const recommendations = `<section class="lower-section">${heading('建议下一步','bulb')}<div class="suggestions">${data.suggestions.map(([title,body])=>`<article class="suggestion"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('')}</div></section>`;
  const creativeCrops = [[1082,775,282,158],[1393,775,282,158],[1703,775,282,158]];
  const similar = `<section class="lower-section">${heading('相似创意推荐','picture','3 条素材')}<div class="creative-grid">${creativeCrops.map((xy,i)=>`<article class="creative">${crop(creativeImage,...xy,'相似创意推荐封面'+(i+1))}<div class="creative-body"><h3>${esc(data.creativeTitle)}</h3><p class="platform">${esc(data.platform)}</p></div></article>`).join('')}</div></section>`;
  return wrap('拆解分析结果',`<div class="window"><header class="window-header"><div class="header-meta">${button('','arrow','icon-only plain')}<h1>T恤多色快剪广告</h1><span class="status">已完成</span><span class="meta">21.0s 视频</span></div><div class="actions">${button('去复刻','magic','primary')}${button('分享','share','plain')}</div></header><div class="window-body"><div class="analysis-grid"><aside class="reference">${video()}${promptBlock()}</aside><div class="results">${summary('叙事策略全景')}<section>${heading('场景拆解','layers','7 个场景')}<div class="stage-workspace">${sceneList()}${detail}</div></section>${recommendations}${similar}</div></div></div></div>`);
}
function projectHeader(active) {
  const steps = ['爆款拆解','新商品信息确认','脚本转写','视频生成'];
  return `<header class="project-header"><div class="header-meta">${button('','arrow','icon-only')}<h1>女生口播</h1>${icon('edit').replace('<svg','<svg class="edit-icon"')}</div>${button('刷新','refresh')}</header><div class="stepper">${steps.map((s,i)=>`${i?'<span class="step-line"></span>':''}<div class="step ${i===active?'active':''}"><span class="step-circle">${i===active?i+1:icon('check')}</span>${s}</div>`).join('')}</div>`;
}
function shotHead(time) {
  return `<div class="shot-head"><h3>分镜</h3><span class="shot-id">分镜 1</span><span class="shot-time">${time}</span></div>`;
}
function sourcePage() {
  const entities = `<section class="entities">${data.entities.map(([label,value,ic])=>`<div class="entity">${icon(ic)}<div><div class="field-label">${label}</div><div class="value">${value}</div></div></div>`).join('')}</section>`;
  const detail = `<article class="detail">${shotHead('0–4秒')}${field('口播内容',data.sourceSpeech,'sourceSpeech','voice')}${field('口播翻译',data.sourceTranslation,'sourceTranslation','voice translation')}${field('画面内容',visual,'visual')}</article>`;
  const footer = `<footer class="footer">${button('返回项目列表','arrow','plain')}<div class="footer-right"><div class="boundary"><strong>复制边界</strong><span><b>保留：</b>创意策略、叙事结构</span><span><b>替换：</b>商品信息、人物、适配新产品卖点、口播</span></div>${button('立即复刻','right','primary')}</div></footer>`;
  return wrap('查看爆款拆解结果',`${projectHeader(0)}<div class="page-heading"><div><h1>查看爆款拆解结果</h1><p class="page-subtitle">理解爆款视频为什么有效：包括爆款创意策略、视频叙事结构、核心商品和人物有什么特点</p></div>${button('重新拆解','refresh')}</div><div class="workspace-shell"><div class="source-grid"><aside class="reference">${video(true)}${entities}</aside><div class="results">${summary('策略摘要')}<section>${heading('叙事结构','layers','7 个叙事阶段')}<div class="stage-workspace">${stageList(sourceStages)}${detail}</div></section></div></div>${promptBlock('source-prompt')}</div>${footer}`,true);
}
function scriptPage() {
  const strategy = `<section class="script-summary">${heading('新创意策略摘要','magic','6 个叙事阶段 · 6 个分镜')}${field('创意策略',newStrategy,'newStrategy')}</section>`;
  const keywords = `<div class="keywords"><div class="field-label">关键信息</div><div class="tags">${data.keywords.map(tag).join('')}</div></div>`;
  const detail = `<article class="detail">${keywords}${shotHead('0–3.5秒')}${field('口播内容',data.scriptSpeech,'scriptSpeech','voice')}${field('口播翻译',data.scriptTranslation,'scriptTranslation','voice translation')}${field('画面内容',newVisual,'newVisual')}</article>`;
  const footer = `<footer class="footer script-footer">${button('返回上一步','arrow','plain')}<div class="footer-right">${button('重新生成脚本','refresh')}${button('种子舞 2.0','chip','setting')}${button('不生成字幕','subtitle','setting')}${button('720P · 9:16 · 预估21s','sliders','setting')}<span class="cost">${icon('bolt')}252</span>${button('生成视频','right','primary')}</div></footer>`;
  return wrap('确认转写后的脚本',`${projectHeader(2)}<div class="page-heading"><div><h1>确认转写后的脚本</h1><p class="page-subtitle">继承参考视频的爆款叙事骨架，完成新商品策略、阶段结构、镜头、口播与字幕的整套转写</p></div></div>${strategy}<section><div class="script-section-head"><h2>分镜脚本</h2><span class="edit-caption">（可校正修改口播文案）</span><p class="page-subtitle">按参考视频叙事阶段组织，阶段内拆分为可直接执行的镜头</p></div><div class="script-workspace">${stageList(scriptStages)}${detail}</div></section>${footer}`,true);
}

fs.mkdirSync(out, {recursive:true});
const pages = [
  {name:'01_拆解分析结果',title:'拆解分析结果',html:analysisPage(),fields:{strategy:data.strategy,audience:data.audience,prompt,why:data.why,narration:data.narration,visual},count:7,type:'scene'},
  {name:'02_复刻第二步_爆款拆解结果',title:'爆款拆解结果',html:sourcePage(),fields:{strategy:data.strategy,audience:data.audience,prompt,sourceSpeech:data.sourceSpeech,sourceTranslation:data.sourceTranslation,visual},count:7,type:'stage'},
  {name:'03_复刻第四步_脚本结果',title:'脚本结果',html:scriptPage(),fields:{newStrategy,scriptSpeech:data.scriptSpeech,scriptTranslation:data.scriptTranslation,newVisual},count:6,type:'stage'}
];
for (const p of pages) fs.writeFileSync(path.join(out,p.name+'.html'),p.html,'utf8');
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>新版结果页面原型</title><style>body{font:16px/1.8 'Microsoft YaHei',sans-serif;background:#f2f6eb;margin:60px;color:#263829}h1{font-size:26px}a{color:#28704f}li{margin:24px 0}</style><h1>新版结果页面原型</h1><p>三张静态原型。仅删减展示字段并重新布局，保留字段内容沿用原文。</p><ol>${pages.map(p=>`<li><a href="${p.name}.html">${p.title} · HTML</a>　<a href="${p.name}.png">完整原型图 · PNG</a></li>`).join('')}</ol></html>`,'utf8');

(async()=>{
  const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  const reports=[];
  try {
    const page = await browser.newPage({viewport:{width:1800,height:1100},deviceScaleFactor:1});
    for (const p of pages) {
      await page.goto(pathToFileURL(path.join(out,p.name+'.html')).href);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
      for (const [id,value] of Object.entries(p.fields)) {
        const actual = await page.locator(`[data-verify="${id}"]`).textContent();
        if(actual!==value) throw new Error(`${p.name} changed field: ${id}`);
      }
      const count=await page.locator(`[data-${p.type}]`).count();
      if(count!==p.count)throw new Error('Wrong scene or stage count');
      const text=await page.locator('body').innerText();
      for(const label of ['HOOK 机制','说服路径','情绪曲线','主持人：','讲话者','时长 4s','时长 3.5s','原文占位','覆盖 0'])if(text.includes(label))throw new Error('Unexpected removed/placeholder field: '+label);
      if(await page.locator('textarea,input').count())throw new Error('Unwanted text inputs');
      const voice=await page.locator('.voice-text').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return{background:s.backgroundColor,border:s.borderTopWidth,padding:s.padding,shadow:s.boxShadow};}));
      if(voice.some(v=>v.background!=='rgba(0, 0, 0, 0)'||v.border!=='0px'||v.padding!=='0px'||v.shadow!=='none'))throw new Error('Voice text not plain');
      const geometry=[];
      for (const width of [1800,1366]) {
        await page.setViewportSize({width,height:1100});
        geometry.push(await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,brokenImages:[...document.images].filter(i=>!i.naturalWidth).length,overflowingText:[...document.querySelectorAll('.field-value,.prompt-text,.stage-purpose,.creative h3')].filter(e=>e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1).length})));
      }
      if(geometry.some(g=>g.width>g.viewport||g.brokenImages||g.overflowingText))throw new Error('Layout overflow: '+JSON.stringify(geometry));
      await page.setViewportSize({width:1800,height:1100});
      await page.screenshot({path:path.join(out,p.name+'.png'),fullPage:true});
      reports.push({page:p.name,verifiedFields:Object.keys(p.fields),count,voice,geometry});
    }
    fs.writeFileSync(path.join(out,'字段与布局核对.json'),JSON.stringify({specification,pages:reports},null,2),'utf8');
    console.log(JSON.stringify({output:out,pages:reports},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
