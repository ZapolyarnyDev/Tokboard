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

// Legacy payload validation for move-only message.
export function validateMovePayload(payload) {
  if (!payload || typeof payload !== 'object') return false

  const { id, x, y } = payload

  if (!id || typeof id !== 'string') return false
  if (typeof x !== 'number' || !Number.isFinite(x)) return false
  if (typeof y !== 'number' || !Number.isFinite(y)) return false

  return true
}

function validateObjectId(id) {
  return typeof id === 'string' && id.length > 0 && id.length <= 128
}

function validateObjectPayload(payload) {
  if (!payload || typeof payload !== 'object') return false

  // id can be omitted on create (server-generated)
  if (payload.id !== undefined && !validateObjectId(payload.id)) return false

  // Keep payloads reasonably small to prevent accidental abuse.
  try {
    if (JSON.stringify(payload).length > 100_000) return false
  } catch {
    return false
  }

  return true
}

function isFiniteNumberOrUndefined(v) {
  return v === undefined || (typeof v === 'number' && Number.isFinite(v))
}

function isNonEmptyStringOrUndefined(v, maxLen) {
  if (v === undefined) return true
  if (typeof v !== 'string') return false
  if (v.length === 0) return false
  if (maxLen && v.length > maxLen) return false
  return true
}

export function validateCreateObjectPayload(payload) {
  if (!validateObjectPayload(payload)) return false

  if (!isFiniteNumberOrUndefined(payload.x)) return false
  if (!isFiniteNumberOrUndefined(payload.y)) return false
  if (!isFiniteNumberOrUndefined(payload.width)) return false
  if (!isFiniteNumberOrUndefined(payload.height)) return false
  if (!isFiniteNumberOrUndefined(payload.rotation)) return false

  if (!isNonEmptyStringOrUndefined(payload.type, 32)) return false
  if (!isNonEmptyStringOrUndefined(payload.stroke, 64)) return false
  if (!isNonEmptyStringOrUndefined(payload.fill, 64)) return false
  if (!isNonEmptyStringOrUndefined(payload.color, 64)) return false
  if (!isNonEmptyStringOrUndefined(payload.fontColor, 64)) return false

  if (payload.text !== undefined && typeof payload.text !== 'string') return false
  if (typeof payload.text === 'string' && payload.text.length > 20_000) return false

  if (!isNonEmptyStringOrUndefined(payload.src, 2_000_000)) return false
  if (!isNonEmptyStringOrUndefined(payload.imageUrl, 2_000_000)) return false

  if (payload.points !== undefined) {
    const ok =
      Array.isArray(payload.points) ||
      (payload.points && typeof payload.points === 'object')
    if (!ok) return false
  }

  return true
}

export function validateUpdateObjectPayload(payload) {
  if (!validateObjectPayload(payload)) return false
  if (!validateObjectId(payload.id)) return false

  if (!isFiniteNumberOrUndefined(payload.x)) return false
  if (!isFiniteNumberOrUndefined(payload.y)) return false
  if (!isFiniteNumberOrUndefined(payload.width)) return false
  if (!isFiniteNumberOrUndefined(payload.height)) return false
  if (!isFiniteNumberOrUndefined(payload.rotation)) return false
  return true
}

export function validateMoveObjectPayload(payload) {
  if (!validateObjectPayload(payload)) return false
  if (!validateObjectId(payload.id)) return false
  if (!isFiniteNumberOrUndefined(payload.x)) return false
  if (!isFiniteNumberOrUndefined(payload.y)) return false
  return true
}

export function validateDeleteObjectPayload(payload) {
  if (!payload || typeof payload !== 'object') return false
  return validateObjectId(payload.id)
}
