import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../src/stores/auth'
import { useUiStore } from '../src/stores/ui'

describe('Pinia Store Interactions', () => {
  let pinia
  let authStore
  let uiStore

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    uiStore = useUiStore()
  })

  describe('Auth Store', () => {
    describe('initial state', () => {
      it('should have isAuthenticated as false by default', () => {
        expect(authStore.isAuthenticated).toBe(false)
      })

      it('should have user as null by default', () => {
        expect(authStore.user).toBe(null)
      })
    })

    describe('login action', () => {
      it('should set isAuthenticated to true after login', () => {
        const userData = { name: 'John Doe', email: 'john@example.com' }
        authStore.login(userData)
        
        expect(authStore.isAuthenticated).toBe(true)
      })

      it('should store user data correctly', () => {
        const userData = { name: 'Jane Smith', email: 'jane@example.com', role: 'USER' }
        authStore.login(userData)
        
        expect(authStore.user).toEqual(userData)
      })

      it('should overwrite previous user data on new login', () => {
        const firstUser = { name: 'User One', email: 'one@example.com' }
        const secondUser = { name: 'User Two', email: 'two@example.com' }
        
        authStore.login(firstUser)
        expect(authStore.user).toEqual(firstUser)
        
        authStore.login(secondUser)
        expect(authStore.user).toEqual(secondUser)
      })

      it('should handle incomplete user data', () => {
        const partialUser = { name: 'Partial User' }
        authStore.login(partialUser)
        
        expect(authStore.user).toEqual(partialUser)
        expect(authStore.isAuthenticated).toBe(true)
      })
    })

    describe('logout action', () => {
      it('should set isAuthenticated to false after logout', () => {
        authStore.login({ name: 'Test User', email: 'test@example.com' })
        expect(authStore.isAuthenticated).toBe(true)
        
        authStore.logout()
        expect(authStore.isAuthenticated).toBe(false)
      })

      it('should clear user data after logout', () => {
        authStore.login({ name: 'Test User', email: 'test@example.com' })
        expect(authStore.user).not.toBe(null)
        
        authStore.logout()
        expect(authStore.user).toBe(null)
      })

      it('should handle logout when not logged in', () => {
        expect(authStore.isAuthenticated).toBe(false)
        
        authStore.logout()
        expect(authStore.isAuthenticated).toBe(false)
        expect(authStore.user).toBe(null)
      })
    })

    describe('state persistence', () => {
      it('should maintain separate store instances', () => {
        const anotherPinia = createPinia()
        setActivePinia(anotherPinia)
        const anotherAuthStore = useAuthStore()
        
        authStore.login({ name: 'Store 1 User' })
        anotherAuthStore.login({ name: 'Store 2 User' })
        
        expect(authStore.user.name).toBe('Store 1 User')
        expect(anotherAuthStore.user.name).toBe('Store 2 User')
      })
    })
  })

  describe('UI Store', () => {
    describe('initial state', () => {
      it('should have activeBoard as "Доска 1" by default', () => {
        expect(uiStore.activeBoard).toBe('Доска 1')
      })

      it('should have tool as "select" by default', () => {
        expect(uiStore.tool).toBe('select')
      })

      it('should have isSidebarCollapsed as false by default', () => {
        expect(uiStore.isSidebarCollapsed).toBe(false)
      })

      it('should have empty collapsedProjects object by default', () => {
        expect(uiStore.collapsedProjects).toEqual({})
      })
    })

    describe('setBoard action', () => {
      it('should change active board name', () => {
        uiStore.setBoard('Новая доска')
        expect(uiStore.activeBoard).toBe('Новая доска')
      })

      it('should overwrite previous board name', () => {
        uiStore.setBoard('Board 1')
        expect(uiStore.activeBoard).toBe('Board 1')
        
        uiStore.setBoard('Board 2')
        expect(uiStore.activeBoard).toBe('Board 2')
      })

      it('should handle empty string as board name', () => {
        uiStore.setBoard('')
        expect(uiStore.activeBoard).toBe('')
      })

      it('should handle special characters in board name', () => {
        const specialName = 'Доска №3 - Проект "Альфа"'
        uiStore.setBoard(specialName)
        expect(uiStore.activeBoard).toBe(specialName)
      })
    })

    describe('setTool action', () => {
      it('should change current tool', () => {
        uiStore.setTool('rect')
        expect(uiStore.tool).toBe('rect')
      })

      it('should change between all available tools', () => {
        const tools = ['select', 'rect', 'circle', 'line', 'triangle', 'text', 'image']
        
        tools.forEach(tool => {
          uiStore.setTool(tool)
          expect(uiStore.tool).toBe(tool)
        })
      })

      it('should handle invalid tool names', () => {
        uiStore.setTool('invalid_tool')
        expect(uiStore.tool).toBe('invalid_tool')
      })
    })

    describe('toggleSidebar action', () => {
      it('should toggle sidebar from false to true', () => {
        expect(uiStore.isSidebarCollapsed).toBe(false)
        uiStore.toggleSidebar()
        expect(uiStore.isSidebarCollapsed).toBe(true)
      })

      it('should toggle sidebar from true to false', () => {
        uiStore.isSidebarCollapsed = true
        uiStore.toggleSidebar()
        expect(uiStore.isSidebarCollapsed).toBe(false)
      })

      it('should toggle multiple times correctly', () => {
        expect(uiStore.isSidebarCollapsed).toBe(false)
        uiStore.toggleSidebar()
        expect(uiStore.isSidebarCollapsed).toBe(true)
        uiStore.toggleSidebar()
        expect(uiStore.isSidebarCollapsed).toBe(false)
        uiStore.toggleSidebar()
        expect(uiStore.isSidebarCollapsed).toBe(true)
      })
    })

    describe('toggleProject action', () => {
      it('should add project to collapsedProjects when toggled', () => {
        uiStore.toggleProject('Project 1')
        expect(uiStore.collapsedProjects['Project 1']).toBe(true)
      })

      it('should toggle project collapse state', () => {
        uiStore.toggleProject('Project 1')
        expect(uiStore.collapsedProjects['Project 1']).toBe(true)
        
        uiStore.toggleProject('Project 1')
        expect(uiStore.collapsedProjects['Project 1']).toBe(false)
      })

      it('should handle multiple projects independently', () => {
        uiStore.toggleProject('Project Alpha')
        uiStore.toggleProject('Project Beta')
        
        expect(uiStore.collapsedProjects['Project Alpha']).toBe(true)
        expect(uiStore.collapsedProjects['Project Beta']).toBe(true)
        
        uiStore.toggleProject('Project Alpha')
        expect(uiStore.collapsedProjects['Project Alpha']).toBe(false)
        expect(uiStore.collapsedProjects['Project Beta']).toBe(true)
      })

      it('should handle project names with spaces and special characters', () => {
        const projectName = 'My Awesome Project! @#$%'
        uiStore.toggleProject(projectName)
        expect(uiStore.collapsedProjects[projectName]).toBe(true)
      })
    })

    describe('store reactivity', () => {
      it('should notify watchers when activeBoard changes', () => {
        let changeDetected = false
        uiStore.$subscribe((mutation, state) => {
          if (mutation.events?.some(e => e.key === 'activeBoard')) {
            changeDetected = true
          }
        })
        
        uiStore.setBoard('New Board')
        expect(changeDetected).toBe(true)
      })

      it('should notify watchers when tool changes', () => {
        let changeDetected = false
        uiStore.$subscribe((mutation, state) => {
          if (mutation.events?.some(e => e.key === 'tool')) {
            changeDetected = true
          }
        })
        
        uiStore.setTool('circle')
        expect(changeDetected).toBe(true)
      })
    })
  })

  describe('Store Composition', () => {
    it('should allow using multiple stores together', () => {
      authStore.login({ name: 'Test User', id: 1 })
      uiStore.setBoard('User Dashboard')
      uiStore.setTool('rect')
      
      expect(authStore.isAuthenticated).toBe(true)
      expect(uiStore.activeBoard).toBe('User Dashboard')
      expect(uiStore.tool).toBe('rect')
    })

    it('should maintain independent state between stores', () => {
      authStore.login({ name: 'Auth User' })
      uiStore.setBoard('UI Board')
      
      authStore.logout()
      
      expect(authStore.isAuthenticated).toBe(false)
      expect(uiStore.activeBoard).toBe('UI Board')
    })

    it('should reset all stores to initial state after logout', () => {
      authStore.login({ name: 'User', email: 'user@test.com' })
      uiStore.setBoard('Custom Board')
      uiStore.setTool('line')
      uiStore.toggleSidebar()
      uiStore.toggleProject('Project X')
      
      authStore.logout()
      
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBe(null)
      
      expect(uiStore.activeBoard).toBe('Custom Board')
      expect(uiStore.tool).toBe('line')
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid sequential tool changes', () => {
      const tools = ['select', 'rect', 'circle', 'line', 'select', 'rect']
      
      tools.forEach(tool => {
        uiStore.setTool(tool)
      })
      
      expect(uiStore.tool).toBe('rect')
    })

    it('should handle rapid project toggles', () => {
      uiStore.toggleProject('Project')
      expect(uiStore.collapsedProjects['Project']).toBe(true)
      
      uiStore.toggleProject('Project')
      expect(uiStore.collapsedProjects['Project']).toBe(false)
      
      uiStore.toggleProject('Project')
      expect(uiStore.collapsedProjects['Project']).toBe(true)
      
      uiStore.toggleProject('Project')
      expect(uiStore.collapsedProjects['Project']).toBe(false)
    })

    it('should handle undefined project names', () => {
      uiStore.toggleProject(undefined)
      uiStore.toggleProject(null)
      
      expect(uiStore.collapsedProjects['undefined']).toBe(true)
      expect(uiStore.collapsedProjects['null']).toBe(true)
    })

    it('should handle numeric board names', () => {
      uiStore.setBoard(123)
      expect(uiStore.activeBoard).toBe(123)
    })
  })
})