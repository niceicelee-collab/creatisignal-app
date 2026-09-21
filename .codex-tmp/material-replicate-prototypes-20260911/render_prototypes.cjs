const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = 'D:/Cursor/creatisignal-app-new/deliverables/material-replicate-prototypes-20260911';
const original = JSON.parse(fs.readFileSync(path.join(root, '字段保留核对.json'), 'utf8'));
(async()=>{
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const results=[];
  try {
    for (const name of ['爆款视频拆解结果','脚本结果']) {
      const page = await browser.newPage({ viewport:{width:1600,height:1020},deviceScaleFactor:1 });
      await page.goto(pathToFileURL(path.join(root,name+'.html')).href);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()));});
      const fields = await page.locator('.field-label').allTextContents();
      const values = await page.locator('.field-value').allTextContents();
      const expected = name === '爆款视频拆解结果' ? [original.strategy,original.audience,original.breakdownStrategy,original.breakdownDescription] : [original.strategy,original.promise,original.voiceover,original.scriptVisual];
      if (JSON.stringify(values)!==JSON.stringify(expected)) throw Error(name+' retained field values mismatch');
      const expectedFields=name==='爆款视频拆解结果'?['整体策略','目标受众','创意策略','创意描述']:['创意策略','核心承诺','关键信息','口播内容','画面内容'];
      if(JSON.stringify(fields)!==JSON.stringify(expectedFields))throw Error(name+' retained field labels mismatch');
      await page.screenshot({ path:path.join(root,name+'.png'),fullPage:true });
      const geometry=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,missingImages:[...document.images].filter(x=>!x.complete||!x.naturalWidth).length}));
      await page.setViewportSize({width:1366,height:768});
      const narrow=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));
      if(geometry.scrollWidth>geometry.width||narrow.scrollWidth>narrow.width||geometry.missingImages)throw Error(name+' layout check failed');
      results.push({name,retained_fields:fields,retained_values_match:true,geometry,narrow});
      await page.close();
    }
  }finally{await browser.close();}
  fs.writeFileSync('D:/Cursor/creatisignal-app-new/.codex-tmp/material-replicate-prototypes-20260911/qa.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
