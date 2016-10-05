var gulp = require('gulp');

var jshint = require('gulp-jshint');
var babel = require('gulp-babel');
var nodemon = require('gulp-nodemon');

//main task
gulp.task('script', function() {
    return gulp.src('public/javascripts/*.js')
        .pipe(babel())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist/javascripts'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('public/javascripts/*.js', ['script']);
});

//run the server
gulp.task('start', function() {
    nodemon()
});

// Default Task
gulp.task('default', ['start', 'script', 'watch']);
