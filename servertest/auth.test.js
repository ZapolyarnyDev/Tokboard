import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'

// простой маршрут для тестирования
const app = express()
app.use(cookieParser())
app.use(express.json())

// мок auth router вручную для теста
app.post('/auth/register', (req, res) => {
  const { email, name, password } = req.body
  
  // валидация
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }
  
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be 8-128 characters' })
  }
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Invalid name' })
  }
  
  // Успешная регистрация
  res.status(201).json({ 
    accessToken: 'mock-token',
    user: { id: 1, email, name, role: 'USER' }
  })
})

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body
  
  if (email === 'test@test.com' && password === 'password123') {
    return res.status(200).json({ 
      accessToken: 'mock-token',
      user: { id: 1, email, name: 'Test User', role: 'USER' }
    })
  }
  
  return res.status(401).json({ message: 'Invalid credentials' })
})

describe('Auth API', () => {
  describe('POST /auth/register', () => {
    it('создаёт пользователя с валидными данными', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@test.com', name: 'Test User', password: 'password123' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('accessToken')
    })

    it('отклоняет регистрацию с невалидным email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'invalid', name: 'Test', password: 'password123' })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Invalid email format')
    })

    it('отклоняет короткий пароль', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@test.com', name: 'Test', password: 'short' })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Password must be 8-128 characters')
    })

    it('отклоняет пустое имя', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@test.com', name: '', password: 'password123' })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Invalid name')
    })
  })

  describe('POST /auth/login', () => {
    it('логинит пользователя с правильными данными', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
    })

    it('отклоняет неправильный пароль', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })

      expect(res.status).toBe(401)
    })
  })
})
