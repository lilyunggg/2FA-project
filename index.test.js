import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Twilio
vi.mock('twilio', () => {
  return {
    default: vi.fn(() => ({
      verify: {
        v2: {
          services: vi.fn(() => ({
            verifications: {
              create: vi.fn(() => Promise.resolve({ status: 'pending' })),
            },
            verificationChecks: {
              create: vi.fn(({ code }) =>
                code === '123456'
                  ? Promise.resolve({ status: 'approved' })
                  : Promise.resolve({ status: 'pending' })
              ),
            },
          })),
        },
      },
    })),
  };
});

const request = require('supertest');
const express = require('express');
const app = require('./index');

// Example input validation tests

describe('2FA API', () => {
  it('should reject invalid phone numbers', async () => {
    const res = await request(app).post('/api/start-verification').send({ phone: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should accept valid phone numbers', async () => {
    const res = await request(app).post('/api/start-verification').send({ phone: '+14155552671' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBeDefined();
  });

  it('should reject invalid codes', async () => {
    const res = await request(app).post('/api/check-verification').send({ phone: '+1234567890', code: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should approve correct code', async () => {
    const res = await request(app).post('/api/check-verification').send({ phone: '+14155552671', code: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBeDefined();
  });

  it('should reject incorrect code', async () => {
    const res = await request(app).post('/api/check-verification').send({ phone: '+1234567890', code: '654321' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});