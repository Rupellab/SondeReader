/*jslint indent: 4, maxlen: 100 */
/*global require */

(function () {
    'use strict';

    var gulp = require('gulp'),
        connect = require('gulp-connect');

    gulp.task('connect', function () {
        connect.server({
            livereload: true
        });
    });

    gulp.task('reload', function () {
        gulp.src('./**/*.html')
            .pipe(connect.reload());
    });

    gulp.task('watch', function () {
        gulp.watch(['./**/*.html', './style/*.css', './js/*.js'], ['reload']);
    });

    gulp.task('default', ['connect', 'watch']);
}());
