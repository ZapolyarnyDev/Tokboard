import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateMovePayload 
} from '../src/utils/validation.js'

describe('Data Validation Tests', () => {
  describe('validateEmail', () => {
    test('should return true for valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'user@subdomain.example.com',
        '123@example.com',
      ]

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true)
      })
    })

    test('should return false for invalid email addresses', () => {
      const invalidEmails = [
        null,
        undefined,
        123,
        '',
        'invalid',
        'user@',
        '@example.com',
        'user@example',
        'user@example.',
        'user@.com',
        'user name@example.com',
        'a'.repeat(255) + '@example.com', 
      ]

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false)
      })
    })

    test('should validate email length limit (max 254)', () => {
      const localPart = 'a'.repeat(240)
      const domain = 'example.com'
      const email = `${localPart}@${domain}`
      
      // 252 символа (допустимо)
      expect(email.length).toBeLessThanOrEqual(254)
      expect(validateEmail(email)).toBe(true)

      const tooLongEmail = `${'a'.repeat(244)}@example.com` 
      expect(tooLongEmail.length).toBeGreaterThan(254)
      expect(validateEmail(tooLongEmail)).toBe(false)
    })
  })

  describe('validatePassword', () => {
    test('should return true for valid passwords (8-128 characters)', () => {
      const validPasswords = [
        'password123',
        'P@ssw0rd!',
        'a'.repeat(8),
        'a'.repeat(128),
        '复杂密码123',
        '  spaces ok  ',
      ]

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true)
      })
    })

    test('should return false for passwords that are too short', () => {
      const shortPasswords = [
        null,
        undefined,
        '',
        'a',
        'a'.repeat(7),
        '1234567',
      ]

      shortPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false)
      })
    })

    test('should return false for passwords that are too long', () => {
      const longPassword = 'a'.repeat(129)
      expect(validatePassword(longPassword)).toBe(false)
    })

    test('should return false for non-string passwords', () => {
      const nonStringPasswords = [
        12345678,
        true,
        false,
        {},
        [],
        () => {},
      ]

      nonStringPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false)
      })
    })
  })

  describe('validateName', () => {
    test('should return true for valid names (1-100 characters)', () => {
      const validNames = [
        'John',
        'John Doe',
        'J',
        'a'.repeat(100),
        '  Name with spaces  ',
        'Имя на русском',
        '名前',
      ]

      validNames.forEach(name => {
        expect(validateName(name)).toBe(true)
      })
    })

    test('should return false for names that are too short after trim', () => {
      const invalidNames = [
        null,
        undefined,
        '',
        '   ',
        '\t\n',
      ]

      invalidNames.forEach(name => {
        expect(validateName(name)).toBe(false)
      })
    })

    test('should return false for names that are too long', () => {
      const longName = 'a'.repeat(101)
      expect(validateName(longName)).toBe(false)
    })

    test('should return false for non-string names', () => {
      const nonStringNames = [
        123,
        true,
        false,
        {},
        [],
        () => {},
      ]

      nonStringNames.forEach(name => {
        expect(validateName(name)).toBe(false)
      })
    })

    test('should trim whitespace before validation', () => {
      expect(validateName('  Valid  ')).toBe(true)
      expect(validateName('  ')).toBe(false)
    })
  })

  describe('validateMovePayload', () => {
    test('should return true for valid move payload', () => {
      const validPayloads = [
        { id: 'obj-123', x: 100, y: 200 },
        { id: '123', x: 0, y: 0 },
        { id: 'obj-456', x: -50.5, y: 150.75 },
        { id: 'object-id', x: 999999, y: -999999 },
      ]

      validPayloads.forEach(payload => {
        expect(validateMovePayload(payload)).toBe(true)
      })
    })

    test('should return false for missing fields', () => {
      const invalidPayloads = [
        null,
        undefined,
        {},
        { id: 'obj-123' },
        { x: 100, y: 200 },
        { id: 'obj-123', x: 100 },
        { id: 'obj-123', y: 200 },
      ]

      invalidPayloads.forEach(payload => {
        expect(validateMovePayload(payload)).toBe(false)
      })
    })

    test('should return false for invalid id type', () => {
      const invalidIds = [
        { id: 123, x: 100, y: 200 },
        { id: null, x: 100, y: 200 },
        { id: undefined, x: 100, y: 200 },
        { id: {}, x: 100, y: 200 },
        { id: [], x: 100, y: 200 },
        { id: true, x: 100, y: 200 },
      ]

      invalidIds.forEach(payload => {
        expect(validateMovePayload(payload)).toBe(false)
      })
    })

    test('should return false for invalid x/y types', () => {
      const invalidCoordinates = [
        { id: 'obj-123', x: '100', y: 200 },
        { id: 'obj-123', x: 100, y: '200' },
        { id: 'obj-123', x: null, y: 200 },
        { id: 'obj-123', x: 100, y: null },
        { id: 'obj-123', x: NaN, y: 200 },
        { id: 'obj-123', x: 100, y: NaN },
        { id: 'obj-123', x: Infinity, y: 200 },
        { id: 'obj-123', x: 100, y: Infinity },
        { id: 'obj-123', x: undefined, y: 200 },
      ]

      invalidCoordinates.forEach(payload => {
        expect(validateMovePayload(payload)).toBe(false)
      })
    })

    test('should return false for non-object payload', () => {
      const nonObjects = [
        'string',
        123,
        true,
        false,
        null,
        undefined,
        () => {},
      ]

      nonObjects.forEach(payload => {
        expect(validateMovePayload(payload)).toBe(false)
      })
    })

    test('should accept floating point numbers', () => {
      const floatPayloads = [
        { id: 'obj-1', x: 100.123, y: 200.456 },
        { id: 'obj-2', x: -50.99, y: 75.01 },
        { id: 'obj-3', x: 0.0001, y: -0.0001 },
      ]

      floatPayloads.forEach(payload => {
        expect(validateMovePayload(payload)).toBe(true)
      })
    })
  })

  describe('Edge Cases and Combined Validation', () => {
    test('should handle all validation functions with boundary values', () => {
      // Максимальные допустимые значения
      const maxName = 'a'.repeat(100)
      const maxPassword = 'a'.repeat(128)
      const maxEmail = `${'a'.repeat(243)}@a.co` // 243 + 1 + 4 = 248 characters

      expect(validateName(maxName)).toBe(true)
      expect(validatePassword(maxPassword)).toBe(true)
      expect(validateEmail(maxEmail)).toBe(true)

      // Чуть выше максимальных значени
      const tooLongName = 'a'.repeat(101)
      const tooLongPassword = 'a'.repeat(129)
      const tooLongEmail = `${'a'.repeat(244)}@example.com`

      expect(validateName(tooLongName)).toBe(false)
      expect(validatePassword(tooLongPassword)).toBe(false)
      expect(validateEmail(tooLongEmail)).toBe(false)
    })

    test('should handle SQL injection attempts in validation', () => {
      const maliciousInputs = [
        "Robert'); DROP TABLE Users; --",
        "' OR '1'='1",
        '<script>alert("xss")</script>',
        '--',
        ';',
        "\\x00",
      ]

      maliciousInputs.forEach(input => {

        expect(validateName(input)).toBe(true)
        expect(validateEmail(input)).toBe(false) 
        expect(validatePassword(input)).toBe(true) 
      })
    })

    test('should validate move payload with maximum coordinate values', () => {
      const maxPayload = {
        id: 'max-coords',
        x: Number.MAX_SAFE_INTEGER,
        y: Number.MIN_SAFE_INTEGER,
      }
      expect(validateMovePayload(maxPayload)).toBe(true)
    })
  })
})