import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'tests/e2e-admin/**', 'node_modules/**', '.next/**'],
    environment: 'node',
  },
});