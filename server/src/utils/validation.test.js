import {
  validateCreateObjectPayload,
  validateEmail,
  validateMoveObjectPayload,
  validateMovePayload,
  validateName,
  validatePassword,
  validateUpdateObjectPayload,
} from './validation.js'

describe('validation utils', () => {
  test('validates auth fields', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('invalid')).toBe(false)
    expect(validatePassword('12345678')).toBe(true)
    expect(validatePassword('short')).toBe(false)
    expect(validateName('Student')).toBe(true)
    expect(validateName('   ')).toBe(false)
  })

  test('validates legacy move payloads', () => {
    expect(validateMovePayload({ id: 'obj-1', x: 10, y: 20 })).toBe(true)
    expect(validateMovePayload({ id: 'obj-1', x: '10', y: 20 })).toBe(false)
    expect(validateMovePayload({ x: 10, y: 20 })).toBe(false)
  })

  test('validates object creation payloads', () => {
    expect(
      validateCreateObjectPayload({
        type: 'rect',
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        stroke: '#222222',
        fill: '#ffffff',
        strokeWidth: 2,
      }),
    ).toBe(true)

    expect(
      validateCreateObjectPayload({
        type: 'line',
        x1: 0,
        y1: 0,
        x2: 120,
        y2: 60,
        strokeWidth: Number.POSITIVE_INFINITY,
      }),
    ).toBe(false)
  })

  test('validates object update and move payloads', () => {
    expect(
      validateUpdateObjectPayload({
        id: 'obj-1',
        type: 'text',
        text: 'Updated text',
        fontSize: 18,
        color: '#111111',
      }),
    ).toBe(true)

    expect(validateMoveObjectPayload({ id: 'obj-1', x: 30, y: 40 })).toBe(true)
    expect(validateMoveObjectPayload({ id: 'obj-1', x: Number.NaN, y: 40 })).toBe(false)
  })
})
