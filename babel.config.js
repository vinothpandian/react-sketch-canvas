module.exports = function (api) {
  if (api.env('production')) {
    return {};
  }

  return {
    plugins: ['transform-class-properties', 'istanbul'],
  };
};
