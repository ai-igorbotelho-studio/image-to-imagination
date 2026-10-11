// Stage 2 bench: plain JS, no build. Models run via onnxruntime-web (MIT) loaded from ./vendor.
const $ = id => document.getElementById(id);
const log = m => { $('log').textContent += m + '\n'; console.log(m); };
const out = $('out');
let srcCanvas = null, cutCanvas = null, lastResult = null;
const sessions = {};

ort.env.wasm.wasmPaths = new URL('./vendor/', location.href).href;

const heap = () => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
const now = () => performance.now();

async function loadImageFromBlob(blob) {
  const bmp = await createImageBitmap(blob);
  const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
  c.getContext('2d').drawImage(bmp, 0, 0); srcCanvas = c; cutCanvas = null;
  $('imginfo').textContent = `${c.width}x${c.height}`;
  show(c); return c;
}
function show(c) { out.width = c.width; out.height = c.height; out.getContext('2d').drawImage(c, 0, 0); }
$('file').onchange = e => loadImageFromBlob(e.target.files[0]);

async function getSession(name, ep, threads) {
  const key = `${name}|${ep}|${threads}`;
  if (sessions[key]) return { s: sessions[key], loadMs: 0, cached: true };
  ort.env.wasm.numThreads = threads;
  const t0 = now();
  const buf = await (await fetch(`models/${name}.onnx`)).arrayBuffer();
  const tFetch = now() - t0;
  const s = await ort.InferenceSession.create(buf, { executionProviders: [ep] });
  sessions[key] = s;
  return { s, loadMs: now() - t0, fetchMs: tFetch, cached: false, bytes: buf.byteLength };
}

function toCHW(canvas, W, H, mean, std) {
  const r = document.createElement('canvas'); r.width = W; r.height = H;
  r.getContext('2d').drawImage(canvas, 0, 0, W, H);
  const d = r.getContext('2d').getImageData(0, 0, W, H).data;
  const f = new Float32Array(3 * W * H), n = W * H;
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) f[c * n + i] = (d[i * 4 + c] / 255 - mean[c]) / std[c];
  return f;
}
const sigmoid = x => 1 / (1 + Math.exp(-x));

export async function segment(name, ep = 'wasm', threads = 1) {
  const m0 = heap(); const t0 = now();
  const { s, loadMs, cached, bytes } = await getSession(name, ep, threads);
  // per-model preprocessing (from each model card / preprocessor_config)
  const cfg = name.startsWith('birefnet') ? { S: window.BIREF_SIZE || 1024, mean: [0.485, 0.456, 0.406], std: [0.229, 0.224, 0.225], sig: true, mm: false }
    : name.startsWith('isnet') ? { S: 1024, mean: [0.5, 0.5, 0.5], std: [1, 1, 1], sig: false, mm: true }
    : name.startsWith('u2net') ? { S: 320, mean: [0.485, 0.456, 0.406], std: [0.229, 0.224, 0.225], sig: false, mm: true }
    : { S: 512, mean: [0.5, 0.5, 0.5], std: [0.5, 0.5, 0.5], sig: false, mm: false }; // modnet
  const S = cfg.S, isBi = cfg.sig;
  const f = toCHW(srcCanvas, S, S, cfg.mean, cfg.std);
  const inName = s.inputNames[0], outName = s.outputNames[0];
  const t1 = now();
  const res = await s.run({ [inName]: new ort.Tensor('float32', f, [1, 3, S, S]) });
  const infMs = now() - t1;
  const o = res[outName]; const od = o.data;
  let mn = 0, mxv = 1; if (cfg.mm) { mn = Infinity; mxv = -Infinity; for (let i = 0; i < S * S; i++) { const v = Number(od[i]); if (v < mn) mn = v; if (v > mxv) mxv = v; } }
  const mask = document.createElement('canvas'); mask.width = S; mask.height = S;
  const mc = mask.getContext('2d'); const id = mc.createImageData(S, S);
  for (let i = 0; i < S * S; i++) {
    let v = Number(od[i]); if (isBi) v = sigmoid(v); if (cfg.mm) v = (v - mn) / (mxv - mn || 1);
    id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = 255; id.data[i * 4 + 3] = Math.max(0, Math.min(255, v * 255));
  }
  mc.putImageData(id, 0, 0);
  // composite alpha at source resolution (bilinear upscaling of mask)
  const W = srcCanvas.width, H = srcCanvas.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const cx = c.getContext('2d'); cx.drawImage(srcCanvas, 0, 0);
  cx.globalCompositeOperation = 'destination-in'; cx.imageSmoothingQuality = 'high'; cx.drawImage(mask, 0, 0, W, H);
  cutCanvas = c; show(c);
  const r = { stage: 'segment', model: name, ep, threads, src: `${W}x${H}`, inputName: inName, inputType: s.inputMetadata?.[0]?.type ?? null,
    modelBytesMB: bytes ? +(bytes / 1048576).toFixed(1) : null, loadMs: Math.round(loadMs), cached, inferMs: Math.round(infMs), totalMs: Math.round(now() - t0),
    heapBeforeMB: m0, heapAfterMB: heap() };
  log(JSON.stringify(r)); lastResult = r; return r;
}

