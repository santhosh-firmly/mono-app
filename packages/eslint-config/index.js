import { fileURLToPath } from "node:url";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import js from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import noRelativeLibImports from "./rules/no-relative-lib-imports.js";

const gitignorePath = fileURLToPath(
  new URL("../../.gitignore", import.meta.url),
);

/**
 * @param {object} options
 * @param {string} owptions.gitignorePath - Path to the .gitignore file
 * @param {object} options.svelteConfig - Svelte config object
 * @returns {import('eslint').Linter.Config[]}
 */
export default function createConfig({ svelteConfig, ignores = [] }) {
  return [
    includeIgnoreFile(gitignorePath),
    eslintPluginPrettierRecommended,
    js.configs.recommended,
    ...svelte.configs.recommended,
    ...svelte.configs.prettier,
    {
      ignores,
    },
    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
      plugins: {
        custom: {
          rules: {
            "no-relative-lib-imports": noRelativeLibImports,
          },
        },
      },
    },
    {
      files: ["**/*.svelte", "**/*.svelte.js"],
      languageOptions: {
        parserOptions: {
          svelteConfig,
        },
      },
    },
  ];
}
