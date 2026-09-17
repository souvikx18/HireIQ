import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';

describe('Job Role Management & Candidate Assignments Suite', () => {
  let adminToken = '';
  let testJobId = '';
  let testCandidateId = '';

  beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@hireiq.com',
      password: 'Admin@123456',
    });
    adminToken = loginRes.body.data.accessToken;

    // Get an existing job role ID
    const jobsRes = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${adminToken}`);
    testJobId = jobsRes.body.data[0].id;
  });

  it('PUT /api/jobs/:id should update job role specifications', async () => {
    const res = await request(app)
      .put(`/api/jobs/${testJobId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        openPositions: 3,
        description: 'Updated comprehensive specifications for senior responsibilities.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.openPositions).toBe(3);
  });

  it('POST /api/candidates should create a new candidate assigned to a specific role', async () => {
    const uniqueEmail = `test.candidate.${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Jordan Lee',
        email: uniqueEmail,
        phone: '+1 555-0199',
        jobRoleId: testJobId,
        experienceYears: 4.5,
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        notes: 'Assigned directly during candidate intake screening.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Jordan Lee');
    expect(res.body.data.jobRoleId).toBe(testJobId);
    testCandidateId = res.body.data.id;
  }, 15000);

  it('GET /api/jobs/:id/candidates should list candidates assigned to that role', async () => {
    const res = await request(app)
      .get(`/api/jobs/${testJobId}/candidates`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.candidates)).toBe(true);
    const found = res.body.data.candidates.some((c) => c.id === testCandidateId);
    expect(found).toBe(true);
  }, 15000);

  it('PATCH /api/candidates/:id/assign should reassign candidate to another role', async () => {
    // Get all jobs to find a second job
    const jobsRes = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${adminToken}`);
    const secondJob = jobsRes.body.data.find((j) => j.id !== testJobId);

    if (secondJob) {
      const res = await request(app)
        .patch(`/api/candidates/${testCandidateId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          jobRoleId: secondJob.id,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobRoleId).toBe(secondJob.id);
      expect(res.body.data.roleApplied).toBe(secondJob.title);
    }
  }, 15000);
});
