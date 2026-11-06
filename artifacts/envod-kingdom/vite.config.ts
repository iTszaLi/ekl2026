import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT) || 5173;
const basePath = process.env.BASE_PATH || "/";
// Git Bash (MSYS) on Windows rewrites `BASE_PATH=/` into a Windows folder such
// as "C:/Program Files/Git/". The build then succeeds but every prerendered
// page is empty because no route matches, so refuse to build instead.
if (!basePath.startsWith("/")) {
  throw new Error(
    `BASE_PATH must start with "/" (received "${basePath}"). ` +
      "In Git Bash on Windows, run the command with MSYS_NO_PATHCONV=1 " +
      "or leave BASE_PATH unset (it defaults to \"/\").",
  );
}
const replitDevPlugins =
  process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
    ? [
        await import("@replit/vite-plugin-runtime-error-modal").then((m) =>
          m.default(),
        ),
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer({
            root: path.resolve(import.meta.dirname, ".."),
          }),
        ),
        await import("@replit/vite-plugin-dev-banner").then((m) =>
          m.devBanner(),
        ),
      ]
    : [];

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...replitDevPlugins,
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll("\\", "/");
          if (normalizedId.includes("/node_modules/react-dom/cjs/react-dom-client.production.js")) {
            return "react-dom-client";
          }
          if (normalizedId.includes("/src/lib/service-data.ts")) {
            return "site-content";
          }
          if (
            normalizedId.includes("/src/lib/industry-data.ts") ||
            normalizedId.includes("/src/lib/seo-config.ts") ||
            normalizedId.includes("/src/lib/pillar-data/") ||
            normalizedId.includes("/src/lib/services-faq.ts") ||
            normalizedId.includes("/src/lib/service-review-faq.ts") ||
            normalizedId.includes("/src/lib/gallery-content.ts") ||
            normalizedId.includes("/src/lib/vision-data.ts")
          ) {
            return "site-content";
          }
          if (normalizedId.includes("/node_modules/tailwind-merge/")) {
            return "class-utils";
          }
          if (
            normalizedId.includes("/node_modules/framer-motion/") ||
            normalizedId.includes("/node_modules/motion-dom/") ||
            normalizedId.includes("/node_modules/motion-utils/")
          ) {
            return "motion-vendor";
          }
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
