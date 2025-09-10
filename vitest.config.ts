import { defineConfig } from 'vitest/config'
import { defineNuxtConfig } from 'nuxt/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'coverage/',
        '.nuxt/',
        'dist/',
      ]
    }
  },
  resolve: {
    alias: {
      '~': '.',
      '@': '.',
      '#app': '#app'
    }
  }
})