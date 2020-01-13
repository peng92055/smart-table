const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      inject: 'head'
    })
  ],
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            sourceMap: false
          }
        }
      ]
    }, ]
  },
  output: {
    filename: 'smartUtils.[chunkhash:8].js',
    path: path.resolve(__dirname, '../dist')
  },
}
