import { AuthService } from './service.js'

class FakeAuthRepository {
  constructor() {
    this.users = []
    this.refreshTokens = []
    this.nextUserId = 1
  }

  findUserByEmail(email) {
    return this.users.find((user) => user.email === email) ?? null
  }

  createUser(data) {
    const user = {
      id: this.nextUserId++,
      role: 'USER',
      ...data,
    }
    this.users.push(user)
    return user
  }

  createRefreshToken(data) {
    const record = {
      id: `refresh-${this.refreshTokens.length + 1}`,
      revokedAt: null,
      ...data,
    }
    this.refreshTokens.push(record)
    return record
  }

  findRefreshTokenByHash(tokenHash) {
    return this.refreshTokens.find((token) => token.tokenHash === tokenHash) ?? null
  }

  revokeRefreshToken(id) {
    const token = this.refreshTokens.find((record) => record.id === id)
    if (token) token.revokedAt = new Date()
    return token
  }

  async rotateRefreshToken(tokenHash, userId) {
    const record = this.refreshTokens.find((token) => token.tokenHash === tokenHash)
    if (!record || record.revokedAt) {
      return { success: false, error: 'Refresh-токен отозван' }
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      record.revokedAt = new Date()
      return { success: false, error: 'Refresh-токен истек' }
    }

    const user = this.users.find((item) => item.id === userId)
    if (!user) return { success: false, error: 'Invalid refresh token' }

    record.revokedAt = new Date()
    return { success: true, user }
  }
}

describe('AuthService', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret'
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
    process.env.JWT_ACCESS_EXPIRES_IN = '15m'
    process.env.JWT_REFRESH_EXPIRES_IN = '7d'
  })

  test('registers a user and returns public user data with tokens', async () => {
    const repo = new FakeAuthRepository()
    const service = new AuthService(repo)

    const result = await service.register({
      email: 'student@example.com',
      name: 'Student',
      password: 'password123',
    })

    expect(result.user).toEqual({
      id: 1,
      email: 'student@example.com',
      name: 'Student',
      role: 'USER',
    })
    expect(result.accessToken).toEqual(expect.any(String))
    expect(result.refreshToken).toEqual(expect.any(String))
    expect(result.user.passwordHash).toBeUndefined()
  })

  test('rejects duplicate registration', async () => {
    const repo = new FakeAuthRepository()
    const service = new AuthService(repo)

    await service.register({
      email: 'student@example.com',
      name: 'Student',
      password: 'password123',
    })

    await expect(
      service.register({
        email: 'student@example.com',
        name: 'Student',
        password: 'password123',
      }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  test('logs in with valid credentials and rejects invalid credentials', async () => {
    const repo = new FakeAuthRepository()
    const service = new AuthService(repo)

    await service.register({
      email: 'student@example.com',
      name: 'Student',
      password: 'password123',
    })

    await expect(
      service.login({
        email: 'student@example.com',
        password: 'password123',
      }),
    ).resolves.toHaveProperty('accessToken')

    await expect(
      service.login({
        email: 'student@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  test('rotates refresh tokens and revokes the old token', async () => {
    const repo = new FakeAuthRepository()
    const service = new AuthService(repo)

    const registered = await service.register({
      email: 'student@example.com',
      name: 'Student',
      password: 'password123',
    })

    const refreshed = await service.refresh({
      refreshToken: registered.refreshToken,
    })

    expect(refreshed.refreshToken).toEqual(expect.any(String))
    expect(refreshed.refreshToken).not.toBe(registered.refreshToken)
    expect(repo.refreshTokens[0].revokedAt).toBeInstanceOf(Date)
  })
})
