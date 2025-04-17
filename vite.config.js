import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    outDir: 'dist', // Output directory for the build
    rollupOptions: {
      output: {
        assetFileNames: '[name][extname]', // Place CSS files directly in dist
        entryFileNames: '[name].js', // Place JS files directly in dist
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/partials/*', // Copy all files inside src/partials
          dest: 'partials', // Copy directly to dist/partials
        },
        {
          src: 'src/partials/images/*', // Copy all images in src/partials/images
          dest: 'images', // Destination folder in dist
        },
      ],
    }),
  ],
});