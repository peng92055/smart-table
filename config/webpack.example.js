const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  plugins: [
    new CleanWebpackPlugin(),
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