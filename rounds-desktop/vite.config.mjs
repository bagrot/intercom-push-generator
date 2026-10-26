import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  base: "/rounds/",
  publicDir: path.resolve(root, "../vendor/rounds/public"),
  resolve: { dedupe: ["react", "react-dom", "react/jsx-runtime"] },
  plugins: [
    {
      name: "rounds-jsx-source",
      enforce: "pre",
      async transform(code, id) {
        if (!/vendor[\\/]rounds[\\/]app[\\/]app[\\/]page\.js$/.test(id)) return null;
        return transformWithEsbuild(code, id, { loader: "jsx", jsx: "automatic" });
      },
    },
    react(),
  ],
  build: {
    outDir: path.resolve(root, "../dist/client/rounds"),
    emptyOutDir: true,
  },
});
