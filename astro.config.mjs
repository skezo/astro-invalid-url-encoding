import node from "@astrojs/node";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  // Middleware mode: standalone mode has its own decodeURI → 400 guard in
  // front of Astro, which hides the bug.
  adapter: node({ mode: "middleware" }),
});
