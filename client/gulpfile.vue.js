/**
 * Created by Jay on 2017/11/30.
 */
//Include required modules
var gulp = require("gulp"),
    babelify = require('babelify'),
    browserify = require("browserify"),
    connect = require("gulp-connect"),
    source = require("vinyl-source-stream"),
    buffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    seq = require("run-sequence").use(gulp),
    watch = require('gulp-watch'),
    rename = require("gulp-rename"),
    inject = require('gulp-inject-string'),
    minify = require('gulp-minifier'),
    replace = require('gulp-replace'),
    mkdirp = require('mkdirp-sync'),
    fs = require('fs'),
    path = require('path');

var SRC_PATH = './src';
var SRC_RES_PATH = `${SRC_PATH}/res`;
var SRC_VIEW_PATH = `${SRC_PATH}/views`;
var SRC_ENTRY_PATH = `${SRC_RES_PATH}/js/app`;
var DIST_PATH = './dist';
var DIST_RES_PATH = `${DIST_PATH}/res`;
var DIST_VIEW_PATH = `${DIST_PATH}/views`;
var DIST_ENTRY_PATH = `${DIST_RES_PATH}/js/app`;

const vendors = ['react', 'react-dom', 'easy-react'];
let components = [];

var fetchFilename = function (str) {
    return str.split('\\').pop().split('/').pop();
}

gulp.task('build-vendor', function() {
    const bundle = browserify();

    // require all libs specified in vendors array
    vendors.forEach(lib => {
        bundle.require(lib);
    });

    return bundle.bundle()
        .pipe(source('vendor.js'))
        .pipe(buffer())
        // .pipe(minify({
        //     minify: true,
        //     collapseWhitespace: true,
        //     conservativeCollapse: true,
        //     minifyJS: true
        // }))
        .pipe(gulp.dest(`${DIST_RES_PATH}/js`));
})

function buildJS(entry) {
    var stream;
    if (entry.indexOf('base.js') > 0) {
        entry = entry.replace(path.join(__dirname, SRC_PATH), '.');
        stream = browserify({ entries: [entry], basedir:SRC_PATH })
            .transform(babelify.configure({
                presets: [ 'es2015', 'stage-0' ]
            }))
            .bundle()
            .pipe(source(entry))
            .pipe(gulp.dest(DIST_PATH));
    } else {
        stream = gulp.src(entry, { base:SRC_PATH }).pipe(gulp.dest(`${DIST_PATH}`));
    }
    return stream;
}

function buildCSS(entry, target) {
    var stream = gulp.src(entry, { base:SRC_PATH });
    stream.pipe(gulp.dest(`${DIST_PATH}`));
    return stream;
}

function buildHtml(entry, target) {
    var stream = gulp.src(entry, { base:SRC_PATH });
    var html = target.contents.toString();
    if (html.indexOf('template/vue_base_page.html') > 0) {
        var startTime = Date.now();
        var filename = fetchFilename(entry);
        filename = filename.replace('.html', '');
        var HEAD = '<script lang="vue">';
        var END = '</script>';
        var headIndex = html.indexOf(HEAD);
        var endIndex = html.indexOf(END);
        var code = html.substring(headIndex + HEAD.length, endIndex);
        var codeOutput = path.join(DIST_ENTRY_PATH, entry.replace(path.join(__dirname, SRC_VIEW_PATH), ''));
        codeOutput = path.join(__dirname, codeOutput).replace('.html', '.vue.js');
        mkdirp(path.dirname(codeOutput));
        fs.writeFileSync(codeOutput, code, 'utf8');
        console.log('vue generated: ', codeOutput.replace(__dirname, '').substring(1), `[${Date.now() - startTime}ms]`);
        var BUNDLE_INJECT = `\r\n\{% block vue_dependency %}\r\n\{{ super() }}\r\n\<vue src="{{setting.RES_CDN_DOMAIN}}/js/app/${filename}.vue.js" />\r\n\{% endblock %}`;

        var codeBlock = html.substring(headIndex, endIndex + END.length);
        stream = stream.pipe(replace(codeBlock, BUNDLE_INJECT));
    }
    stream.pipe(gulp.dest(`${DIST_PATH}`));
    return stream;
}

gulp.task('build', function () {

    var fileChanged = function(entry, stream, startTime) {
        stream && stream.on('end', function () {
            entry = entry.replace(path.join(__dirname, SRC_PATH), '').substr(1);
            console.log('file changed: ', entry, `[${Date.now() - startTime}ms]`);
        });
    }

    // update components
    // watch([
    //     `${SRC_ENTRY_PATH}/components/**/*`
    // ], { ignoreInitial:false }, function() {
    //     updateComponents(function () {
    //         console.log('components\' list is updated.');
    //     });
    // });

    // build js
    watch([
        `${SRC_RES_PATH}/js/**/*.js`, `!${SRC_ENTRY_PATH}/**/*.js`, `!${SRC_ENTRY_PATH}/components/**/*.js`
    ], { ignoreInitial:false }, function(target) {
        var entry = target.path;
        var startTime = Date.now();

        var stream = buildJS(entry);
        fileChanged(entry, stream, startTime);
    });
    //build css
    watch([
        `${SRC_RES_PATH}/**/*.css`
    ], { ignoreInitial:false }, function(target) {
        var entry = target.path;
        var startTime = Date.now();

        var stream = buildCSS(entry, target);
        fileChanged(entry, stream, startTime);
    });
    //build html
    watch([
        `${SRC_VIEW_PATH}/**/*.html`
    ], { ignoreInitial:false }, function(target) {
        var entry = target.path;
        var startTime = Date.now();

        var stream = buildHtml(entry, target);
        fileChanged(entry, stream, startTime);
    });
});

gulp.task('default', function(done) {
    seq('build', done);
});