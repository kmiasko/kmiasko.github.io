var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var pprint = require('gulp-print');
var modernizr = require('gulp-modernizr');
var jade = require('gulp-jade');

gulp.task('serve', ['sass', 'jade'], function () {
  'use strict';
  browserSync.init({
    server: './',
  });
  gulp.watch('./**/*.sass', ['sass']);
  gulp.watch('./*.jade', ['jade']);
  gulp.watch(['./index.html', 'js/main.js']).on('change', browserSync.reload);
});

gulp.task('sass', function () {
  'use strict';
  return gulp
    .src('./css/main.sass')
    .pipe(pprint())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

gulp.task('js', function () {
  'use strict';
  return gulp
    .src(['./css/*.css', './js/main.js'])
    .pipe(modernizr())
    .pipe(gulp.dest('./js'));
});

gulp.task('jade', function () {
  'use strict';
  return gulp
  .src(['./*.jade'])
  .pipe(jade({
    pretty: true,
  }))
  .pipe(gulp.dest('./'));
});
