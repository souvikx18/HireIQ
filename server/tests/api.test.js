import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';

describe('HireIQ Core API Suite', () => {
  let adminToken = '';

  beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@hireiq.com',
      password: 'Admin@123456',
    });
    adminToken = loginRes.body.data.accessToken;
  });

  it('GET /api/jobs should return all active job roles', async () => {
    const res = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/candidates should return candidates list', async () => {
    const res = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/analytics/overview should return live stats', async () => {
    const res = await request(app)
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.totalCandidates).toBeGreaterThan(0);
  });

  it('POST /api/ai/chat should process recruiter queries', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ message: 'Find candidates with React experience' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toBeDefined();
  });

  it('POST /api/reports/generate should produce formatted report', async () => {
    const res = await request(app)
      .post('/api/reports/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reportName: 'Candidate Summary Report',
        dateRange: 'This Month',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toContain('HIREIQ ENTERPRISE REPORT');
  });

  it('POST /api/candidates/compare should return side-by-side comparison', async () => {
    const candidatesRes = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${adminToken}`);

    const cands = candidatesRes.body.data;
    if (cands.length >= 2) {
      const compareRes = await request(app)
        .post('/api/candidates/compare')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ candidateIds: [cands[0].id, cands[1].id] });

      expect(compareRes.status).toBe(200);
      expect(compareRes.body.success).toBe(true);
      expect(compareRes.body.data.comparison.length).toBe(2);
      expect(compareRes.body.data.recommendation).toBeDefined();
    }
  });

  it('GET /api/admin/health should report system telemetry and database status', async () => {
    const res = await request(app)
      .get('/api/admin/health')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('OPERATIONAL');
    expect(res.body.data.database.status).toBe('CONNECTED');
  });

  it('GET /api/admin/audit-logs should return paginated audit logs', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.logs)).toBe(true);
  });
});
