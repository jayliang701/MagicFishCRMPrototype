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
    glob = require("glob"),
    watch = require('gulp-watch'),
    rename = require("gulp-rename"),
    inject = require('gulp-inject-string'),
    minify = require('gulp-minifier'),
    fs = require('fs'),
    path = require('path');

var SRC_PATH = './src';
var SRC_RES_PATH = `${SRC_PATH}/res`;
var SRC_VIEW_PATH = `${SRC_PATH}/views`;
var SRC_ENTRY_PATH = `${SRC_RES_PATH}/js/views`;
var DIST_PATH = './dist';
var DIST_RES_PATH = `${DIST_PATH}/res`;
var DIST_VIEW_PATH = `${DIST_PATH}/views`;
var DIST_ENTRY_PATH = `${DIST_RES_PATH}/js/views`;

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
});

function updateComponents(callBack) {
    fs.readdir(`${SRC_ENTRY_PATH}/components`, function (err, files) {
        files = files || [];
        components.length = 0;
        files.forEach(function (file) {
            file = `./components/${file.replace('.js', '')}`;
            components.push(file);
            //components.push({ require: file, expose: file });
        });
        callBack && callBack();
    });
};

function buildReact(entry, target) {
    entry = entry.replace(path.join(__dirname, SRC_PATH), '.');
    var stream = browserify({ entries: [entry], basedir:SRC_PATH });
    var comps = [].concat(components);
    if (entry.indexOf('/components/') >= 0 || entry.indexOf('\\components\\') >= 0) {
        var moduleName = entry.replace(/\\/img, '/').replace('res/js/views/', '').replace('.js', '');
        stream.require(entry, { expose:moduleName });
        comps.splice(comps.indexOf(moduleName), 1);
    }
    var ext = [].concat(vendors);
    ext = ext.concat(comps);
    stream.external(ext);

    return stream.transform(babelify.configure({
            presets: [ 'es2015', 'react' ]
        }))
        .bundle()
        .pipe(source(entry))
        // .pipe(rename({
        //     extname: '.bundle.js'
        // }))
        .pipe(gulp.dest(DIST_PATH));
}

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
    if (target.contents.toString().indexOf('template/react_base_page.html') > 0) {
        var filename = fetchFilename(entry);
        filename = filename.replace('.html', '');
        var BUNDLE_INJECT = `\r\n\{% block footer_import_script %}\r\n\{{ super() }}\r\n\<script type="text/javascript" src="{{setting.RES_CDN_DOMAIN}}/js/views/${filename}.js"></script>\r\n\{% endblock %}`;
        stream.pipe(inject.append('\r\n' + BUNDLE_INJECT))
    }
    stream.pipe(gulp.dest(`${DIST_PATH}`));
    return stream;
}

gulp.task('update-components', function (done) {
    updateComponents(function () {
        console.log('components\' list is updated.');
        done();
    });
});

gulp.task('build', function () {

    var fileChanged = function(entry, stream, startTime) {
        stream && stream.on('end', function () {
            entry = entry.replace(path.join(__dirname, SRC_PATH), '.');
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

    // build react
    watch([
        `${SRC_ENTRY_PATH}/**/*.js`
    ], { ignoreInitial:false }, function(target) {
        var entry = target.path;
        var startTime = Date.now();

        var stream = buildReact(entry);
        fileChanged(entry, stream, startTime);
    });
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
    seq('build-vendor', 'update-components', 'build', done);
});