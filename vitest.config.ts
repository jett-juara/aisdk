import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  cacheDir: '.tmp-vitest-cache',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'src/tests/setup.ts')],
    css: false,
    include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
    exclude: ['node_modules/**', '.references/**', 'agent-os/**', '.next/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    },
  },
})
