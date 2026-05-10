import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import GuestDashboard from './GuestDashboard.vue'
import { useAuthStore } from '../stores/auth.js'
import * as authApi from '../api/auth.js'

vi.mock('lucide-vue-next', () => ({
  Image: { template: '<span data-icon="image" />' },
  MousePointer2: { template: '<span data-icon="pointer" />' },
  Move: { template: '<span data-icon="move" />' },
  Shapes: { template: '<span data-icon="shapes" />' },
  Trash2: { template: '<span data-icon="trash" />' },
  Wifi: { template: '<span data-icon="wifi" />' },
}))

vi.mock('../api/auth.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
}))

describe('GuestDashboard', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  function mountDashboard() {
    return mount(GuestDashboard, {
      global: {
        plugins: [createPinia()],
      },
    })
  }

  it('renders login form and capability cards', () => {
    const wrapper = mountDashboard()

    expect(wrapper.find('form#login').exists()).toBe(true)
    expect(wrapper.findAll('input')).toHaveLength(2)
    expect(wrapper.findAll('article')).toHaveLength(3)
  })

  it('logs in through auth store with entered email', async () => {
    const wrapper = mountDashboard()
    const auth = useAuthStore()
    const loginSpy = vi.spyOn(auth, 'login')
    authApi.login.mockResolvedValue({
      user: { id: 1, name: 'Student', email: 'student@example.com', role: 'USER' },
      accessToken: 'access-token',
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('student@example.com')
    await inputs[1].setValue('password123')
    await wrapper.find('form#login').trigger('submit')

    expect(loginSpy).toHaveBeenCalledWith('student@example.com', 'password123')
    expect(auth.isAuthenticated).toBe(true)
  })
})
