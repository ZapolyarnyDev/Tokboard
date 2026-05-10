const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const WS_URL =
  import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, 'ws')

async function request(path, accessToken, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
    ...options,
  })

  const body = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Ошибка запроса к доске')
  return body
}

export function listBoards(accessToken) {
  return request('/board', accessToken)
}

export function createBoard(title, accessToken) {
  return request('/board', accessToken, {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function getBoard(id, accessToken) {
  return request(`/board/${encodeURIComponent(id)}`, accessToken)
}

export function resolveAssetUrl(url) {
  if (!url || url.startsWith('data:') || /^https?:\/\//.test(url)) return url
  return `${API_URL}${url}`
}

export async function uploadBoardImage(dataUrl, accessToken) {
  const res = await fetch(`${API_URL}/board/uploads/images`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ dataUrl }),
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Не удалось загрузить изображение')
  return body
}
