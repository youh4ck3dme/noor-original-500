import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    environmentMatchGlobs: [['app/**/*.test.tsx', 'jsdom']],
    include: ['app/**/*.test.ts', 'app/**/*.test.tsx'],
    exclude: ['tests/**', 'src/App.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
