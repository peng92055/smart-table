const path = require('path');
const merge = require('webpack-merge');
const webpack = require("webpack");
const pkg = require('../package.json');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/, //排除掉node_module目录
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.BannerPlugin(`smartTable v${pkg.version} | (c) pengyajun 2020 | Released under the MIT License.`)
  ],
  output: {
    filename: 'smartTable.min.js',
    path: path.resolve(__dirname, '../dist')
  },
});