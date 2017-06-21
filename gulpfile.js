//
// Gulpfile
//
var bootlint  = require('gulp-bootlint');
var browser = require('browser-sync');
var environments = require('gulp-environments');
var gulp = require('gulp');
var gutil = require('gulp-util');
var panini = require('panini');
var path = require('path');
var rimraf = require('rimraf');
var validator = require('gulp-html');
var WebpackDevServer = require('webpack-dev-server');
var fs = require('fs');

var development = environments.development;
var production = environments.production;
var project = gutil.env.project || 'naturapraxis';
var port = process.env.SERVER_PORT || 4444;
var source = 'projects/' + project + '/source';
var destination = 'projects/' + project + '/source/html';
var config = JSON.parse(fs.readFileSync('projects/' + project + '/source/data/meta.json'));

gutil.log("Project is: " + project);
gutil.log("URL is: " + config.url);


// Starts a BrowerSync instance
gulp.task('server', ['build'], function(){
  browser.init({server: './projects/' + project, port: port});
});

// Watch files for changes
gulp.task('watch', function() {
  gulp.watch(source + '/img/**/*', ['webpack', browser.reload]);
  gulp.watch(source + '/scss/**/*', ['webpack', browser.reload]);
  gulp.watch(source + '/scripts/**/*', ['webpack', browser.reload]);
  gulp.watch(source + '/pages/**/*', ['compile-html', 'webpack']);
  gulp.watch([source + '/{layouts,partials,helpers,data}/**/*'], ['compile-html:reset', 'compile-html', 'webpack']);
});

// Erases the dist folder
gulp.task('clean', function(done) {
  rimraf(destination, done);
});

gulp.task('compile-html', function(done) {
  gulp.src(source + '/pages/**/*.html')
    .pipe(panini({
      root: source + '/pages',
      layouts: source + '/layouts',
      partials: source + '/partials',
      helpers: source + '/helpers',
      data: source + '/data'
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
  gulp.src(source + '/html/**/*.html')
    .pipe(validator())
});

gulp.task('webpack', function(done) {

  var runWebpack = require('./buildprocess/runWebpack.js');
  var webpack = require('webpack');
  var webpackConfig = production() ? require('./buildprocess/webpack.config.js')(false, project, config.url) : require('./buildprocess/webpack.config.js')(true, project, config.url);

  runWebpack(webpack, webpackConfig, done);
  
});

gulp.task('set-development', development.task);
gulp.task('set-production', production.task);
gulp.task('test',['validate-html']);
gulp.task('clean',['clean']);
gulp.task('build', ['compile-html', 'webpack']);
gulp.task('default', ['set-development', 'server', 'watch']);
gulp.task('deploy', ['set-production', 'build']);
