import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { authRouter } from '../src/modules/auth/router.js'
import { prisma } from '../src/config/database.js'
import bcrypt from 'bcryptjs'

jest.mock('../src/config/database.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('../src/modules/auth/jwt.js', () => ({
  signAccessToken: jest.fn(() => 'mock-access-token'),
  signRefreshToken: jest.fn(() => 'mock-refresh-token'),
  verifyRefreshToken: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 604800, sub: '1' })),
  tokenSha256: jest.fn(() => 'mock-token-hash'),
  newJti: jest.fn(() => 'mock-jti'),
  verifyAccessToken: jest.fn(() => ({ sub: '1', email: 'test@example.com', role: 'USER' })),
}))

const app = express()
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use('/auth', authRouter)

describe('Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    }

    test('should successfully register a new user with valid data', async () => {

      prisma.user.findUnique.mockResolvedValue(null)
      
      const mockCreatedUser = {
        id: 1,
        email: validUser.email,
        name: validUser.name,
        role: 'USER',
        passwordHash: await bcrypt.hash(validUser.password, 12),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prisma.user.create.mockResolvedValue(mockCreatedUser)
      
      prisma.refreshToken.create.mockResolvedValue({
        id: 'token-id',
        tokenHash: 'hash',
        jti: 'jti',
        expiresAt: new Date(),
        userId: 1,
      })

      const response = await request(app)
        .post('/auth/register')
        .send(validUser)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('accessToken', 'mock-access-token')
      expect(response.body.user).toMatchObject({
        id: 1,
        email: validUser.email,
        name: validUser.name,
        role: 'USER',
      })
      expect(response.body.user).not.toHaveProperty('passwordHash')
      expect(response.headers['set-cookie']).toBeDefined()
      expect(prisma.user.create).toHaveBeenCalledTimes(1)
    })

    test('should return 400 when user already exists', async () => {

      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: validUser.email,
        name: 'Existing User',
      })

      const response = await request(app)
        .post('/auth/register')
        .send(validUser)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Registration failed')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    test('should return 400 for invalid email format', async () => {
      const invalidEmailUser = {
        ...validUser,
        email: 'invalid-email',
      }

      const response = await request(app)
        .post('/auth/register')
        .send(invalidEmailUser)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid email format')
      expect(prisma.user.findUnique).not.toHaveBeenCalled()
    })

    test('should return 400 for password shorter than 8 characters', async () => {
      const invalidPasswordUser = {
        ...validUser,
        password: 'short',
      }

      const response = await request(app)
        .post('/auth/register')
        .send(invalidPasswordUser)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Password must be 8-128 characters')
    })

    test('should return 400 for empty name', async () => {
      const invalidNameUser = {
        ...validUser,
        name: '   ',
      }

      const response = await request(app)
        .post('/auth/register')
        .send(invalidNameUser)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid name')
    })
  })

  describe('POST /auth/login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    test('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: validCredentials.email,
        name: 'Test User',
        role: 'USER',
        passwordHash: await bcrypt.hash(validCredentials.password, 12),
      }
      
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.refreshToken.create.mockResolvedValue({
        id: 'token-id',
        tokenHash: 'hash',
        jti: 'jti',
        expiresAt: new Date(),
        userId: 1,
      })

      const response = await request(app)
        .post('/auth/login')
        .send(validCredentials)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken', 'mock-access-token')
      expect(response.body.user).toMatchObject({
        id: 1,
        email: validCredentials.email,
        name: 'Test User',
        role: 'USER',
      })
      expect(response.headers['set-cookie']).toBeDefined()
    })

    test('should return 401 for invalid password', async () => {
      const mockUser = {
        id: 1,
        email: validCredentials.email,
        passwordHash: await bcrypt.hash('wrong-password', 12),
      }
      
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const response = await request(app)
        .post('/auth/login')
        .send(validCredentials)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('message', 'Invalid credentials')
    })

    test('should return 401 for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .post('/auth/login')
        .send(validCredentials)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('message', 'Invalid credentials')
    })

    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ password: 'password123' })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid email format')
    })
  })

  describe('POST /auth/refresh', () => {
    test('should successfully refresh tokens with valid refresh token', async () => {
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          refreshToken: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'token-id',
              revokedAt: null,
              expiresAt: new Date(Date.now() + 86400000),
            }),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue({
              id: 1,
              email: 'test@example.com',
              name: 'Test User',
              role: 'USER',
            }),
          },
        }
        return callback(tx)
      })

      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', ['refresh_token=mock-refresh-token'])

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('user')
    })

    test('should return 401 without refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({})

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('message', 'Missing refresh token')
    })
  })

  describe('POST /auth/logout', () => {
    test('should successfully logout and clear cookies', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        revokedAt: null,
      })
      prisma.refreshToken.update.mockResolvedValue({})

      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', ['refresh_token=mock-refresh-token'])

      expect(response.status).toBe(204)
      expect(response.headers['set-cookie']).toBeDefined()
    })

    test('should return 204 even without refresh token', async () => {
      const response = await request(app)
        .post('/auth/logout')

      expect(response.status).toBe(204)
    })
  })
})