import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
        '**/services/**', // Services make network calls, tested via integration
        '**/soap/client.ts', // SOAP client makes network calls
        '**/soap/xml-parser.ts', // Parser tested via integration
        '**/hooks/**', // React hooks tested via E2E
        '**/components/**', // Components tested via E2E
        '**/app/**', // Pages tested via E2E
        '**/storage/**', // Storage tested via E2E
      ],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
