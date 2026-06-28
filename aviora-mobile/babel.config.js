module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin', // required by reanimated 4.x
    ],
  };
};
