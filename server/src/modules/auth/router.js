import express from 'express'

import { AuthRepository } from './repository.js'
import { AuthService } from './service.js'
import { verifyRefreshToken } from './jwt.js'
import { requireAuth } from '../../middlewares/auth.js'
import {
  validateEmail,
  validatePassword,
  validateName,
} from '../../utils/validation.js'
import {
  authLimiter,
  generalAuthLimiter,
} from '../../middlewares/rateLimiter.js'

const router = express.Router()

const repo = new AuthRepository()
const service = new AuthService(repo)

const REFRESH_COOKIE = 'refresh_token'

function cookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeMs,
    path: '/',
  }
}

function setRefreshCookie(res, refreshToken) {
  const decoded = verifyRefreshToken(refreshToken)
  const maxAgeMs = Math.max(0, decoded.exp * 1000 - Date.now())
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(maxAgeMs))
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    ...cookieOptions(0),
    maxAge: undefined,
    expires: new Date(0),
  })
}

router.post('/register', authLimiter, async (req, res) => {
  const { email, name, password } = req.body ?? {}

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }
  if (!validateName(name)) {
    return res.status(400).json({ message: 'Invalid name' })
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Password must be 8-128 characters' })
  }

  try {
    const result = await service.register({ email, name, password })
    setRefreshCookie(res, result.refreshToken)
    return res
      .status(201)
      .json({ user: result.user, accessToken: result.accessToken })
  } catch (e) {
    return res
      .status(e.statusCode ?? 500)
      .json({ message: e.message ?? 'Internal error' })
  }
})

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body ?? {}

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Invalid password' })
  }

  try {
    const result = await service.login({ email, password })
    setRefreshCookie(res, result.refreshToken)
    return res
      .status(200)
      .json({ user: result.user, accessToken: result.accessToken })
  } catch (e) {
    return res
      .status(e.statusCode ?? 500)
      .json({ message: e.message ?? 'Internal error' })
  }
})

router.post('/refresh', generalAuthLimiter, async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken
  if (!refreshToken) {
    return res.status(401).json({ message: 'Missing refresh token' })
  }

  try {
    const result = await service.refresh({ refreshToken })
    setRefreshCookie(res, result.refreshToken)
    return res
      .status(200)
      .json({ user: result.user, accessToken: result.accessToken })
  } catch (e) {
    clearRefreshCookie(res)
    return res
      .status(e.statusCode ?? 500)
      .json({ message: e.message ?? 'Internal error' })
  }
})

router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE]
  if (refreshToken) {
    await service.logout({ refreshToken }).catch(() => {})
  }
  clearRefreshCookie(res)
  return res.status(204).end()
})

router.get('/me', requireAuth, async (req, res) => {
  return res.status(200).json({ user: req.user })
})

export { router as authRouter }