// Tiled x2 upscale on RGB (alpha channel upscaled separately by bicubic-ish canvas scaling).
export async function upscale(name, tile = 96, pad = 8, base = null, SC = name.includes('x4') ? 4 : 2) {
  const src = base || cutCanvas || srcCanvas; const m0 = heap(); const t0 = now();
  const { s, loadMs, cached } = await getSession(name, 'wasm', ort.env.wasm.numThreads || 1);
  const W = src.width, H = src.height;
  const outC = document.createElement('canvas'); outC.width = W * SC; outC.height = H * SC;
  const ox = outC.getContext('2d'); const sd = src.getContext('2d').getImageData(0, 0, W, H).data;
  // alpha: smooth canvas upscale
  const aC = document.createElement('canvas'); aC.width = W * SC; aC.height = H * SC;
  const ax = aC.getContext('2d'); ax.imageSmoothingQuality = 'high'; ax.drawImage(src, 0, 0, W * SC, H * SC);
  const alpha = ax.getImageData(0, 0, W * SC, H * SC).data;
  const outImg = ox.createImageData(W * SC, H * SC);
  let tiles = 0, tInf = 0;
  const inName = s.inputNames[0], outName = s.outputNames[0];
  const shp = s.inputMetadata?.[0]?.shape; const fixed = shp && typeof shp[3] === 'number' ? shp[3] : 0; // fixed-shape models (Real-ESRGAN compact export = 128)
  if (fixed) tile = fixed - 2 * pad;
  for (let ty = 0; ty < H; ty += tile) for (let tx = 0; tx < W; tx += tile) {
    const x0 = Math.max(0, tx - pad), y0 = Math.max(0, ty - pad);
    const x1 = Math.min(W, tx + tile + pad), y1 = Math.min(H, ty + tile + pad);
    // pad up to multiple of 8 via edge clamp (Swin2SR window = 8)
    const w = x1 - x0, h = y1 - y0, pw = fixed || Math.ceil(w / 8) * 8, ph = fixed || Math.ceil(h / 8) * 8;
    const f = new Float32Array(3 * pw * ph);
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
      const sx = Math.min(W - 1, x0 + x), sy = Math.min(H - 1, y0 + y), si = (sy * W + sx) * 4;
      for (let c = 0; c < 3; c++) f[c * pw * ph + y * pw + x] = sd[si + c] / 255;
    }
    const t1 = now();
    const r = await s.run({ [inName]: new ort.Tensor('float32', f, [1, 3, ph, pw]) });
    tInf += now() - t1; tiles++;
    const o = r[outName].data, ow = pw * SC, oh = ph * SC;
    for (let y = (ty - y0) * SC; y < (Math.min(H, ty + tile) - y0) * SC; y++) for (let x = (tx - x0) * SC; x < (Math.min(W, tx + tile) - x0) * SC; x++) {
      const gx = x0 * SC + x, gy = y0 * SC + y, di = (gy * W * SC + gx) * 4;
      for (let c = 0; c < 3; c++) outImg.data[di + c] = Math.max(0, Math.min(255, o[c * ow * oh + y * ow + x] * 255));
      outImg.data[di + 3] = alpha[di + 3];
    }
  }
  ox.putImageData(outImg, 0, 0);
  show(outC); cutCanvas = outC;
  const res = { stage: 'upscale', model: name, tile, tiles, src: `${W}x${H}`, dst: `${outC.width}x${outC.height}`, loadMs: Math.round(loadMs), cached,
    inferMs: Math.round(tInf), totalMs: Math.round(now() - t0), msPerSrcMP: Math.round(tInf / (W * H / 1e6)), heapBeforeMB: m0, heapAfterMB: heap() };
  log(JSON.stringify(res)); lastResult = res; return res;
}

// Canvas limits: largest square canvas that allocates AND returns pixels; area probe. Safari (iOS) documented limit ~16.7 MP (16,777,216 px) [unverified, verify on device].
export function probeCanvas() {
  const tests = [[4096, 4096], [4500, 5400], [5000, 5000], [8192, 8192], [10000, 10000], [16384, 16384]];
  const out = tests.map(([w, h]) => {
    let ok = false, readback = false, err = null;
    try { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
      ok = !!x; if (x) { x.fillStyle = '#f00'; x.fillRect(w - 1, h - 1, 1, 1); readback = x.getImageData(w - 1, h - 1, 1, 1).data[0] === 255; } } catch (e) { err = String(e); }
    return { size: `${w}x${h}`, mp: +(w * h / 1e6).toFixed(1), ok, readback, err };
  });
  log(JSON.stringify({ stage: 'canvas-limits', ua: navigator.userAgent, deviceMemoryGB: navigator.deviceMemory ?? null, cores: navigator.hardwareConcurrency, webgpu: !!navigator.gpu, results: out }));
  return out;
}

