'use strict';

/*global require*/

const webpack = require('webpack');
const commonChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const glob = require('glob');
const path = require('path');

module.exports = function(devMode, project) {
  var config = {

    context: path.resolve(__dirname, "..", "projects", ".", project),

    entry: {
      vendorJS: ['jquery', 'jquery.easing', 'tether', 'bootstrap', 'scrollreveal'],
      siteJS: './source/scripts/site.js',
      contactJS: './source/scripts/contact_me.js',
      validateJS: './source/scripts/jqBootstrapValidation.js',
    },

    output: {
      filename: 'js/[name].js',
      path: path.join(__dirname, "..", "projects", ".", project),
      publicPath: "/"
    },

    plugins: [
      new webpack.ProvidePlugin({
        '$': 'jquery',
        'jQuery': 'jquery',
        "window.jQuery": "jquery",
        Tether: "tether",
        "window.Tether": "tether",
        ScrollReveal: "scrollreveal",
        "window.sr": "scrollreveal"
      }),

      new ExtractTextPlugin('css/siteCSS.css'),

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
                  modules: false,
                  localIdentName: '[name]__[local]___[hash:base64:5]',
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
                    require('postcss-flexbugs-fixes')(),
                    //require('cssnano')()
                  ],
                  config: {
                    path: './postcss.config.js',
                    ctx: {
                      'cssnext': {},
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
          include: /img/,
          exclude: /node_modules/,
          use: ['file-loader?name=img/[hash].[ext]', {
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
          test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          exclude: /img/,
          use: 'file-loader?name=fonts/[name].[ext]'
        },
        {
          test: /\.html$/i,
          include: path.resolve(__dirname, "..", 'projects', project, 'source', 'html'),
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
  if (!devMode) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }));
    config.output.publicPath = '/naturapraxis/';
  }
  return config;
}
