'use strict';

const webpack = require('webpack');

module.exports = {
    entry: "./src/cdn.js",
    output: {
        path: __dirname,
        filename: "cdn.min.bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    }
    // ,plugins: [
    //   new webpack.optimize.UglifyJsPlugin({
    //     minimize: true,
    //     mangle: {
    //       except: ['exports', 'require']
    //     },
    //     compress: {
    //       warnings: false
    //     }
    //   })
    // ]
};
