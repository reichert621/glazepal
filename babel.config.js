module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {jsxImportSource: 'nativewind'}],
      'nativewind/babel',
    ],

    plugins: [
      ['inline-import', {extensions: ['.sql']}],
      // Make sure this is listed last
      'react-native-reanimated/plugin',
    ],
  };
};
