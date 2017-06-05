var webpack = require('webpack');
var commonChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var ExtractCSS = new ExtractTextPlugin("../css/[name].css");
var glob = require('glob');

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
    siteHTML: glob.sync("./html/*.html")
  },

  output: {
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

    new commonChunkPlugin({
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
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
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
                sourceMap: true,
              },
            },
          ],
        }),
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        exclude: /node_modules/,
        loaders: ['file-loader?name=../[path][name].[ext]', {
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
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader?limit=100000&name=../fonts/[name].[ext]'
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "file-loader",
            options: {
               name: "../[name].[ext]",
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
              collapseWhitespace: false
              //attrs: ["img:src", "link:href"],
              //interpolate: true,
            },
          },
        ],
      }
    ]
  }
}
