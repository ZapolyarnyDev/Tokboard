import { verifyAccessToken } from '../modules/auth/jwt.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : null
  if (!token) return res.status(401).json({ message: 'Missing access token' })

  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid access token' })
  }
}
