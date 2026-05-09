import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../auth'  // Путь исправлен
import { useUiStore } from '../ui'      // Путь исправлен

describe('Pinia Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('AuthStore', () => {
    it('начинается с isAuthenticated = false', () => {
      const auth = useAuthStore()
      expect(auth.isAuthenticated).toBe(false)
      expect(auth.user).toBe(null)
    })

    it('login() устанавливает пользователя', () => {
      const auth = useAuthStore()
      const user = { name: 'John', email: 'john@test.com' }
      
      auth.login(user)
      
      expect(auth.isAuthenticated).toBe(true)
      expect(auth.user).toEqual(user)
    })

    it('logout() очищает состояние', () => {
      const auth = useAuthStore()
      auth.login({ name: 'Test' })
      auth.logout()
      
      expect(auth.isAuthenticated).toBe(false)
      expect(auth.user).toBe(null)
    })
  })

  describe('UiStore', () => {
    it('имеет значения по умолчанию', () => {
      const ui = useUiStore()
      
      expect(ui.activeBoard).toBe('Доска 1')
      expect(ui.tool).toBe('select')
      expect(ui.isSidebarCollapsed).toBe(false)
    })

    it('setBoard() меняет активную доску', () => {
      const ui = useUiStore()
      ui.setBoard('Проект Альфа')
      expect(ui.activeBoard).toBe('Проект Альфа')
    })

    it('setTool() меняет активный инструмент', () => {
      const ui = useUiStore()
      ui.setTool('rect')
      expect(ui.tool).toBe('rect')
      
      ui.setTool('circle')
      expect(ui.tool).toBe('circle')
    })

    it('toggleSidebar() переключает состояние', () => {
      const ui = useUiStore()
      
      ui.toggleSidebar()
      expect(ui.isSidebarCollapsed).toBe(true)
      
      ui.toggleSidebar()
      expect(ui.isSidebarCollapsed).toBe(false)
    })

    it('toggleProject() сворачивает/разворачивает проект', () => {
      const ui = useUiStore()
      
      ui.toggleProject('MyProject')
      expect(ui.collapsedProjects['MyProject']).toBe(true)
      
      ui.toggleProject('MyProject')
      expect(ui.collapsedProjects['MyProject']).toBe(false)
    })
  })
})
