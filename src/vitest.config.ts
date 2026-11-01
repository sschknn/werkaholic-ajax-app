import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, ''),
        '@/services': path.resolve(__dirname, 'src/services'),
        '@/types': path.resolve(__dirname, 'src/types'),
        '@/hooks': path.resolve(__dirname, 'src/hooks'),
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/contexts': path.resolve(__dirname, 'src/contexts'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
      },
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});