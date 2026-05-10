import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from './auth.js'
import { useUiStore } from './ui.js'

describe('Pinia stores', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps auth state and clears it on logout', () => {
    const auth = useAuthStore()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()

    const user = { name: 'Student', email: 'student@example.com' }
    auth.login(user)

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user).toEqual(user)

    auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
  })

  it('updates board UI state', () => {
    const ui = useUiStore()

    expect(ui.activeBoard).toBe('Доска 1')
    expect(ui.tool).toBe('select')
    expect(ui.isSidebarCollapsed).toBe(false)

    ui.setBoard('Проект Альфа')
    ui.setTool('rect')
    ui.toggleSidebar()
    ui.toggleProject('Проект Альфа')

    expect(ui.activeBoard).toBe('Проект Альфа')
    expect(ui.tool).toBe('rect')
    expect(ui.isSidebarCollapsed).toBe(true)
    expect(ui.collapsedProjects['Проект Альфа']).toBe(true)
  })
})
