/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import { handleApiRequest } from "./src/server/api";

function apiDevPlugin() {
  let proxy: any = null;
  return {
    name: "api-dev-plugin",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url.startsWith("/api/")) {
          try {
            if (!proxy) {
              const { getPlatformProxy } = await import("wrangler");
              proxy = await getPlatformProxy();
            }

            const url = new URL(req.url, "http://localhost:8080");

            // Read body
            let body = undefined;
            if (req.method !== "GET" && req.method !== "HEAD") {
              body = await new Promise((resolve, reject) => {
                const chunks: Buffer[] = [];
                req.on("data", (c: Buffer) => chunks.push(c));
                req.on("end", () => resolve(Buffer.concat(chunks)));
                req.on("error", reject);
              });
            }

            const webReq = new Request(url.href, {
              method: req.method,
              headers: req.headers as Record<string, string>,
              body: body as any,
            });

            // Make sure env is passed
            const response = await handleApiRequest(
              webReq,
              proxy.env as any,
              proxy.ctx,
            );

            res.statusCode = response.status;
            response.headers.forEach((v: string, k: string) => {
              res.setHeader(k, v);
            });

            const ab = await response.arrayBuffer();
            res.end(Buffer.from(ab));
          } catch (e: any) {
            console.error(e);
            res.statusCode = 500;
            res.end(e.toString());
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  server: {
    port: 8080,
    strictPort: true,
  },
  plugins: [
    apiDevPlugin(),
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      server: {
        entry: "src/server.ts",
      },
    }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "logo-192.png",
        "logo-512.png",
        "logo-dark-192.png",
        "logo-dark-512.png",
      ],
      manifest: {
        name: "MomentStash",
        short_name: "MomentStash",
        description:
          "A digital scrapbook for your cafes, sunsets, and quiet moments.",
        theme_color: "#f6f5f3",
        background_color: "#f6f5f3",
        display: "standalone",
        icons: [
          {
            src: "logo-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "logo-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "logo-dark-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "logo-dark-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
  ],
});
