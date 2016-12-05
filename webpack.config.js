'use strict';

const webpack = require('webpack');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname,
    filename: "finalform.min.js",
    library: 'finalform',
    libraryTarget: 'umd'
  },
  module: {
      loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
      ]
  }
  ,plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      mangle: {
        except: ['exports', 'require']
      },
      compress: {
        warnings: false
      }
    })
  ]
};
