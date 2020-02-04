module.exports = {
  entry: './src/index.js',
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
        {
          loader: 'sass-loader',
          options: {
            sourceMap: false
          }
        }
      ]
    }]
  }
}