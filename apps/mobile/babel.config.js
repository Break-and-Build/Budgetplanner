module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@budgetplanner/core': '../../packages/core/src/index.ts',
            '@': './src',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      // Reanimated 4 (SDK 54) wires its worklet plugin automatically via
      // babel-preset-expo — no manual entry needed. Add 'react-native-worklets/plugin'
      // here only if you start using worklets directly.
    ],
  };
};
