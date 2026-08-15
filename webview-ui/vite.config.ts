import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from "path";

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      'tally-tdl-shared': path.resolve(__dirname, '../shared/src/index.ts')
    }
  },
  build: {
    outDir: "../dist/webview-ui",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
