'use strict';

/*global require*/

var webpack = require('webpack');
var commonChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ExtractCSS = new ExtractTextPlugin("css/[name].css");
var glob = require('glob');
var path = require('path');

module.exports = function(devMode) {
  var config = {

    context: path.resolve(__dirname, "..", "www"),

    entry: {
      vendorJS: ['jquery', 'jquery.easing', 'tether', 'bootstrap'],
      siteJS: '../source/scripts/site.js',
      bootstrapCSS: [
        'script-loader!bootstrap/scss/bootstrap.scss'
      ],
      faCSS: [
        'script-loader!font-awesome/scss/font-awesome.scss'
      ],
      siteCSS: '../source/scss/site.scss',
      //siteHTML: '../source/html/index.html'
    },

    output: {
      filename: 'js/[name].js',
      path: path.join(__dirname, "..", "www/"),
      publicPath: "/"
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
        'process.env': {
          'NODE_ENV': devMode ? '"development"' : '"production"'
        }
      }),

      new commonChunkPlugin({
        name: 'vendorJS',
        filename: 'js/commons.chunk.js'
      }),
    ],

    devtool: devMode ? 'cheap-inline-source-map' : 'source-map',

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [ 
                [ 'es2015', { modules: false } ] 
              ]
            }
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
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                  plugins: (loader) => [
                    require('postcss-import')({ root: loader.resourcePath }),
                    //require('postcss-cssnext')(),
                    require('autoprefixer')(),
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
                  sourceMap: true,
                },
              },
            ],
          }),
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          include: /images/,
          exclude: /node_modules/,
          use: ['file-loader?name=images/[hash].[ext]', {
            loader: 'image-webpack-loader',
            query: {
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              },
              pngquant: {
                quality: '65-90',
                speed: 4,
              },
            },
          }],
        },
        {
          test: /\.(woff|woff2|eot|ttf|svg)$/i,
          exclude: /images/,
          use: 'url-loader?limit=100000&name=fonts/[name].[ext]'
        },
        {
          test: /\.html$/i,
          include: path.resolve(__dirname, '..', 'source', 'html'),
          use: [
            {
              loader: "file-loader",
              options: {
                 name: "[name].[ext]",
              },
            },
            {
              loader: "extract-loader",
            },
            {
              loader: "html-loader",
              options: {
                minimize: false,
                removeComments: false,
                collapseWhitespace: false,
              },
            },
          ],
        }
      ]
    }
  }
  return config;
}
