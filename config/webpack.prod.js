const path = require('path');
const merge = require('webpack-merge');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  plugins: [
    new CleanWebpackPlugin()
  ],
  output: {
    filename: 'smartTable.min.js',
    path: path.resolve(__dirname, '../dist')
  },
});