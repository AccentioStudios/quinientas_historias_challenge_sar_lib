
const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'sarlib.min.js',
    library: 'SarLib',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    minimize: true,
    minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin()
    ]
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 100000,
    maxEntrypointSize: 100000,
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
                ['@babel/plugin-transform-modules-commonjs', {
                  allowTopLevelThis: true
                }]
              ]
          }
        }
      }
    ]
  },
  bail: true
};