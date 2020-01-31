const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../examples/index.html'),
      inject: 'head'
    })
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './examples'
  }
});