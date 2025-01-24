import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import * as importPlugin from 'eslint-plugin-import';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        ignores: [
            'node_modules/**',
            'eslint.config.js',
            'webpack.config.js',
            '**/*.js'
        ],
        extends: [importPlugin.flatConfigs?.recommended],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
);