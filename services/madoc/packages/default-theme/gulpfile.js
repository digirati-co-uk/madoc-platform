'use strict';

var gulp = require('gulp');

gulp.task('css', function () {
    var sass = require('gulp-sass');
    var postcss = require('gulp-postcss');
    var autoprefixer = require('autoprefixer');

    return gulp.src('./asset/sass/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['../../node_modules/susy/sass']
        }).on('error', sass.logError))
        .pipe(postcss([
            autoprefixer({browsers: ['> 5%', '> 5% in US', 'last 2 versions']})
        ]))
        .pipe(gulp.dest('./asset/css'));
});

gulp.task('css:watch', function () {
    gulp.watch('./asset/sass/*.scss', gulp.parallel('css'));
});
