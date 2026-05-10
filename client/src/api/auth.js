const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const body = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    const error = new Error(body?.message || 'Request failed')
    error.status = res.status
    throw error
  }

  return body
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(email, name, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  })
}

export function refresh() {
  return request('/auth/refresh', {
    method: 'POST',
  })
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST',
  })
}

export function me(accessToken) {
  return request('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
