import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

export function createAppServer() {
  return createServer(async (request, response) => {
    let requestPath;
    try {
      requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' }).end('请求地址格式无效');
      return;
    }
    const relativePath = requestPath === '/' ? 'index.html' : requestPath.slice(1);
    const filePath = resolve(root, relativePath);

    if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end('禁止访问');
      return;
    }

    try {
      const body = await readFile(filePath);
      response.writeHead(200, {
        'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
        'x-content-type-options': 'nosniff',
      });
      response.end(body);
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('页面不存在');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4173);
  createAppServer().listen(port, '127.0.0.1', () => {
    console.log(`光储方案台已启动：http://127.0.0.1:${port}`);
  });
}
