import eslintPluginAstro from "eslint-plugin-astro";
import tsParser from "@typescript-eslint/parser";

export default [
  // Ignore build output and generated files
  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      ".wrangler/",
      ".netlify/",
      "public/search/",
      "scripts/",
    ],
  },

  // Astro recommended rules (includes parser config for .astro files)
  ...eslintPluginAstro.configs.recommended,

  // Relax rules that conflict with Astro template patterns
  {
    files: ["**/*.astro"],
    rules: {
      "no-unused-vars": "off",
    },
  },

  // TypeScript / JS files — need explicit TS parser
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
