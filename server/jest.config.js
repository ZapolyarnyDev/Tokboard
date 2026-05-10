export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['<rootDir>/src/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage',
}
