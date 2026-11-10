import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: { include: ["tests/**/*.test.ts", "scripts/ops/**/*.test.ts"], environment: "node", setupFiles: ["tests/setup-env.ts"] },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
