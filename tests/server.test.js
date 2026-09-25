import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../server.js';

test('serves the Chinese application shell over HTTP', async () => {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html; charset=utf-8/);
    assert.match(html, /lang="zh-CN"/);
    assert.match(html, /向阳 · 光储估算/);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('does not serve files outside the application directory', async () => {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/%2e%2e%5cpackage.json`);
    assert.equal(response.status, 403);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('returns a client error for malformed URL encoding', async () => {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/%E0%A4%A`);
    assert.equal(response.status, 400);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
