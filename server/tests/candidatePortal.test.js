import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';

describe('Candidate / Job Seeker Portal Suite', () => {
  let candidateToken = '';
  let candidateUser = null;
  let testJobId = '';

  beforeAll(async () => {
    // 1. Register a test candidate account
    const uniqueEmail = `test.candidate.${Date.now()}@example.com`;
    const regRes = await request(app).post('/api/auth/register').send({
      firstName: 'Alex',
      lastName: 'Seeker',
      email: uniqueEmail,
      password: 'Candidate@123',
      role: 'CANDIDATE',
    });

    expect(regRes.status).toBe(201);
    candidateToken = regRes.body.data.accessToken;
    candidateUser = regRes.body.data.user;
  });

  it('GET /api/candidate-portal/jobs should return active job roles with match score', async () => {
    const res = await request(app)
      .get('/api/candidate-portal/jobs')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const firstJob = res.body.data[0];
    expect(firstJob.id).toBeDefined();
    expect(firstJob.title).toBeDefined();
    expect(typeof firstJob.matchScore).toBe('number');
    testJobId = firstJob.id;
  });

  it('GET /api/candidate-portal/profile should return candidate profile', async () => {
    const res = await request(app)
      .get('/api/candidate-portal/profile')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('POST /api/candidate-portal/apply/:jobId should submit a 1-click job application', async () => {
    expect(testJobId).toBeTruthy();

    const res = await request(app)
      .post(`/api/candidate-portal/apply/${testJobId}`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPLIED');
    expect(res.body.data.jobRoleId).toBe(testJobId);
  });

  it('GET /api/candidate-portal/applications should track candidate submitted applications', async () => {
    const res = await request(app)
      .get('/api/candidate-portal/applications')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const appRecord = res.body.data[0];
    expect(appRecord.status).toBe('APPLIED');
    expect(appRecord.jobRole).toBeDefined();
  });
});
