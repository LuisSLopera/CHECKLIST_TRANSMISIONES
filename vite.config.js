import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Plugin to copy checklist.md to public directory during build and development
function copyChecklistPlugin() {
  return {
    name: 'copy-checklist',
    buildStart() {
      const srcPath = path.resolve(__dirname, 'checklist.md');
      const distDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.resolve(distDir, 'checklist.md'));
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/checklist.md' || req.url?.endsWith('checklist.md')) {
          const srcPath = path.resolve(__dirname, 'checklist.md');
          if (fs.existsSync(srcPath)) {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            return res.end(fs.readFileSync(srcPath, 'utf-8'));
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), copyChecklistPlugin()],
  base: './', // Ensures relative paths for seamless GitHub Pages deployment
  build: {
    outDir: 'dist',
  }
});
