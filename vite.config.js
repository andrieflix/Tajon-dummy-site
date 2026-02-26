import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Get all HTML files in the root directory
const htmlFiles = readdirSync('.').filter(file => file.endsWith('.html'));

// Create an object mapping HTML file names to their paths
const input = htmlFiles.reduce((acc, file) => {
  const name = file.replace('.html', '');
  acc[name] = resolve(__dirname, file);
  return acc;
}, {});

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input,
    },
  },
  server: {
    open: '/index.html',
    port: 3000,
  },
});
