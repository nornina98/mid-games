import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === "singlefile" ? [viteSingleFile()] : []),
  ],
  build: {
    outDir: mode === "singlefile" ? "dist-single" : "dist",
    assetsInlineLimit: mode === "singlefile" ? 10_000_000 : 4096,
    chunkSizeWarningLimit: 1500,
    // sokong Safari/iPhone lama (transpile optional chaining dll.)
    target: ["es2018", "safari12", "chrome70", "firefox70"],
  },
}));
