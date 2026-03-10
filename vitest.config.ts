import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/lib/test/vitest.setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text"],
    },
  },
});
