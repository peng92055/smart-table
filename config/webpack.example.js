const path = require('path');
const merge = require('webpack-merge');
const webpack = require("webpack");
const pkg = require('../package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
  devtool: 'cheap-module-source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.BannerPlugin(`smartTable v${pkg.version} | (c) pengyajun 2020 | Released under the MIT License.`),
    new CopyWebpackPlugin([{
      from: "examples/assets",
      to: "assets"
    }]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../examples/index.html'),
      inject: 'head'
    })
  ],
  output: {
    filename: 'smartTable.min.js',
    path: path.resolve(__dirname, '../docs')
  },
});