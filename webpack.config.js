const webpack = require('webpack')
path = require('path'),
ExtractTextPlugin = require("extract-text-webpack-plugin"),
ExtractCSS = new ExtractTextPlugin("../css/[name].css"),

module.exports = {
  entry: {
    vendor: [
      'script-loader!jquery/dist/jquery.js',
      'script-loader!jquery.easing/jquery.easing.js',
      'script-loader!tether/dist/js/tether.js',
      'script-loader!bootstrap/dist/js/bootstrap.js'
    ],
    site: './scss/app.scss',
    bootstrapCSS: [
      'script-loader!bootstrap/scss/bootstrap.scss'
    ],
    faCSS: [
      'script-loader!font-awesome/scss/font-awesome.scss'
    ],
  },

  output: {
    path: path.join(__dirname, '_webpack_site/js'),
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.scss/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          loader: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 3,
                sourceMap: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: false,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
              },
            },
          ],
        }),
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader?limit=100000'
      }
    ]
  },

  plugins: [

    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery'
    }),

    ExtractCSS,

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),

    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']
    }),

  ]
};
