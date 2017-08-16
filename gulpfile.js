var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var pprint = require('gulp-print');
var gulpBabel = require('gulp-babel');
var gulpConcat = require('gulp-concat');
var gulpCSSO = require('gulp-csso');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');

gulp.task('serve', ['sass', 'js'], function serveFiles() {
  'use strict';
  gulp.watch('./_css/main.sass', ['sass']);
  gulp.watch('./_sass/**/*.sass', ['sass']);
  gulp.watch('./_js/*.js', ['js']);
});


gulp.task('sass', function compileSass() {
  return gulp
    .src('./_css/main.sass')
    .pipe(pprint())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(gulp.dest('./vendor'));
});

gulp.task('js', function compileJs() {
  return gulp
    .src(['./_js/*.js'])
    .pipe(pprint())
    .pipe(gulpBabel({ presets: ['env', 'stage-2'] }))
    .pipe(gulpConcat('all.js'))
    .pipe(gulp.dest('./vendor'));
});

gulp.task('optimize-js', function optimizeJs() {
  return gulp
    .src('./vendor/all.js')
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./vendor'));
});

gulp.task('optimize-css', function optimizeCss() {
  return gulp
    .src('./vendor/main.css')
    .pipe(rename('main.min.css'))
    .pipe(gulpCSSO())
    .pipe(gulp.dest('./vendor'));
});

gulp.task('build-js', function buildJs(cb) {
  return runSequence('js', 'optimize-js', cb);
});

gulp.task('build-css', function buildJs(cb) {
  return runSequence('sass', 'optimize-css', cb);
});

gulp.task('build', ['build-css', 'build-js']);
