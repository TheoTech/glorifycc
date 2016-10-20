var gulp = require('gulp');

var jshint = require('gulp-jshint');
var babel = require('gulp-babel');
var nodemon = require('gulp-nodemon');
var watch = require('gulp-watch')

//main task
gulp.task('script', function() {
    return gulp.src('public/javascripts/*.js')
        .pipe(babel())
        .on('error', onError)
        .pipe(gulp.dest('dist/javascripts'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('public/javascripts/*.js', ['script']);
});

// run the server
gulp.task('start', function() {
    nodemon({
        ignore: ['public/', 'views/', 'dist/']
    });
});

function onError(err) {
    console.log(err)
    this.emit('end')
}

gulp.task('lint', function() {
    return gulp.src('public/javascripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Default Task
gulp.task('default', ['start', 'script', 'watch']);
