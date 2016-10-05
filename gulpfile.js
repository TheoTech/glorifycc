var gulp = require('gulp')

var jshint = require('gulp-jshint')
var babel = require('gulp-babel');

gulp.task('lint', function() {
    return gulp.src('public/javascripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
})

gulp.task('babel', function () {
    return gulp.src('public/javascripts/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/javascripts'));
});

// gulp.task('scripts', function() {
//     return gulp.src('public/javascripts/*.js')
//         .pipe(concat('all.js'))
//         .pipe(babel())
//         .pipe(gulp.dest('dist/js'))
//         .pipe(rename('all.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest('dist/js'));
// });



// Default Task
gulp.task('default', ['lint', 'babel']);
