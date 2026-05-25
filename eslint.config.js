import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // TypeScript rules - mais inteligentes
      "@typescript-eslint/no-explicit-any": ["warn", {
        "fixToUnknown": false,
        "ignoreRestArgs": true // Permite ...args: any[]
      }],

      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],

      // Permitir any em catch blocks (comum e seguro)
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",

      // Avisar sobre console.log (mas permitir warn e error)
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],

      // Permitir objetos vazios temporariamente
      "@typescript-eslint/no-empty-object-type": "off",

      // Permitir require em configs
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
