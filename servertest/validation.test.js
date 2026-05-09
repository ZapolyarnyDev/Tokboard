import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateMovePayload 
} from '../src/utils/validation.js'

describe('Валидация данных', () => {
  describe('validateEmail', () => {
    it('принимает корректные email', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('name.surname@company.co.uk')).toBe(true)
    })

    it('отклоняет некорректные email', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null)).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('принимает пароль длиной 8-128 символов', () => {
      expect(validatePassword('12345678')).toBe(true)
      expect(validatePassword('a'.repeat(128))).toBe(true)
      expect(validatePassword('ComplexP@ss123')).toBe(true)
    })

    it('отклоняет короткий или длинный пароль', () => {
      expect(validatePassword('1234567')).toBe(false)
      expect(validatePassword('a'.repeat(129))).toBe(false)
      expect(validatePassword('')).toBe(false)
    })
  })

  describe('validateName', () => {
    it('принимает имя от 1 до 100 символов', () => {
      expect(validateName('John')).toBe(true)
      expect(validateName('  Valid Name  ')).toBe(true)
    })

    it('отклоняет пустое имя', () => {
      expect(validateName('')).toBe(false)
      expect(validateName('   ')).toBe(false)
    })
  })

  describe('validateMovePayload', () => {
    it('принимает валидные координаты', () => {
      expect(validateMovePayload({ id: 'obj-1', x: 100, y: 200 })).toBe(true)
      expect(validateMovePayload({ id: 'obj-2', x: -50.5, y: 75.3 })).toBe(true)
    })

    it('отклоняет payload без id или координат', () => {
      expect(validateMovePayload({ x: 100, y: 200 })).toBe(false)
      expect(validateMovePayload({ id: 'obj-1', x: 100 })).toBe(false)
      expect(validateMovePayload(null)).toBe(false)
      expect(validateMovePayload({})).toBe(false)
    })

    it('отклоняет не-числовые координаты', () => {
      expect(validateMovePayload({ id: 'obj-1', x: '100', y: 200 })).toBe(false)
      expect(validateMovePayload({ id: 'obj-1', x: 100, y: NaN })).toBe(false)
    })
  })
})
