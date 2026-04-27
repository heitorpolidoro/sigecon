import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/**/*'],
        exclude: ['src/main.tsx', 'src/vite-env.d.ts', '**/*.test.tsx', '**/*.test.ts'],
      },
    },
  })
);
