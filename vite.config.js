import { defineConfig } from 'vite'

export default defineConfig({
    root: '.',
    base: './',
    publicDir: false,
    build: {
        outDir: 'dist',
        emptyOutDir: true
    },
    server: {
        port: 5173,
        open: true
    }
})
