let webpack = require('webpack');
var WebpackStripLoader = require('strip-loader')
var devConfig = require('./webpack.config.js')
var stripLoader = {
  test: [/\.js$/, /\.es6$/],
  exclude: /node_modules/,
  loader: WebpackStripLoader.loader('console.log')
}
devConfig.output.filename = "dist/[name]/bundle.min.js";
devConfig.module.loaders.push(stripLoader)
devConfig.plugins = [
  new webpack.optimize.DedupePlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"production"'
  }),
  new webpack.optimize.UglifyJsPlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.AggressiveMergingPlugin(),
  new webpack.NoErrorsPlugin()
]
module.exports = devConfig
