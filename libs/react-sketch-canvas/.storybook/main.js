const rootMain = require('../../../.storybook/main');

rootMain.addons.push(...['@storybook/addon-docs', '@storybook/preset-scss']);

rootMain.stories.push(
  ...[
    '../src/stories/**/*.stories.mdx',
    '../src/stories/**/*.stories.@(js|jsx|ts|tsx)',
  ]
);

module.exports = rootMain;
