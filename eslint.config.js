const js = require('@eslint/js');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  { ignores: ['dist', 'coverage', '.expo', 'node_modules', 'expo-env.d.ts', 'eslint.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.jest } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
