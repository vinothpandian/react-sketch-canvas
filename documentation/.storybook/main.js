module.exports = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: [
    "@storybook/preset-typescript",
    "@storybook/addon-knobs/register",
    "@storybook/addon-viewport/register",
    "@storybook/addon-actions",
    "@storybook/addon-storysource",
    "@storybook/addon-links",
  ],
};
