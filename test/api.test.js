/**
 * Minimal integration tests using Supertest + Jest
 * Runs against local server started by CI (or in Node env).
 *
 * NOTE: In CI we run 
pm test which expects server to be startable via 
ode server.cjs
 * If your project starts differently update the 'test' script in package.json accordingly.
 */

const request = require('supertest');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

describe('transparency endpoints', () => {
  test('/api/admin-stats returns 200 and JSON', async () => {
    const res = await request(BASE).get('/api/admin-stats').timeout(5000);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  }, 10000);

  test('/transparency-commitment returns 200', async () => {
    const res = await request(BASE).get('/transparency-commitment').timeout(5000);
    expect([200, 304]).toContain(res.status);
  }, 10000);
});
