const path = require('path');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const cesiumSource = 'Source/Cesium';

module.exports = {
  mode: 'development',
  amd: {
    // Enable webpack-friendly use of require in Cesium
    toUrlUndefined: true,
  },
  context: __dirname,
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
  },
  entry: {
    app: './Source/App.js',
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    }, {
      test: /\.(png|gif|jpg|jpeg|svg|xml|json|woff(2)?|ttf|eot|cur)$/,
      use: ['url-loader'],
    }],
  },
  node: {
    // Resolve node module use of fs
    fs: 'empty',
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),

    // Needed to compile multiline strings in Cesium
    sourcePrefix: '',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Workers'), to: 'Workers' }]),
    new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'Assets' }]),
    new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }]),
    new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }]),
    new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty/Workers'), to: 'ThirdParty/Workers' }]),
    new webpack.DefinePlugin({
      // Define relative base path in cesium for loading assets
      CESIUM_BASE_URL: JSON.stringify(''),
    }),
  ],
  resolve: {
    alias: {
      Cesium: path.resolve(__dirname, cesiumSource),
    },
  },
};
