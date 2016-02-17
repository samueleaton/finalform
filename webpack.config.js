module.exports = {
    entry: "./demo.js",
    output: {
        path: __dirname,
        filename: "demo-bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    }
};
