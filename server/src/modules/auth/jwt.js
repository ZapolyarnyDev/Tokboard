import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env ${name}`)
  return value
}

export function signAccessToken(payload) {
  const secret = requiredEnv('JWT_ACCESS_SECRET')
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m'

  return jwt.sign(payload, secret, {
    expiresIn,
  })
}

export function signRefreshToken(payload) {
  const secret = requiredEnv('JWT_REFRESH_SECRET')
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'

  return jwt.sign(payload, secret, {
    expiresIn,
  })
}

export function verifyAccessToken(token) {
  const secret = requiredEnv('JWT_ACCESS_SECRET')
  return jwt.verify(token, secret)
}

export function verifyRefreshToken(token) {
  const secret = requiredEnv('JWT_REFRESH_SECRET')
  return jwt.verify(token, secret)
}

export function tokenSha256(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function newJti() {
  return crypto.randomUUID()
}
