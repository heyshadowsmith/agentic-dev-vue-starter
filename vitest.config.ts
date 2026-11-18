import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

const root = fileURLToPath(new URL('.', import.meta.url))

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts'],
      root,
      coverage: {
        provider: 'v8',
        include: ['src/core/**/*.{ts,mts,tsx}'],
        exclude: ['src/core/**/__tests__/**', 'src/core/**/*.{test,spec}.{ts,mts,tsx}'],
        thresholds: {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
      },
    },
  }),
)
