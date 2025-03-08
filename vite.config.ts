import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/recipe-builder/', // ✅ Ensures correct paths for GitHub Pages
  plugins: [react()],
  build: {
    outDir: 'dist', // ✅ Ensures the build output goes to `dist/`
    emptyOutDir: true, // ✅ Clears `dist/` before each build
  },
  server: {
    port: 5173, // ✅ Runs on port 5173 locally
    open: true, // ✅ Automatically opens in browser
  },
});
