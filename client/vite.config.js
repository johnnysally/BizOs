import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import pkg from './package.json' with { type: 'json' };
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    server: {
        port: 3000,
        strictPort: true,
        host: true,
    },
    preview: {
        port: 3000,
        strictPort: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules'))
                        return undefined;
                    if (id.includes('lucide-react'))
                        return 'ui';
                    if (id.includes('react'))
                        return 'vendor';
                    return undefined;
                },
            },
        },
    },
});
