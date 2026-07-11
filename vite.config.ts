/// <reference types="vitest" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: [
        'src/modules/auth/permissions.ts',
        'src/modules/navigation/**/*.{ts,tsx}',
        'src/modules/support/hooks/**/*.{ts,tsx}',
        'src/modules/superAdmin/nav.config.ts',
        'src/modules/superAdmin/permissions.ts',
        'src/pages/AccessDeniedPage.tsx',
        'src/pages/NotFoundPage.tsx',
      ],
      exclude: ['src/test/**', '**/*.d.ts', '**/*.test.*'],
      thresholds: {
        lines: 70,
        functions: 60,
        branches: 50,
        statements: 70,
      },
    },
  },
});
