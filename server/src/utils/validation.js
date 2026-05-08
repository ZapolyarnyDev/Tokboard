export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false
  return password.length >= 8 && password.length <= 128
}

export function validateName(name) {
  if (!name || typeof name !== 'string') return false
  return name.trim().length >= 1 && name.length <= 100
}

export function validateMovePayload(payload) {
  if (!payload || typeof payload !== 'object') return false

  const { id, x, y } = payload

  if (!id || typeof id !== 'string') return false
  if (typeof x !== 'number' || !Number.isFinite(x)) return false
  if (typeof y !== 'number' || !Number.isFinite(y)) return false

  return true
}
