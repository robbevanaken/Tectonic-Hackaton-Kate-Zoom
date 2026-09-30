import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/** Same hardening headers on the dev and preview servers as a production host should send. */
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: {
    host: "localhost",
    port: 5180,
    strictPort: true,
    headers: securityHeaders,
    proxy: { "/api": { target: "http://127.0.0.1:4000", changeOrigin: true } },
  },
  preview: { host: "localhost", port: 5181, headers: securityHeaders },
  build: { sourcemap: false },
});
