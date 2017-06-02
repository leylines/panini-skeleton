var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var ExtractCSS = new ExtractTextPlugin("../css/[name].css");

module.exports = {

  entry: {
    vendorJS: ['jquery', 'jquery.easing', 'tether', 'bootstrap'],
    siteJS: './scripts/site.js',
    bootstrapCSS: [
      'script-loader!bootstrap/scss/bootstrap.scss'
    ],
    faCSS: [
      'script-loader!font-awesome/scss/font-awesome.scss'
    ],
    siteCSS: './scss/site.scss',
  },

  output: {
    path: path.join(__dirname, '../docs/js'),
    filename: '[name].js'
  },

  plugins: [
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      "window.jQuery": "jquery",
      Tether: "tether",
      "window.Tether": "tether"
    }),

    ExtractCSS,

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendorJS',
      filename: 'commons.chunk.js'
    }),
  ],

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
                //modules: true,
                importLoaders: 3,
                sourceMap: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: false,
                plugins: (loader) => [
                  //require('postcss-import')({ root: loader.resourcePath }),
                  //require('postcss-cssnext')(),
                  //require('autoprefixer')(),
                  //require('cssnano')()
                ],
                config: {
                  path: './postcss.config.js',
                  ctx: {
                    //'cssnext': {},
                    'autoprefixer': {},
                    'cssnano': {},
                  }
                }
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
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: ['file-loader?name=../images/[name].[ext]', {
          loader: 'image-webpack-loader',
          query: {
            mozjpeg: {
              progressive: true,
            },
            gifsicle: {
              interlaced: false,
            },
            optipng: {
              optimizationLevel: 4,
            },
            pngquant: {
              quality: '75-90',
              speed: 3,
            },
          },
        }],
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        use: 'url-loader?limit=100000&name=../fonts/[name].[ext]'
      }
    ]
  }
}
