module.exports = {
  env: {
    browser: true,
  },
  root: true,
  extends: ["airbnb-typescript-prettier"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Allow single Named-export
    "import/prefer-default-export": "off",

    // Set react-hooks lint as error
    "react-hooks/rules-of-hooks": "error",

    // Allow storybook import
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [".storybook/**", "stories/**", "**/*.stories.tsx"],
      },
    ],

    // Allow react elements in stories.js
    "react/jsx-filename-extension": [
      "error",
      { extensions: [".stories.ts", ".ts", ".tsx"] },
    ],

    // For immer
    "no-param-reassign": [
      "error",
      { props: true, ignorePropertyModificationsFor: ["draft"] },
    ],

    // Specific to typescript
    "react/static-property-placement": ["warn", "static public field"],
    "react/jsx-fragments": "off",

    "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
};
