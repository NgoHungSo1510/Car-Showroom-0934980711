import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        rules: {
            // Google Style
            'indent': ['error', 2],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'max-len': ['warn', { code: 100, ignoreUrls: true, ignoreStrings: true }],

            // TypeScript
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'off',

            // Node.js Best Practices
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],

            // Disable problematic rules for Vietnamese content
            'no-misleading-character-class': 'off',

            // Allow Express namespace augmentation and regex escapes
            '@typescript-eslint/no-namespace': 'off',
            'no-useless-escape': 'off',
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**', 'src/scripts/seed.ts'],
    }
);

