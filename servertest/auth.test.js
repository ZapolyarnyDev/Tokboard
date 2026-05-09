import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'
import { authRouter } from '../src/modules/auth/router.js'
import { prisma } from '../src/config/database.js'
import bcrypt from 'bcryptjs'

jest.mock('../src/config/database.js')
jest.mock('../src/modules/auth/jwt.js', () => ({
  signAccessToken: jest.fn(() => 'mock-token'),
  signRefreshToken: jest.fn(() => 'mock-refresh'),
  verifyRefreshToken: jest.fn(() => ({ exp: Date.now() / 1000 + 604800, sub: '1' })),
  tokenSha256: jest.fn(() => 'hash'),
  newJti: jest.fn(() => 'jti'),
}))

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use('/auth', authRouter)

describe('Auth API', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('POST /auth/register', () => {
    it('создаёт пользователя с валидными данными', async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        role: 'USER',
        passwordHash: 'hash',
      })
      prisma.refreshToken.create.mockResolvedValue({ id: 'token' })

      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@test.com', name: 'Test User', password: 'password123' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body.user).not.toHaveProperty('passwordHash')
    })

    it('отклоняет регистрацию с существующим email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 })

      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'existing@test.com', name: 'Test', password: 'password123' })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Registration failed')
    })

    it('валидирует формат email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'invalid', name: 'Test', password: 'password123' })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Invalid email format')
    })

    it('валидирует длину пароля (мин 8 символов)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@test.com', name: 'Test', password: 'short' })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Password must be 8-128 characters')
    })
  })

  describe('POST /auth/login', () => {
    it('логинит пользователя с правильными креденшеалами', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        name: 'Test',
        passwordHash,
      })
      prisma.refreshToken.create.mockResolvedValue({ id: 'token' })

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
    })

    it('отклоняет неправильный пароль', async () => {
      const passwordHash = await bcrypt.hash('correct', 10)
      prisma.user.findUnique.mockResolvedValue({ id: 1, passwordHash })

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Invalid credentials')
    })
  })

  describe('POST /auth/logout', () => {
    it('очищает refresh токен и возвращает 204', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({ id: 'token', revokedAt: null })
      prisma.refreshToken.update.mockResolvedValue({})

      const res = await request(app)
        .post('/auth/logout')
        .set('Cookie', ['refresh_token=mock-token'])

      expect(res.status).toBe(204)
    })
  })
})
