const path = require('path');
const merge = require('webpack-merge');
const webpack = require("webpack");
const pkg = require('../package.json');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.BannerPlugin(`smartTable v${pkg.version} | (c) pengyajun 2020 | Released under the MIT License.`)
  ],
  output: {
    filename: 'smartTable.min.js',
    path: path.resolve(__dirname, '../dist')
  },
});