import express from 'express'
import request from 'supertest'

import { requireAuth } from './auth.js'
import { signAccessToken } from '../modules/auth/jwt.js'

describe('requireAuth middleware', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret'
    process.env.JWT_ACCESS_EXPIRES_IN = '15m'
  })

  function createApp() {
    const app = express()
    app.get('/me', requireAuth, (req, res) => {
      res.status(200).json({ user: req.user })
    })
    return app
  }

  test('rejects requests without a bearer token', async () => {
    const res = await request(createApp()).get('/me')

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Missing access token')
  })

  test('rejects invalid bearer tokens', async () => {
    const res = await request(createApp())
      .get('/me')
      .set('Authorization', 'Bearer invalid-token')

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid access token')
  })

  test('passes decoded user payload for valid bearer tokens', async () => {
    const token = signAccessToken({
      sub: '1',
      email: 'student@example.com',
      role: 'USER',
    })

    const res = await request(createApp())
      .get('/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({
      sub: '1',
      email: 'student@example.com',
      role: 'USER',
    })
  })
})
