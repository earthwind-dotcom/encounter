import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // `server-only` throws outside a React Server environment; tests run the server code directly.
      'server-only': path.resolve(__dirname, 'tests/empty.ts'),
    },
  },
  test: { include: ['tests/**/*.test.ts'], testTimeout: 30_000 },
});
