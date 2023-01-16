module.exports = {
  extends: ["turbo", "airbnb-typescript-prettier"],
  rules: {
    "react/require-default-props": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-cond-assign": ["error", "except-parens"],
  },
};
