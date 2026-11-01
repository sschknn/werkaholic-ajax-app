import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';
  
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    plugins: [react(), tailwindcss()],
    build: {
          // https://rollupjs.org/guide/en/#outputtreeshake-treeshaking
          // Enable tree shaking
          treeShaking: true,
          // Don't minify for now to debug
          minify: false,
          rollupOptions: {
            output: {
              // preserveder module names for debugging
              preserveModules: true,
              preserveModulesRoot: 'src',
            },
          },
          outDir: 'dist',
        },
  };
});
