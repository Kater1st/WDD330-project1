import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Adjust this if deploying to a subdirectory
  build: {
    outDir: 'dist', // Output directory for the build
  },
});