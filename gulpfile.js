//
// Gulpfile
//
var path = require('path');
var gulp = require('gulp');
var environments = require('gulp-environments');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mq4HoverShim = require('mq4-hover-shim');
var rimraf = require('rimraf').sync;
var cache = require('gulp-cached');
var webpack = require('webpack');
var panini = require('panini');
var validator = require('gulp-html');
var bootlint  = require('gulp-bootlint');
var browser = require('browser-sync');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

ExtractTextPlugin = require("extract-text-webpack-plugin");
ExtractCSS = new ExtractTextPlugin("../css/[name].css");

var development = environments.development;
var production = environments.production;
var port = process.env.SERVER_PORT || 4444;

// Starts a BrowerSync instance
gulp.task('server', ['build'], function(){
  browser.init({server: './_site', port: port});
});

// Watch files for changes
gulp.task('watch', function() {
  gulp.watch('scss/**/*', ['compile-sass', browser.reload]);
  gulp.watch('html/pages/**/*', ['compile-html']);
  gulp.watch(['html/{layouts,includes,helpers,data}/**/*'], ['compile-html:reset','compile-html']);
});

// Erases the dist folder
gulp.task('clean', function() {
  rimraf('_site');
});

gulp.task('compile-html', function(cb) {
  gulp.src('html/pages/**/*.html')
    .pipe(panini({
      root: 'html/pages/',
      layouts: 'html/layouts/',
      partials: 'html/includes/',
      helpers: 'html/helpers/',
      data: development() ? 'html/data/development' : 'html/data/production'
     }))
    .pipe(gulp.dest('_site'));
    //.on('finish', browser.reload);
    cb();
});

gulp.task('compile-html:reset', function(done) {
  panini.refresh();
  done();
});

gulp.task('validate-html',['compile-html'], function() {
  gulp.src('_site/**/*.html')
    .pipe(validator())
    .pipe(bootlint());
});

gulp.task('images', function() {
  return gulp.src('images/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [
        {remiveViewBox: false},
        {cleanupIDs: false}
      ],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('_site/images'))
});


gulp.task('webpack', function(callback) {

  var webpackPlugins = [
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
  ];

  if (production) {
    webpackPlugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
  }

  var webpackConfig = {
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
      path: path.join(__dirname, '_site/js'),
      filename: '[name].js'
    },

    plugins: webpackPlugins,

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
          test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
          use: 'url-loader?limit=100000'
        }
      ]
    }
  }

  webpack(webpackConfig, function(err, stats) {
    if (err) {
      return callback(err);
    }

    callback();
  });

});

gulp.task('set-development', development.task);
gulp.task('set-production', production.task);
gulp.task('test',['scss-lint','validate-html']);
gulp.task('build', ['clean', 'webpack', 'compile-html', 'images']);
gulp.task('default', ['set-development', 'server', 'watch']);
gulp.task('deploy', ['set-production', 'server', 'watch']);
