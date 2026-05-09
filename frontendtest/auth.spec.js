import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GuestDashboard from '../GuestDashboard.vue' 
import { useAuthStore } from '../../stores/auth'

// Мокаем lucide-vue-next
vi.mock('lucide-vue-next', () => ({
  Image: { template: '<div class="mock-icon" />' },
  MousePointer2: { template: '<div class="mock-icon" />' },
  Move: { template: '<div class="mock-icon" />' },
  Shapes: { template: '<div class="mock-icon" />' },
  Trash2: { template: '<div class="mock-icon" />' },
  Wifi: { template: '<div class="mock-icon" />' },
}))

describe('GuestDashboard - форма логина', () => {
  let wrapper
  let authStore

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    
    wrapper = mount(GuestDashboard, {
      global: {
        plugins: [pinia],
        stubs: {
          UiButton: { 
            template: '<button class="btn" @click="$emit(\'click\')"><slot /></button>' 
          },
          UiInput: { 
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue']
          },
          UiTypography: { 
            template: '<div><slot /></div>' 
          },
        },
      },
    })
  })

  it('рендерит форму логина', () => {
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)
  })

  it('рендерит поля email и пароль', () => {
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(2)
  })

  it('обновляет email при вводе', async () => {
    const emailInput = wrapper.findAll('input')[0]
    await emailInput.setValue('user@example.com')
    expect(emailInput.element.value).toBe('user@example.com')
  })

  it('обновляет пароль при вводе', async () => {
    const passwordInput = wrapper.findAll('input')[1]
    await passwordInput.setValue('secret123')
    expect(passwordInput.element.value).toBe('secret123')
  })

  it('вызывает authStore.login при отправке формы', async () => {
    const loginSpy = vi.spyOn(authStore, 'login')
    const form = wrapper.find('form')
    
    await form.trigger('submit.prevent')
    
    expect(loginSpy).toHaveBeenCalled()
  })

  it('отображает 3 карточки с возможностями', () => {
    const articles = wrapper.findAll('article')
    expect(articles.length).toBe(3)
  })
})
