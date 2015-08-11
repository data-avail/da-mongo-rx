var gulp = require('gulp');
var ts = require('gulp-typescript');
var replace = require('gulp-replace'); 
var merge = require('merge2');
var mocha = require('gulp-spawn-mocha');
var concat = require('gulp-concat');

var tsProject = ts.createProject('tsconfig.json', { sortOutput: true });

var REF_REGEXP = /^\/\/\/\s*<reference\s+path=['"].*['"]\s*\/>\s*$/gm;

gulp.task('build', function() {
    
    var tsResult =  tsProject.src()
        .pipe(ts(tsProject));

    return merge([
        tsResult.js
        .pipe(replace(REF_REGEXP, ''))
        .pipe(concat('mongo-rx.js'))
        .pipe(gulp.dest('dist')),           
        tsResult.dts
        .pipe(replace(REF_REGEXP, ''))
        .pipe(concat('mongo-rx.d.ts'))
        .pipe(gulp.dest('dist'))
    ]);        
});

gulp.task('default', ['build'], function() {
  gulp.watch("src/**.ts", ['build']);
});


gulp.task('test',  function () {
    return gulp.src('test/**.js')
        .pipe(mocha());
});