import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

const nodeGlobals = {
  process: "readonly",
  console: "readonly",
  URL: "readonly",
  Buffer: "readonly",
  setTimeout: "readonly",
  window: "readonly",
  document: "readonly",
  getComputedStyle: "readonly",
};

export default [
  { ignores: ["dist/**", ".astro/**", ".vercel/**", "node_modules/**", "test-results/**", "playwright-report/**", "docs/**", "scripts/perf/**", ".lighthouse/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { languageOptions: { globals: nodeGlobals } },
  { rules: { "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }] } },
];
