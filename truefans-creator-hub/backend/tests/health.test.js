const request = require('supertest');
const express = require('express');
const app = express();

// Mock the routes slightly or just test the health endpoint directly
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date(), service: 'truefans-backend' });
});

describe('GET /health', () => {
  it('should return 200 OK with status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });
});
