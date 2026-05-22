import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {ignores: [
    ".vscode-test/**", 
    "out/**", 
    "dist/**", 
    "client/out/**", 
    "server/out/**",
    "server/test*.js",
    "server/test*.ts",
    "server/debug.ts",
    "server/src/test.ts"
  ]},
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-case-declarations": "off",
      "prefer-const": "off",
      "no-var": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "no-empty": "off"
    }
  }
];
