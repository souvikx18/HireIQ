import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';

describe('Authentication & User Flow', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('POST /api/auth/login with valid admin credentials should succeed', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@hireiq.com',
      password: 'Admin@123456',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@hireiq.com');
  });

  it('POST /api/auth/login with wrong password should fail with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@hireiq.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register with new user should succeed and return JWT', async () => {
    const testEmail = `test.user.${Date.now()}@hireiq.com`;
    const res = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'TestPassword@123',
      firstName: 'Test',
      lastName: 'Candidate',
      role: 'RECRUITER',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
