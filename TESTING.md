# Тестирование

Проект использует npm workspaces:

- `client` - frontend на Vue 3, Pinia и Vitest.
- `server` - backend на Node.js, Express и Jest.

## Минимальный запуск

Из корня проекта:

```bash
npm ci
npm test
```

Отдельно frontend:

```bash
npm test --workspace client
```

Отдельно backend:

```bash
npm test --workspace server
```

Покрытие:

```bash
npm run test:coverage
```

Integration-тесты backend:

```bash
npm run test:integration --workspace server
```

Сейчас integration-команда настроена отдельно и не падает при отсутствии integration-файлов. Для тестов с PostgreSQL перед запуском нужно подготовить `DATABASE_URL`, поднять тестовую базу и применить миграции.

## Что покрыто

Frontend:

- Pinia store авторизации.
- Pinia store интерфейса доски.
- Форма входа на `GuestDashboard`.

Backend:

- Валидация email, пароля, имени и payload объектов доски.
- `AuthService`: регистрация, повторная регистрация, login, refresh-token rotation.
- `requireAuth` middleware через Express + Supertest.

## CI/CD

Для CI достаточно выполнить:

```bash
npm ci
npm test
npm run test:coverage
```

Если в CI включаются integration-тесты с базой данных, перед командой `npm run test:integration --workspace server` нужно поднять PostgreSQL и выполнить миграции Prisma.
