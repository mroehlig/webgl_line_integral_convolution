const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      inject: "body",
      favicon: "./src/assets/favicon.ico",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "./src/assets/data/*.*",
          to: "assets/data/[name][ext]",
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(fs|vs|frag|vert|glsl)$/,
        type: "asset/source",
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    watchFiles: ["src/**/*"],
    liveReload: true,
    hot: true,
    port: 8080,
  },
};
