const path = require('path');

module.exports = {
  entry: {
    index_loading: './scripts/index_loading.js',
    game_engine: './scripts/game_engine.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
