const ts = require('@typescript-eslint/eslint-plugin');
const babel = require('@babel/eslint-plugin');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const tsParser = require('@typescript-eslint/parser');
const config = require('@ecomfe/eslint-config/strict');
const tsConfig = require('@ecomfe/eslint-config/typescript/strict');
const reactConfig = require('@ecomfe/eslint-config/react/strict');

module.exports = [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: './**/tsconfig.json',
            },
        },
        settings: {
            react: {
                version: '18.0.0',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            '@babel': babel,
            '@typescript-eslint': ts,
        },
        rules: {
            ...config.rules,
            ...reactConfig.rules,
            ...tsConfig.overrides.at(0).rules,
            'react/jsx-no-bind': 'off',
        },
    },
];
