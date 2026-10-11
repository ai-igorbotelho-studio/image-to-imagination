// Usage: node run-spike.mjs [profile=desktop|mobile] [image]   (Chromium only; Safari/real devices = manual script in the report)
import {createRequire} from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import {spawn} from 'node:child_process'; import {fileURLToPath} from 'node:url';
const require = createRequire('/opt/node22/lib/node_modules/');
const {chromium, devices} = require('playwright');
const root = path.dirname(fileURLToPath(import.meta.url));
const profile = process.argv[2] || 'desktop', imgs = process.argv[3] ? [process.argv[3]] : ['portrait-of-woman_small.jpg','tiger.jpg','cats.jpg','bread_small.png'];
const PORT = 8765 + Math.floor(Math.random()*500);
const srv = spawn('node', [path.join(root,'serve.mjs')], {env:{...process.env, PORT:String(PORT)}, stdio:'ignore'});
await new Promise(r=>setTimeout(r,800));
const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--enable-unsafe-webgpu','--enable-features=SharedArrayBuffer']});
const ctxOpts = profile==='mobile' ? {...devices['iPhone 13'], defaultBrowserType:undefined} : {viewport:{width:1280,height:800}};
delete ctxOpts.defaultBrowserType;
const ctx = await browser.newContext(ctxOpts); const page = await ctx.newPage();
page.on('console', m=>{ if(m.type()==='error' && !/constant_folding/.test(m.text())) console.log('[page error]', m.text().slice(0,300)); });
page.on('pageerror', e=>console.log('[pageerror]', String(e).slice(0,300)));
if(profile==='mobile'){ const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate',{rate:4}); }
await page.goto(`http://localhost:${PORT}/index.html`); await page.waitForFunction(()=>window.benchReady);
const env = await page.evaluate(()=>({ua:navigator.userAgent,isolated:crossOriginIsolated,cores:navigator.hardwareConcurrency,mem:navigator.deviceMemory,webgpu:!!navigator.gpu,vw:innerWidth,vh:innerHeight}));
const results = {profile, env, runs:[]}; console.log(JSON.stringify(env));
results.canvas = await page.evaluate(()=>probeCanvas());
const only = (process.env.ONLY||'').split(',').filter(Boolean);
const segs = (only.length?only:['modnet_q','modnet_fp16','birefnet_lite_fp16']);
const threadsList = (process.env.THREADS||'1,4').split(',').map(Number);
for (const img of imgs) {
  const b64 = fs.readFileSync(path.join(root,'samples',img)).toString('base64');
  const mime = img.endsWith('.png')?'image/png':'image/jpeg';
  for (const seg of segs) for (const th of (profile==='mobile'?[1]:threadsList)) {
    try {
      await page.evaluate(async ([b64,mime])=>{ const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)); await loadImageFromBlob(new Blob([bin],{type:mime})); },[b64,mime]);
      // run twice: cold (load+first) then warm
      const cold = await page.evaluate(([s,t])=>segment(s,'wasm',t),[seg,th]);
      const warm = await page.evaluate(([s,t])=>segment(s,'wasm',t),[seg,th]);
      results.runs.push({img,cold,warm}); console.log(img,seg,'th',th,'cold',cold.totalMs,'warm infer',warm.inferMs,'heap',warm.heapAfterMB);
      const png = await page.evaluate(()=>getCut().toDataURL('image/png'));
      fs.writeFileSync(path.join(root,'results',`${profile}_${img.replace(/\.\w+$/,'')}_${seg}_t${th}.png`), Buffer.from(png.split(',')[1],'base64'));
    } catch(e){ console.log('ERR',img,seg,th,String(e).slice(0,300)); results.runs.push({img,seg,th,error:String(e).slice(0,300)}); }
  }
}
// upscale test on the cutout of the first image using MODNet result (fast) at x2
for (const up of (process.env.UP||'swin2sr_x2_q,swin2sr_x2_fp16').split(',').filter(Boolean)) {
  try {
    const b64 = fs.readFileSync(path.join(root,'samples',imgs[0])).toString('base64'); const mime = imgs[0].endsWith('.png')?'image/png':'image/jpeg';
    await page.evaluate(async ([b64,mime])=>{ const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)); await loadImageFromBlob(new Blob([bin],{type:mime})); },[b64,mime]);
    const r = await page.evaluate(([u])=>upscale(u,96,8,getSrc()),[up]);
    results.runs.push({upscale:r}); console.log('upscale',up,JSON.stringify(r));
    const png = await page.evaluate(()=>getCut().toDataURL('image/png')); fs.writeFileSync(path.join(root,'results',`${profile}_up_${up}.png`), Buffer.from(png.split(',')[1],'base64'));
  } catch(e){ console.log('ERR upscale',up,String(e).slice(0,300)); results.runs.push({upscale:up,error:String(e).slice(0,300)}); }
}
// styles + patterns on the original (timing)
results.styles = [];
for (const k of ['halftone','duotone','posterize','sketch']) results.styles.push(await page.evaluate(k=>applyStyle(k,getSrc()),k));
for (const k of ['grid','halfdrop','mirror']) results.styles.push(await page.evaluate(k=>applyPattern(k,4,2000,2000,getSrc()),k));
for (const k of ['halftone','sketch','duotone']) { await page.evaluate(k=>applyStyle(k,getSrc()),k); fs.writeFileSync(path.join(root,'results',`${profile}_style_${k}.png`), Buffer.from((await page.evaluate(()=>document.getElementById('out').toDataURL('image/png'))).split(',')[1],'base64')); }
await page.evaluate(()=>applyPattern('halfdrop',4,1200,1200,getSrc())); fs.writeFileSync(path.join(root,'results',`${profile}_pattern_halfdrop.png`), Buffer.from((await page.evaluate(()=>document.getElementById('out').toDataURL('image/png'))).split(',')[1],'base64'));
fs.writeFileSync(path.join(root,'results',`${profile}.json`), JSON.stringify(results,null,1));
await browser.close(); srv.kill();
