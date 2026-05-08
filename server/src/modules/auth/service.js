import bcrypt from 'bcryptjs'

import {
  newJti,
  signAccessToken,
  signRefreshToken,
  tokenSha256,
  verifyRefreshToken,
} from './jwt.js'

function accessPayloadForUser(user) {
  return {
    sub: String(user.id),
    email: user.email,
    role: user.role,
  }
}

export class AuthService {
  constructor(authRepository) {
    this.repo = authRepository
  }

  async register({ email, name, password }) {
    const existing = await this.repo.findUserByEmail(email)
    if (existing) {
      const err = new Error('Email already in use')
      err.statusCode = 409
      throw err
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await this.repo.createUser({
      email,
      name,
      passwordHash,
    })

    const tokens = await this.issueTokens(user)
    return { user: this.publicUser(user), ...tokens }
  }

  async login({ email, password }) {
    const user = await this.repo.findUserByEmail(email)
    if (!user) {
      const err = new Error('Invalid credentials')
      err.statusCode = 401
      throw err
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      const err = new Error('Invalid credentials')
      err.statusCode = 401
      throw err
    }

    const tokens = await this.issueTokens(user)
    return { user: this.publicUser(user), ...tokens }
  }

  async refresh({ refreshToken }) {
    let decoded
    try {
      decoded = verifyRefreshToken(refreshToken)
    } catch {
      const err = new Error('Invalid refresh token')
      err.statusCode = 401
      throw err
    }

    const tokenHash = tokenSha256(refreshToken)
    const record = await this.repo.findRefreshTokenByHash(tokenHash)
    if (!record || record.revokedAt) {
      const err = new Error('Refresh token revoked')
      err.statusCode = 401
      throw err
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      await this.repo.revokeRefreshToken(record.id).catch(() => {})
      const err = new Error('Refresh token expired')
      err.statusCode = 401
      throw err
    }

    const userId = Number(decoded.sub)
    const user = await this.repo.findUserById(userId)
    if (!user) {
      await this.repo.revokeRefreshToken(record.id).catch(() => {})
      const err = new Error('Invalid refresh token')
      err.statusCode = 401
      throw err
    }

    // rotation: revoke current, issue a new pair
    await this.repo.revokeRefreshToken(record.id)
    const tokens = await this.issueTokens(user)
    return { user: this.publicUser(user), ...tokens }
  }

  async logout({ refreshToken }) {
    const tokenHash = tokenSha256(refreshToken)
    const record = await this.repo.findRefreshTokenByHash(tokenHash)
    if (record && !record.revokedAt) {
      await this.repo.revokeRefreshToken(record.id)
    }
  }

  async issueTokens(user) {
    const accessToken = signAccessToken(accessPayloadForUser(user))

    const jti = newJti()
    const refreshToken = signRefreshToken({
      sub: String(user.id),
      jti,
      email: user.email,
    })

    const decoded = verifyRefreshToken(refreshToken)
    const expiresAt = new Date(decoded.exp * 1000)

    await this.repo.createRefreshToken({
      tokenHash: tokenSha256(refreshToken),
      jti,
      expiresAt,
      userId: user.id,
    })

    return { accessToken, refreshToken }
  }

  publicUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  }
}
