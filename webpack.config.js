module.exports = {
  entry: './src/sketch.js',
  output: {
    path: './',
    file: 'bundle.js'
  },

  devServer: {
    inline: true,
    port: 3333
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',

        query: {
          presets: ['es2015'] 
        }
      }
    ] 
  }
}
