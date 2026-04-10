'use strict';

const OFF = 0;
const ERROR = 2;
module.exports = {
  // Stop ESLint from looking for a configuration file in parent folders
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:react/recommended',
    'plugin:import/typescript',
    'plugin:storybook/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'prettier',
    'react-hooks',
    'jest',
    'react',
    'import',
    // 'json-format',
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/prop-types': 0,
    'import/named': 0,
    'react/react-in-jsx-scope': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    // '@typescript-eslint/ban-ts-ignore': 1,
    '@typescript-eslint/no-var-requires': 0,
    'require-yield': 0,
    'react-hooks/exhaustive-deps': [
      1,
      {
        additionalHooks: '(useEventHandler)',
      },
    ],
    // 'import/no-restricted-paths': [
    //   2,
    //   {
    //     zones: [
    //       {
    //         target: './src/!(frontend)/**/*',
    //         from: './src/frontend/**/*',
    //       },
    //     ],
    //   },
    // ],
    'no-undef': OFF,
    'no-use-before-define': OFF,
    'react-hooks/rules-of-hooks': 'error',
    'prettier/prettier': ERROR,
    'accessor-pairs': OFF,
    'brace-style': [ERROR, '1tbs'],
    'consistent-return': OFF,
    'dot-location': [ERROR, 'property'],
    'dot-notation': ERROR,
    'eol-last': ERROR,
    eqeqeq: [ERROR, 'allow-null'],
    indent: OFF,
    'jsx-quotes': [ERROR, 'prefer-double'],
    'keyword-spacing': [
      ERROR,
      {
        after: true,
        before: true,
      },
    ],
    'no-bitwise': OFF,
    'no-inner-declarations': [ERROR, 'functions'],
    'no-multi-spaces': ERROR,
    'no-restricted-syntax': [ERROR, 'WithStatement'],
    'no-shadow': ERROR,
    'no-unused-expressions': ERROR,
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '_', args: 'none', varsIgnorePattern: '_', destructuredArrayIgnorePattern: '_' },
    ],
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '_', args: 'none', varsIgnorePattern: '_', destructuredArrayIgnorePattern: '_' },
    ],
    'no-useless-concat': OFF,
    quotes: [
      ERROR,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    'space-before-blocks': ERROR,
    'space-before-function-parent': OFF,
    'import/no-unresolved': OFF,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
