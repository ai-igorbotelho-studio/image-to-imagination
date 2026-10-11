// Minimal static server (node, no deps). Adds COOP/COEP so SharedArrayBuffer/WASM threads work.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const types = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.wasm':'application/wasm','.png':'image/png','.jpg':'image/jpeg','.onnx':'application/octet-stream'};
const port = +process.env.PORT || 8765;
http.createServer((req,res)=>{
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+$/,'/index.html'));
  if(!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){res.writeHead(404);return res.end('404');}
  res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream','Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp','Cache-Control':'no-store'});
  fs.createReadStream(p).pipe(res);
}).listen(port,()=>console.log('http://localhost:'+port));
