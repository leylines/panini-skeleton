//
// Gulpfile
//
var bootlint  = require('gulp-bootlint');
var browser = require('browser-sync');
var environments = require('gulp-environments');
var gulp = require('gulp');
var panini = require('panini');
var path = require('path');
var rimraf = require('rimraf');
var validator = require('gulp-html');
var named = require('vinyl-named');

var development = environments.development;
var production = environments.production;
var port = process.env.SERVER_PORT || 4444;
var destination = 'source/html';

// Starts a BrowerSync instance
gulp.task('server', ['build'], function(){
  browser.init({server: './www', port: port});
});

// Watch files for changes
gulp.task('watch', function() {
  gulp.watch('images/**/*', ['webpack', browser.reload]);
  gulp.watch('scss/**/*', ['webpack', browser.reload]);
  gulp.watch('scripts/**/*', ['webpack', browser.reload]);
  gulp.watch('source/pages/**/*', ['compile-html', 'webpack']);
  gulp.watch(['source/{layouts,partials,helpers,data}/**/*'], ['compile-html:reset', 'compile-html', 'webpack']);
});

// Erases the dist folder
gulp.task('clean', function(done) {
  rimraf(destination, done);
});

gulp.task('compile-html', function(done) {
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
    done();
});

gulp.task('compile-html:reset', function(done) {
  panini.refresh();
  done();
});

gulp.task('validate-html',['compile-html'], function() {
  gulp.src('html/**/*.html')
    .pipe(validator())
});

gulp.task('webpack', function(done) {

//  if (production) {
//    webpackPlugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
//  }

    var runWebpack = require('./buildprocess/runWebpack.js');
    var webpack = require('webpack');
    var webpackConfig = production() ? require("./buildprocess/webpack.config.js")(false) : require("./buildprocess/webpack.config.js")(true);

    runWebpack(webpack, webpackConfig, done);
  
});

gulp.task('set-development', development.task);
gulp.task('set-production', production.task);
gulp.task('test',['validate-html']);
gulp.task('clean',['clean']);
gulp.task('build', ['compile-html', 'webpack']);
gulp.task('default', ['set-development', 'server', 'watch']);
gulp.task('deploy', ['set-production', 'server', 'watch']);
