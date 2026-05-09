import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GuestDashboard from '../src/pages/GuestDashboard.vue'
import { useAuthStore } from '../src/stores/auth'
import { useUiStore } from '../src/stores/ui'

vi.mock('lucide-vue-next', () => ({
  Image: { template: '<div class="mock-icon-image"></div>' },
  MousePointer2: { template: '<div class="mock-icon-mouse"></div>' },
  Move: { template: '<div class="mock-icon-move"></div>' },
  Shapes: { template: '<div class="mock-icon-shapes"></div>' },
  Trash2: { template: '<div class="mock-icon-trash"></div>' },
  Wifi: { template: '<div class="mock-icon-wifi"></div>' },
}))

describe('Login Form Rendering', () => {
  let wrapper
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(GuestDashboard, {
      global: {
        plugins: [pinia],
        stubs: {
          UiButton: {
            template: '<button class="mock-button" :type="type" :disabled="disabled"><slot /></button>',
            props: ['type', 'disabled']
          },
          UiInput: {
            template: '<input class="mock-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :type="type" :placeholder="placeholder" />',
            props: ['modelValue', 'type', 'placeholder'],
            emits: ['update:modelValue']
          },
          UiTypography: {
            template: '<div class="mock-typography"><slot /></div>',
          },
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Form Structure', () => {
    it('should render the login form correctly', () => {
      const form = wrapper.find('form')
      expect(form.exists()).toBe(true)
      expect(form.attributes('id')).toBe('login')
    })

    it('should render email input field', () => {
      const emailInput = wrapper.find('input[placeholder="student@mail.ru"]')
      expect(emailInput.exists()).toBe(true)
      expect(emailInput.attributes('type')).toBe('email')
    })

    it('should render password input field', () => {
      const passwordInput = wrapper.find('input[placeholder="Пароль"]')
      expect(passwordInput.exists()).toBe(true)
      expect(passwordInput.attributes('type')).toBe('password')
    })

    it('should render submit button with correct text', () => {
      const button = wrapper.find('.mock-button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Войти в доску')
    })

    it('should render all three capability cards', () => {
      const articles = wrapper.findAll('article')
      expect(articles).toHaveLength(3)
    })
  })

  describe('Form Interactions', () => {
    it('should update email model when typing', async () => {
      const emailInput = wrapper.find('input[placeholder="student@mail.ru"]')
      await emailInput.setValue('test@example.com')
      expect(emailInput.element.value).toBe('test@example.com')
    })

    it('should update password model when typing', async () => {
      const passwordInput = wrapper.find('input[placeholder="Пароль"]')
      await passwordInput.setValue('secret123')
      expect(passwordInput.element.value).toBe('secret123')
    })

    it('should call login action with correct data when form submitted', async () => {
      const authStore = useAuthStore()
      const loginSpy = vi.spyOn(authStore, 'login')
      
      const emailInput = wrapper.find('input[placeholder="student@mail.ru"]')
      const passwordInput = wrapper.find('input[placeholder="Пароль"]')
      
      await emailInput.setValue('john@example.com')
      await passwordInput.setValue('password456')
      
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      
      expect(loginSpy).toHaveBeenCalledWith({
        name: 'Пользователь',
        email: 'john@example.com'
      })
    })

    it('should use default email when email field is empty', async () => {
      const authStore = useAuthStore()
      const loginSpy = vi.spyOn(authStore, 'login')
      
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      
      expect(loginSpy).toHaveBeenCalledWith({
        name: 'Пользователь',
        email: ''
      })
    })

    it('should prevent default form submission', async () => {
      const form = wrapper.find('form')
      const preventDefaultSpy = vi.fn()
      
      await form.trigger('submit', { preventDefault: preventDefaultSpy })
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Content Rendering', () => {
    it('should render main heading', () => {
      const heading = wrapper.find('.mock-typography')
      expect(heading.html()).toContain('Интерактивная доска для совместной работы с объектами')
    })

    it('should render description text', () => {
      const description = wrapper.findAll('.mock-typography')[1]
      expect(description.html()).toContain('Tokboard помогает участникам группы')
    })

    it('should render capability card titles', () => {
      const titles = wrapper.findAll('.mock-typography')
      const hasAllTitles = titles.some(t => t.html().includes('6 типов объектов')) &&
                          titles.some(t => t.html().includes('Редактирование')) &&
                          titles.some(t => t.html().includes('Работа в реальном времени'))
      expect(hasAllTitles).toBe(true)
    })

    it('should render live canvas preview section', () => {
      const canvasSection = wrapper.find('.relative.min-h-\\[520px\\]')
      expect(canvasSection.exists()).toBe(true)
    })
  })

  describe('Responsive Layout', () => {
    it('should have correct grid layout classes', () => {
      const mainContainer = wrapper.find('main')
      expect(mainContainer.classes()).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)]')
    })

    it('should have login section with proper styling', () => {
      const loginSection = wrapper.find('section:first-child')
      expect(loginSection.classes()).toContain('border-r')
      expect(loginSection.classes()).toContain('border-border')
    })

    it('should have preview section with background', () => {
      const previewSection = wrapper.find('section:last-child')
      expect(previewSection.classes()).toContain('bg-bg-tertiary')
    })
  })

  describe('Form Validation States', () => {
    it('should accept empty email field', async () => {
      const authStore = useAuthStore()
      const loginSpy = vi.spyOn(authStore, 'login')
      
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      
      expect(loginSpy).toHaveBeenCalledWith(expect.objectContaining({
        email: ''
      }))
    })

    it('should handle special characters in email', async () => {
      const emailInput = wrapper.find('input[placeholder="student@mail.ru"]')
      await emailInput.setValue('user+tag@example.co.uk')
      expect(emailInput.element.value).toBe('user+tag@example.co.uk')
    })
  })
})