// ---------- Canvas styles (deterministic, no model) ----------
export function applyStyle(kind, base = null) {
  const src = base || cutCanvas || srcCanvas; const W = src.width, H = src.height; const t0 = now();
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const d = src.getContext('2d').getImageData(0, 0, W, H); const p = d.data; const lum = i => 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
  if (kind === 'posterize') { const L = 4, k = 255 / (L - 1); for (let i = 0; i < p.length; i += 4) for (let j = 0; j < 3; j++) p[i + j] = Math.round(p[i + j] / 255 * (L - 1)) * k; x.putImageData(d, 0, 0); }
  else if (kind === 'duotone') { const a = [20, 30, 90], b = [255, 200, 80]; for (let i = 0; i < p.length; i += 4) { const t = lum(i) / 255; for (let j = 0; j < 3; j++) p[i + j] = a[j] + (b[j] - a[j]) * t; } x.putImageData(d, 0, 0); }
  else if (kind === 'sketch') { // Sobel edges on luminance
    const g = new Float32Array(W * H); for (let i = 0; i < W * H; i++) g[i] = lum(i * 4);
    const o = x.createImageData(W, H);
    for (let y = 1; y < H - 1; y++) for (let xx = 1; xx < W - 1; xx++) { const i = y * W + xx;
      const gx = -g[i - W - 1] - 2 * g[i - 1] - g[i + W - 1] + g[i - W + 1] + 2 * g[i + 1] + g[i + W + 1];
      const gy = -g[i - W - 1] - 2 * g[i - W] - g[i - W + 1] + g[i + W - 1] + 2 * g[i + W] + g[i + W + 1];
      const v = 255 - Math.min(255, Math.hypot(gx, gy) * 1.2); const k = i * 4; o.data[k] = o.data[k + 1] = o.data[k + 2] = v; o.data[k + 3] = p[k + 3]; }
    x.putImageData(o, 0, 0);
  } else { // halftone: dots on a rotated grid, size by luminance, color kept
    const cell = Math.max(6, Math.round(Math.min(W, H) / 70)); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    for (let cy = 0; cy < H; cy += cell) for (let cx = 0; cx < W; cx += cell) { const px = Math.min(W - 1, cx + (cell >> 1)), py = Math.min(H - 1, cy + (cell >> 1)), i = (py * W + px) * 4;
      if (p[i + 3] < 20) continue; const r = (1 - lum(i) / 255) * cell * 0.75 + 0.5; x.fillStyle = `rgb(${p[i]},${p[i + 1]},${p[i + 2]})`; x.beginPath(); x.arc(cx + cell / 2, cy + cell / 2, r, 0, 6.2832); x.fill(); }
    x.globalCompositeOperation = 'destination-in'; x.drawImage(src, 0, 0);
  }
  show(c); const r = { stage: 'style', kind, size: `${W}x${H}`, ms: Math.round(now() - t0) }; log(JSON.stringify(r)); return r;
}

// ---------- Patterns (seamless by construction) ----------
export function applyPattern(kind, tilesPerRow = 4, outW = 2000, outH = 2000, base = null) {
  const src = base || cutCanvas || srcCanvas; const t0 = now();
  const c = document.createElement('canvas'); c.width = outW; c.height = outH; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, outW, outH);
  const tw = outW / tilesPerRow, th = tw * src.height / src.width;
  for (let row = -1, y = 0; y < outH + th; row++, y = row * th) for (let i = -1; i <= tilesPerRow; i++) {
    let px = i * tw, py = y; if (kind === 'halfdrop' && (i & 1)) py += th / 2;
    x.save(); x.translate(px + tw / 2, py + th / 2);
    if (kind === 'mirror') x.scale((i & 1) ? -1 : 1, (row & 1) ? -1 : 1);
    x.drawImage(src, -tw / 2, -th / 2, tw, th); x.restore();
  }
  show(c); const r = { stage: 'pattern', kind, out: `${outW}x${outH}`, ms: Math.round(now() - t0) }; log(JSON.stringify(r)); return r;
}

$('bSeg').onclick = () => segment($('seg').value, $('ep').value, +$('threads').value);
$('bUp').onclick = () => upscale($('up').value, +$('tile').value);
$('bLimits').onclick = probeCanvas;
$('bStyle').onclick = () => applyStyle($('style').value);
$('bPat').onclick = () => applyPattern($('pat').value);
Object.assign(window, { segment, upscale, probeCanvas, applyStyle, applyPattern, loadImageFromBlob, benchReady: true, getSrc: () => srcCanvas, getCut: () => cutCanvas, setCut: c => { cutCanvas = c; } });
