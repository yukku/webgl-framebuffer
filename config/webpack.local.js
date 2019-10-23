const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const DIST_DIR = "../public";

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, DIST_DIR)
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.join(__dirname, DIST_DIR),
    compress: true,
    host: "0.0.0.0",
    port: 4000
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(glsl|vert|frag)$/,
        loader: "shader-loader"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "WebGL Framebuffer"
    })
  ]
};
