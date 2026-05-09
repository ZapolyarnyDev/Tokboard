export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@prisma/client$': '<rootDir>/__mocks__/@prisma/client.js'
  },
  transformIgnorePatterns: [],
}
