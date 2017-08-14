var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var pprint = require('gulp-print');
var gulpBabel = require('gulp-babel');
var gulpConcat = require('gulp-concat');

gulp.task('serve', ['sass', 'js'], function serveFiles() {
  'use strict';
  gulp.watch('./css/*.sass', ['sass']);
  gulp.watch('./_sass/*.sass', ['sass']);
  gulp.watch('./js/*.js', ['js']);
});


gulp.task('sass', function compileSass() {
  'use strict';
  return gulp
    .src('./css/main.sass')
    .pipe(pprint())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(gulp.dest('./_site/vendor'));
});

gulp.task('js', function compileJs() {
  'use strict';
  return gulp
    .src(['./js/*.js'])
    .pipe(pprint())
    .pipe(gulpBabel({ presets: ['env', 'stage-2'] }))
    .pipe(gulpConcat('all.js'))
    .pipe(gulp.dest('./_site/vendor'));
});

gulp.task('build', ['sass', 'js']);
