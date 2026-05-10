import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from './auth.js'
import { useUiStore } from './ui.js'
import * as authApi from '../api/auth.js'

vi.mock('../api/auth.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
}))

describe('Pinia stores', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('keeps auth state and clears it on logout', async () => {
    const auth = useAuthStore()
    const user = { name: 'Student', email: 'student@example.com' }

    authApi.login.mockResolvedValue({ user, accessToken: 'access-token' })
    authApi.logout.mockResolvedValue(null)

    await auth.login('student@example.com', 'password123')

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user).toEqual(user)
    expect(auth.accessToken).toBe('access-token')

    await auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(auth.accessToken).toBeNull()
  })

  it('updates board UI state', () => {
    const ui = useUiStore()

    expect(ui.activeBoard).toBe('Доска не выбрана')
    expect(ui.activeBoardId).toBeNull()

    ui.setBoard({ id: 7, title: 'Project Alpha' })
    ui.setTool('rect')
    ui.toggleSidebar()
    ui.toggleProject('Project Alpha')

    expect(ui.activeBoard).toBe('Project Alpha')
    expect(ui.activeBoardId).toBe(7)
    expect(ui.tool).toBe('rect')
    expect(ui.isSidebarCollapsed).toBe(true)
    expect(ui.collapsedProjects['Project Alpha']).toBe(true)

    ui.leaveBoard()
    expect(ui.activeBoardId).toBeNull()
  })
})
