module.exports = function ({ command }) {
  const config = {
    type: 'react-component',
    npm: {
      esModules: true,
      umd: {
        global: 'SvgSketchCanvas',
        externals: {
          react: 'React',
        },
      },
    },
  };
  // Only include react-hot-loader config when serving a development build
  if (command.startsWith('serve')) {
    config.babel = { plugins: 'react-hot-loader/babel' };
    config.webpack = {
      config(webpackConfig) {
        // React Hot Loader's patch module needs to run before your app
        webpackConfig.entry.unshift('react-hot-loader/patch');
        return webpackConfig;
      },
    };
  }
  return config;
};
