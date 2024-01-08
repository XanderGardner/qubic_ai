const path = require('path');

module.exports = {
  entry: {
    index_loading: './scripts/index_loading.js',
    engine_multiplayer: './scripts/engine_multiplayer.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
