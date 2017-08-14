var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var pprint = require('gulp-print');
var gulpBabel = require('gulp-babel');
var gulpConcat = require('gulp-concat');

gulp.task('serve', ['sass', 'js'], function serveFiles() {
  'use strict';
  gulp.watch('./_css/**/*.sass', ['sass']);
  gulp.watch('./_sass/**/*.sass', ['sass']);
  gulp.watch('./_js/**/*.js', ['js']);
});


gulp.task('sass', function compileSass() {
  'use strict';
  return gulp
    .src('./_css/main.sass')
    .pipe(pprint())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(gulp.dest('./vendor'));
});

gulp.task('js', function compileJs() {
  'use strict';
  return gulp
    .src(['./_js/**/*.js'])
    .pipe(pprint())
    .pipe(gulpBabel({ presets: ['env', 'stage-2'] }))
    .pipe(gulpConcat('all.js'))
    .pipe(gulp.dest('./vendor'));
});

gulp.task('build', ['sass', 'js']);
