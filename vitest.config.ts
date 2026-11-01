import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
    },
    conditions: ['browser', 'module', 'default'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    exclude: ['**/node_modules/**', 'test-e2e.spec.js', 'tests/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});