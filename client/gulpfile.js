/**
 * Created by Jay on 2017/11/30.
 */
var gulp = require("gulp"),
    concat = require('gulp-concat'),
    seq = require("run-sequence").use(gulp),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
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

const preinit = ['nprogress.js'];
const vendors = ['jquery-3.1.1.min.js','jquery.cookie.js','moment.js','md5.js','vue.js', 'utils.js'];
var excludeJS = [`${SRC_RES_PATH}/js/vue.min.js`];
var excludeLess = [`${SRC_RES_PATH}/less/global.less`];
var lessDependencies = {};

var fetchFilename = function (str) {
    return str.split('\\').pop().split('/').pop();
}

gulp.task('build-perinit', function() {
    preinit.forEach(function(file, index) {
        preinit[index] = `${SRC_RES_PATH}/js/preinit/${file}`;
    });
    return gulp.src(preinit)
        .pipe(concat('preinit.js'))
        .pipe(gulp.dest(`${DIST_RES_PATH}/js`));
});

gulp.task('build-vendor', function() {
    vendors.forEach(function(file, index) {
        vendors[index] = `${SRC_RES_PATH}/js/vendor/${file}`;
    });
    return gulp.src(vendors)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(`${DIST_RES_PATH}/js`));
});

function buildJS(entry) {
    var stream = gulp.src(entry, { base:SRC_PATH }).pipe(gulp.dest(`${DIST_PATH}`));
    return stream;
}

function buildCSS(entry, target) {
    var stream = gulp.src(entry, { base:SRC_PATH });
    stream.pipe(gulp.dest(`${DIST_PATH}`));
    return stream;
}

function buildLess(entry, target, done) {
    var content = typeof target == "string" ? target : target.contents.toString();
    if (content.indexOf('@import') >= 0) {
        var imports = content.match(/@import\s+['"].+['"]/img);
        imports && imports.forEach(function(item) {
            item = item.match(/['"].+['"]/)[0];
            item = item.substring(1, item.length - 1);
            var importFullPath = path.join(__dirname, SRC_RES_PATH, 'less', item);
            if (!lessDependencies[importFullPath]) lessDependencies[importFullPath] = {};
            lessDependencies[importFullPath][entry] = 1;
        });
    }
    if (entry.indexOf('/include/') > 0 || entry.indexOf('\\include\\') > 0) {
        //variables changed
        //build all dependencies
        var total = 0, index = 0;
        for (var key in lessDependencies[entry]) {
            total ++;
            (function(lessFile) {
                var startTime = Date.now();
                var stream = buildMainLess(lessFile);
                stream && stream.on('end', function () {
                    lessFile = lessFile.replace(path.join(__dirname, SRC_PATH), '').substr(1);
                    console.log('file changed: ', lessFile, `[${Date.now() - startTime}ms]`);
                    index ++;
                    if (total >= index) {
                        //all done
                        done && done();
                    }
                });
            })(key);
        }
        return;
    }

    var stream = gulp.src(entry, { base:`${SRC_RES_PATH}/less` });
    stream.pipe(plumber())
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 50 versions', 'ie >= 9'],
            cascade: false
        }))
        .pipe(gulp.dest(`${DIST_RES_PATH}/css`));
    return stream;
}

function buildMainLess(entry) {
    var stream = gulp.src(entry, { base:`${SRC_RES_PATH}/less` });
    stream.pipe(plumber())
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 50 versions', 'ie >= 9'],
            cascade: false
        }))
        .pipe(gulp.dest(`${DIST_RES_PATH}/css`));
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
        var BUNDLE_INJECT = `\r\n\{% block vue_dependency %}\r\n\{{ super() }}\r\n\<vue src="{{setting.RES_CDN_DOMAIN}}/js/app/${filename}.vue.js"></vue>\r\n\{% endblock %}`;

        var codeBlock = html.substring(headIndex, endIndex + END.length);
        stream = stream.pipe(replace(codeBlock, BUNDLE_INJECT));
    }
    stream.pipe(gulp.dest(`${DIST_PATH}`));
    return stream;
}

gulp.task('build-less-dependency', function (done) {
    buildLessDependency();
});

gulp.task('build', function () {
    excludeJS = excludeJS.concat(preinit).concat(vendors);
    excludeJS.forEach(function(file, index) {
        excludeJS[index] = '!' + file;
    });
    excludeLess.forEach(function(file, index) {
        excludeLess[index] = '!' + file;
    });

    var fileChanged = function(entry, stream, startTime) {
        stream && stream.on('end', function () {
            entry = entry.replace(path.join(__dirname, SRC_PATH), '').substr(1);
            console.log('file changed: ', entry, `[${Date.now() - startTime}ms]`);
        });
    }

    // build js
    watch([
        `${SRC_RES_PATH}/js/**/*.js`,
        `!${SRC_RES_PATH}/js/preinit/**/*.js`,
        `!${SRC_RES_PATH}/js/vendor/**/*.js`,
        `!${SRC_ENTRY_PATH}/**/*.js`
    ].concat(excludeJS), { ignoreInitial:false }, function(target) {
        var entry = target.path;
        var startTime = Date.now();

        var stream = buildJS(entry);
        fileChanged(entry, stream, startTime);
    });
    //build css
    watch([
        `${SRC_RES_PATH}/css/**/*.css`
    ], { ignoreInitial:false }, function(target) {
        var entry = target.path;
        var startTime = Date.now();

        var stream = buildCSS(entry, target);
        fileChanged(entry, stream, startTime);
    });
    //build less
    watch([
        `${SRC_RES_PATH}/less/**/*.less`//, `!${SRC_RES_PATH}/less/include/**/*.less`
    ], { ignoreInitial:false }, function(target) {
        var entry = target.path;
        var startTime = Date.now();

        var stream = buildLess(entry, target);
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
    seq('build-perinit', 'build-vendor', 'build', done);
});