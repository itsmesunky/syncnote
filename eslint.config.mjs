import { FlatCompat } from "@eslint/eslintrc";
import vitestPlugin from "eslint-plugin-vitest";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    files: ["src/**/*.spec.{ts,tsx}"],
    plugins: {
      vitestPlugin,
    },
    rules: {
      "vitest/expect-expect": "off",
    },
    languageOptions: {
      globals: {
        globalThis: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
        vi: true,
      },
    },
  },
];

export default eslintConfig;
