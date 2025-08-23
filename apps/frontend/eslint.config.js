import js from "@eslint/js";
import globals from "globals";
let reactFlat = [];
let reactPlugin = undefined;
let reactHooksPlugin = undefined;
let reactHooksRules = {};
try {
  const mod = await import("eslint-plugin-react");
  reactPlugin = mod.default;
  const flat = mod.default?.configs?.flat?.recommended;
  if (flat) reactFlat = [flat];
} catch (_) {}
try {
  const mod = await import("eslint-plugin-react-hooks");
  reactHooksPlugin = mod.default;
  reactHooksRules = mod.default?.configs?.recommended?.rules ?? {};
} catch (_) {}

// Try to load the flat-config helper from 'typescript-eslint'.
// Fallback to classic @typescript-eslint parser + plugin if unavailable.
let tsFlatConfigs = [];
try {
  const ts = await import("typescript-eslint");
  tsFlatConfigs = ts?.default?.configs?.recommended ?? ts?.configs?.recommended ?? [];
} catch (_) {
  const tsParser = (await import("@typescript-eslint/parser")).default;
  const tsPlugin = (await import("@typescript-eslint/eslint-plugin")).default;
  tsFlatConfigs = [
    {
      languageOptions: { parser: tsParser },
      plugins: { "@typescript-eslint": tsPlugin },
      rules: { ...(tsPlugin.configs?.recommended?.rules ?? {}) },
    },
  ];
}

export default [
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"] },
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...tsFlatConfigs,
  ...reactFlat,
  {
    plugins: Object.fromEntries(
      [
        ["react", reactPlugin],
        ["react-hooks", reactHooksPlugin],
      ].filter(([, v]) => !!v)
    ),
    languageOptions: {
      globals: globals.browser
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      ...reactHooksRules,
    }
  }
];
