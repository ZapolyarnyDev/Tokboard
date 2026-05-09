import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.js', 'src/**/__tests__/*.spec.js'],
    exclude: ['node_modules', 'dist'],
  },
})
