import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    minify: "terser",
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "react-toastify"],
          forms: ["react-hook-form"],
          state: ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
  },
});
