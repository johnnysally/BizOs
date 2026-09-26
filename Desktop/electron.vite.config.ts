import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
) as { version: string };

const SRC = resolve(__dirname, 'src');
const ROOT = __dirname;

console.log('[electron-vite] ROOT =', ROOT);
console.log('[electron-vite] SRC  =', SRC);

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/main.ts') },
      },
    },
  },

  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/preload.ts') },
      },
    },
  },

  renderer: {
    root: ROOT,
    base: './',
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: {
        '@': SRC,
      },
    },
    server: {
      port: 3000,
      strictPort: true,
    },
    build: {
      outDir: 'dist/renderer',
      emptyOutDir: true,
      target: 'chrome150',
      rollupOptions: {
        input: { index: resolve(__dirname, 'index.html') },
      },
    },
  },
});