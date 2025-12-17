module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    // React 17+ no need to import React in scope
    'react/react-in-jsx-scope': 'off',

    // TS projects should disable base no-undef as it doesn't understand TS types
    'no-undef': 'off',

    // Prefer const and function expressions (const) for consistency
    'prefer-const': 'error',
    'no-var': 'error',
    'func-style': ['error', 'expression'],
    'react/function-component-definition': [
      'error',
      { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
    ],

    // Naming: prefer camelCase for identifiers; allow snake_case in object properties (e.g., API fields)
    camelcase: ['warn', { properties: 'never', ignoreDestructuring: true }],

    // Use eslint-plugin-unused-imports instead of default no-unused-vars
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
};
