import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { root } from './workspace.mjs';

const directory = resolve(root, 'dist/site');
const port = Number(process.env.MP_PORT || 8000);
const mediaTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const path = resolve(directory, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
    if (!path.startsWith(`${directory}${sep}`)) { response.writeHead(403); response.end(); return; }
    if (!(await stat(path)).isFile()) throw new Error('Not found');
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': mediaTypes[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}/`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
