module.exports = {
  extends: [
    "turbo",
    "airbnb",
    "airbnb/hooks",
    "prettier",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
  ],
  rules: {
    "react/require-default-props": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-cond-assign": ["error", "except-parens"],
    "react/jsx-filename-extension": [1, { extensions: [".tsx", ".jsx"] }],
    "import/extensions": [1, "never"],
    "import/prefer-default-export": "off",
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};
