import { defineConfig } from 'vite';

export default defineConfig({
    base: '/oblivion-tesseract/',
    build: {
        outDir: 'docs',  // GitHub Pages peut servir depuis /docs
        assetsDir: 'assets',
        sourcemap: true,
        emptyOutDir: true
    },
    server: {
        port: 3000,
        open: true
    }
});
