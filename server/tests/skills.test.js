import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';

describe('Company Skills & Benchmark Criteria Suite', () => {
  let adminToken = '';

  beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@hireiq.com',
      password: 'Admin@123456',
    });
    adminToken = loginRes.body.data.accessToken;
  });

  it('GET /api/skills should return skills list and benchmark stats', async () => {
    const res = await request(app)
      .get('/api/skills')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.skills)).toBe(true);
    expect(res.body.data.stats).toBeDefined();
    expect(typeof res.body.data.stats.avgBenchmark).toBe('number');
  });

  it('POST /api/skills should create or configure a new skill benchmark', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'GraphQL',
        category: 'TECHNICAL',
        requiredBenchmark: 85,
        isCompanyRequired: true,
        importance: 'HIGH',
        description: 'Schema design, resolvers, Apollo server',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('GraphQL');
    expect(res.body.data.requiredBenchmark).toBe(85);
    expect(res.body.data.isCompanyRequired).toBe(true);
  });

  it('PUT /api/skills/:id should edit required benchmark threshold percentage', async () => {
    // First get a skill
    const listRes = await request(app)
      .get('/api/skills?search=GraphQL')
      .set('Authorization', `Bearer ${adminToken}`);

    const skillId = listRes.body.data.skills[0].id;

    // Update threshold to 90%
    const updateRes = await request(app)
      .put(`/api/skills/${skillId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        requiredBenchmark: 90,
        isCompanyRequired: false,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.requiredBenchmark).toBe(90);
    expect(updateRes.body.data.isCompanyRequired).toBe(false);
  });

  it('GET /api/analytics/skill-gaps should dynamically compute gaps from DB benchmarks', async () => {
    const res = await request(app)
      .get('/api/analytics/skill-gaps')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.gaps)).toBe(true);
    expect(res.body.data.gaps.length).toBeGreaterThan(0);
    expect(res.body.data.gaps[0].required).toMatch(/%/);
  });
});
