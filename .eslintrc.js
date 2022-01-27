module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    // 'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
  },
};
