import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { newsletterDevApi } from "./server/dev-api.mjs";

export default defineConfig(({ mode }) => ({
  base: process.env.VERCEL_PROJECT_NAME === "bcn-design-preview" ? "/BCN/" : "/",
  plugins: [react(), newsletterDevApi(loadEnv(mode, process.cwd(), ""))],
  build: {
    assetsInlineLimit: 0
  }
}));
