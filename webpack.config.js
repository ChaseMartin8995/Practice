var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
    context: path.join(__dirname, "public"),
    devtool: debug ? "inline-sourcemap" : false,
    entry: "./src/scripts.js",
    module: {
       
    },
    output: {
        path: __dirname + "/",
        filename: "scripts.js"
    },
    plugins: debug ? [] : [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    ],
};