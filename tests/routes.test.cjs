const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
const router = require('../dist/routes').default;
let server;
let base;
before(async () => {
  const app = express();
  app.use(express.json(), cookieParser());
  app.use(express.static(require('node:path').join(__dirname, '../frontend')));
  app.use('/api/v1', router);
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(() => new Promise(resolve => server.close(resolve)));

function cookie(role, options = {}) {
  return `accessToken=${jwt.sign({ userId: 'test-user', role }, process.env.JWT_SECRET, { expiresIn: '15m', ...options })}`;
}
test('frontend is publicly served with its router assets', async () => {
  const response = await fetch(base.replace('/api/v1', '/'));
  assert.equal(response.status, 200);
  assert.match(await response.text(), /app.js/);
  assert.equal((await fetch(base.replace('/api/v1', '/app.js'))).status, 200);
});
test('login and registration are public and reach input validation', async () => {
  for (const path of ['/auth/login', '/auth/register']) {
    const response = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, 400);
  }
});
test('private routes reject missing and invalid sessions', async () => {
  for (const path of ['/auth/me', '/admin', '/students/search', '/subjects/search']) {
    for (const token of ['', 'accessToken=invalid']) {
      const response = await fetch(base + path, { method: path.endsWith('/search') ? 'POST' : 'GET', headers: { Cookie: token } });
      assert.equal(response.status, 401);
    }
  }
});
test('authenticated USER can access private session route', async () => {
  const response = await fetch(base + '/auth/me', { headers: { Cookie: cookie('USER') } });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data, { id: 'test-user', role: 'USER' });
});
test('USER can reach validation on private list routes', async () => {
  for (const path of ['/students/search', '/subjects/search']) {
    const response = await fetch(base + path, { method: 'POST', headers: { Cookie: cookie('USER'), 'Content-Type': 'application/json' }, body: '{"limit":0}' });
    assert.equal(response.status, 400);
  }
});
test('USER cannot access admin or mutate either resource', async () => {
  for (const [method, path] of [
    ['GET', '/admin'], ['POST', '/students'], ['PUT', '/students/id'], ['DELETE', '/students/id'],
    ['POST', '/subjects'], ['PUT', '/subjects/id'], ['DELETE', '/subjects/id'],
  ]) {
    const response = await fetch(base + path, { method, headers: { Cookie: cookie('USER') } });
    assert.equal(response.status, 403, `${method} ${path}`);
  }
});
test('ADMIN can access admin and reach resource validation', async () => {
  assert.equal((await fetch(base + '/admin', { headers: { Cookie: cookie('ADMIN') } })).status, 200);
  for (const path of ['/students', '/subjects']) {
    const response = await fetch(base + path, { method: 'POST', headers: { Cookie: cookie('ADMIN'), 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, 400);
  }
});
test('expired session is rejected, valid refresh restores session', async () => {
  const expired = cookie('USER', { expiresIn: -1 });
  assert.equal((await fetch(base + '/auth/me', { headers: { Cookie: expired } })).status, 401);
  const refresh = jwt.sign({ userId: 'test-user', role: 'USER' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  const response = await fetch(base + '/auth/me', { headers: { Cookie: `${expired}; refreshToken=${refresh}` } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /accessToken=/);
});
