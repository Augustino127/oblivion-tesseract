import { defineConfig } from 'vite';

export default defineConfig({
    base: '/oblivion-tesseract/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true
    },
    server: {
        port: 3000,
        open: true
    }
});
