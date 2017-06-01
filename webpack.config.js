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
    site: './scss/site.scss',
//    bootstrapCSS: [
//      'script-loader!bootstrap/scss/bootstrap.scss'
//    ],
//    faCSS: [
//      'script-loader!font-awesome/scss/font-awesome.scss'
//    ],
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
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                plugins: (loader) => [
                  require('postcss-import')({ root: loader.resourcePath }),
                  require('postcss-cssnext')(),
                  require('cssnano')()
                ],
                config: {
                  path: './postcss.config.js',
                  ctx: {
                    'cssnext': {},
                    'cssnano': {},
                  }
                }
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
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

    new webpack.LoaderOptionsPlugin({
      debug: true
    }),

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
