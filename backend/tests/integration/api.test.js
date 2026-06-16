const request = require('supertest');
const app = require('../../src/app');

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('GET /health should return 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET / should return 200', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for unknown API routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('Security Headers', () => {
    it('should include helmet security headers', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['x-content-type-options']).toBeDefined();
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers on OPTIONS', async () => {
      const res = await request(app)
        .options('/')
        .set('Origin', 'http://localhost:3000');
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('API Routes Registration (non-DB)', () => {
    it('health check route is registered', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });
});
