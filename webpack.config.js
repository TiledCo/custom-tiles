const tiles = require('./tiles.json').tiles

const entries = {}
tiles.forEach(tile => {
  entries[tile.id] = './src/' + tile.id + '.js'
})

module.exports = {
  entry: entries,
  output: {
    filename: "dist/[name]/bundle.js",
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ],
    loaders: [
      {
        test: [/\.js$/, /\.es6$/],
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolve: {
   extensions: ['', '.js', '.es6']
  },
  watch: true
}
