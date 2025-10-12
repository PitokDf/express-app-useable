const tsParser = require('@typescript-eslint/parser');

module.exports = [
    {
        ignores: ['node_modules/**', 'dist/**', 'uploads/**', 'logs/**', '*.log', 'tests/**'],
    },
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            'unused-imports': require('eslint-plugin-unused-imports'),
        },
        rules: {
            // TypeScript-aware unused vars
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',

            // Remove unused imports automatically flagged
            'unused-imports/no-unused-imports': 'warn',
            'unused-imports/no-unused-vars': ['warn', {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_'
            }],

            // Allow explicit any type
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
];
