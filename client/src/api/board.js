const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const WS_URL =
  import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, 'ws')

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
  if (!res.ok) throw new Error(body?.message || 'Image upload failed')
  return body
}
