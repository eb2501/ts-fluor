import { defineConfig } from "vite";

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: './index.html',
    },
  },
  server: {
    open: '/index.html',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
    extensions: ['.js', '.ts'],
  },
  plugins: [],
});
