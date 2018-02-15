const gulp = require('gulp');

const jshint = require('gulp-jshint');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const watch = require('gulp-watch');
const parcel = require('gulp-parcel');

//main task
// used for older scripts, we are migrating to the next one
gulp.task('script', function() {
  return gulp
    .src('public/javascripts/**/*.js')
    .pipe(babel())
    .on('error', onError)
    .pipe(gulp.dest('dist/javascripts'));
});

// using parcel to package our javascript
gulp.task('build', function() {
  return gulp
    .src('public/javascripts/index.js', { read: false })
    .pipe(parcel())
    .on('error', onError)
    .pipe(gulp.dest('dist/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('public/javascripts/**/*.js', ['script', 'build']);
});

// run the server
gulp.task('start', function() {
  nodemon({
    ignore: ['public/', 'views/', 'dist/']
  });
});

function onError(err) {
  console.log(err);
  this.emit('end');
}

gulp.task('lint', function() {
  return gulp
    .src('public/javascripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Default Task
gulp.task('default', ['start', 'script', 'watch']);
