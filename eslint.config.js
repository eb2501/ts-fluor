import js from '@eslint/js'
import parser from '@typescript-eslint/parser'
import plugin from '@typescript-eslint/eslint-plugin'
import { defineConfig } from "eslint/config"

export default defineConfig([
  {
    ignores: [
      'node_modules',
      'dist',
      'coverage',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ...js.languageOptions,
      parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': plugin,
    },
    rules: {
      ...js.rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      indent: ['error', 2, { SwitchCase: 1 }],
    },
  },
  {}, // catch-all config for ESLint flat config
])
