/**
 * Created by Jay on 2017/11/30.
 */
//Include required modules
var gulp = require("gulp"),
    babelify = require('babelify'),
    browserify = require("browserify"),
    connect = require("gulp-connect"),
    source = require("vinyl-source-stream"),
    seq = require("run-sequence"),
    es = require('event-stream'),
    glob = require("glob"),
    rename = require("gulp-rename");

var SRC_PATH = './client/src';
var SRC_RES_PATH = `${SRC_PATH}/res`;
var SRC_ENTRY_PATH = `${SRC_RES_PATH}/js/views`;
var DIST_PATH = './client/dist';
var DIST_RES_PATH = `${DIST_PATH}/res`;
var DIST_ENTRY_PATH = `${DIST_RES_PATH}/js/views`;

//Copy static files from html folder to build folder
gulp.task('base', function(){
    return browserify({ entries: [`js/base.js`], basedir:SRC_RES_PATH })
        .transform(babelify.configure({
            presets: [ 'es2015', 'stage-0' ]
        }))
        .bundle()
        .pipe(source(`js/base.js`))
        .pipe(gulp.dest(DIST_RES_PATH));
});

//Convert ES6 ode in all js files in src/js folder and copy to
//build folder as bundle.js
gulp.task("react", function(done){
    glob(`${SRC_ENTRY_PATH}/**/*.js`, function(err, files) {
        if(err) done(err);

        var tasks = files.map(function(entry) {
            entry = entry.replace(SRC_ENTRY_PATH, '.');
            return browserify({ entries: [entry], basedir:SRC_ENTRY_PATH })
                .transform(babelify.configure({
                    presets: [ 'es2015', 'react' ]
                }))
                .bundle()
                .pipe(source(entry))
                .pipe(rename({
                    extname: '.bundle.js'
                }))
                .pipe(gulp.dest(DIST_ENTRY_PATH));
        });
        es.merge(tasks).on('end', done);
    });
});

gulp.task('default', function(done) {
    seq('base', 'react', done);
});