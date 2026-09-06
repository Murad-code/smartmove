import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/**
 * Flat config. `eslint-config-next` ships flat presets from v15 onwards, so
 * the old `FlatCompat` shim is no longer needed.
 */
const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Suppressing type errors hides real bugs; fix the type instead.
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    // Scripts and tests run outside Next and legitimately write to stdout.
    files: ['src/scripts/**', 'tests/**', '*.config.*'],
    rules: { 'no-console': 'off' },
  },
  {
    ignores: [
      '.next/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'media/',
      'src/migrations/',
      'src/payload-types.ts',
      'src/app/(payload)/admin/importMap.js',
    ],
  },
]

export default eslintConfig
