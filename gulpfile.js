//
// Gulpfile
//
var bootlint  = require('gulp-bootlint');
var browser = require('browser-sync');
var environments = require('gulp-environments');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var panini = require('panini');
var path = require('path');
var pngquant = require('imagemin-pngquant');
var rimraf = require('rimraf');
var validator = require('gulp-html');
var webpack = require('webpack');

var development = environments.development;
var production = environments.production;
var port = process.env.SERVER_PORT || 4444;
var destination = 'docs';
var webpackConfig = require("./config/webpack.config.js");

// Starts a BrowerSync instance
gulp.task('server', ['build'], function(){
  browser.init({server: './docs', port: port});
});

// Watch files for changes
gulp.task('watch', function() {
  gulp.watch('scss/**/*', ['webpack', browser.reload]);
  gulp.watch('source/pages/**/*', ['compile-html']);
  gulp.watch(['source/{layouts,partials,helpers,data}/**/*'], ['compile-html:reset','compile-html']);
});

// Erases the dist folder
gulp.task('clean', function(cb) {
  rimraf(destination, cb);
});

gulp.task('compile-html', function(cb) {
  gulp.src('source/pages/**/*.html')
    .pipe(panini({
      root: 'source/pages',
      layouts: 'source/layouts',
      partials: 'source/partials',
      helpers: 'source/helpers',
      data: 'source/data'
      //data: development() ? 'source/data/development' : 'source/data/production'
     }))
    .pipe(gulp.dest(destination));
    //.on('finish', browser.reload);
    cb();
});

gulp.task('compile-html:reset', function(done) {
  panini.refresh();
  done();
});

gulp.task('validate-html',['compile-html'], function() {
  gulp.src('docs/**/*.html')
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
    .pipe(gulp.dest('docs/images'))
});


gulp.task('webpack', function(callback) {

//  if (production) {
//    webpackPlugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
//  }

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
gulp.task('clean',['clean']);
gulp.task('build', ['webpack', 'compile-html']);
//gulp.task('build', ['webpack', 'compile-html', 'images']);
gulp.task('default', ['set-development', 'server', 'watch']);
gulp.task('deploy', ['set-production', 'server', 'watch']);
