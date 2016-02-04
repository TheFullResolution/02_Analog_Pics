/* global UNKNOWN */

"use strict";
var gulp = require('gulp'),
        concat = require('gulp-concat'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        maps = require('gulp-sourcemaps'),
        cssnano = require('gulp-cssnano'),
        htmlreplace = require('gulp-html-replace'),
        del = require('del'),
        imageResize = require('gulp-image-resize'),
        imagemin = require('gulp-imagemin'),
        changed = require('gulp-changed'),
        pngquant = require('imagemin-pngquant'),
        chmod = require('gulp-chmod'),
        sizeOf = require('image-size'),
        fs = require('fs');


var resizeImages = function (options) {
    gulp.src('img/gallery/full_size/**.{jpg,JPG}')
            .pipe(changed('img/gallery/' + options.folder))
            .pipe(imageResize({width: options.width}))
            .pipe(imagemin({
                progressive: true,
                interlaced: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }))
            .pipe(rename(function (path) {
                path.dirname += options.folder;
                path.extname = ".jpg";
                return path;
            }))
            .pipe(gulp.dest('img/gallery'));
};

gulp.task("jpg", function () {

    var files = fs.readdirSync('img/gallery/full_size/'), index = 1, prename = '';

    // here we will find maximum number of index
    // keep in mind that this is very inefficient.
    files.forEach(function (currentFile) {
        var currentIndex = (/^([0-9]+)\.jpg$/i.exec(currentFile) || [, false])[1];
        if (currentIndex && parseInt(currentIndex) >= index) {
            index = ++currentIndex;
        }
    });

    var name = function() {
                    if (index < 10) {
                        prename = '000';
                    } else if (index < 100 && index >= 10) {
                        prename = '00';
                    } else if (index >= 100) {
                        prename = '0';
                    }
                    
                    
                    return prename + index++;
                };

    return gulp.src('img/new/**.{jpg,JPG}')
            .pipe(chmod(666))
            .pipe(rename(function (path) {
                path.basename = name();
                path.dirname += "/full_size";
                path.extname = ".jpg";
                return path;
            }))
            .pipe(gulp.dest('img/gallery'));
});


gulp.task('resize', ["jpg"], function () {


    var small = {
        width: 640,
        folder: '/small'
    };
    var medium = {
        width: 820,
        folder: '/mid'
    };
    var zoom = {
        width: 1290,
        folder: '/zoom'
    };

    resizeImages(small);
    resizeImages(medium);
    resizeImages(zoom);
});

gulp.task('images', ['resize'], function () {
    del('img/new/**/*');
});


gulp.task("json", function () {
    gulp.src('img/gallery/**')
            .pipe(require('gulp-filelist')('filelist.json'))
            .pipe(gulp.dest('img'));
});




gulp.task("concatScripts", function () {
    return gulp.src([
        'js/jquery-2.1.4.min.js',
        'js/vue.min.js',
        'js/app.js'
    ])
            .pipe(maps.init())
            .pipe(concat('app.concat.js'))
            .pipe(maps.write('./'))
            .pipe(gulp.dest('js'));
});
gulp.task("minifyScripts", ["concatScripts"], function () {
    return gulp.src("js/app.concat.js")
            .pipe(uglify())
            .pipe(rename('app.min.js'))
            .pipe(gulp.dest('js'));
});
gulp.task("concatCSS", function () {
    return gulp.src([
        'css/normalize.css',
        'css/main.css'
    ])
            .pipe(maps.init())
            .pipe(concat('app.concat.css'))
            .pipe(maps.write('./'))
            .pipe(gulp.dest('css'));
});
gulp.task("minifyCSS", ["concatCSS"], function () {
    return gulp.src("css/app.concat.css")
            .pipe(cssnano({compatibility: 'ie8'}))
            .pipe(rename('app.min.css'))
            .pipe(gulp.dest('css'));
});
gulp.task("build", ['minifyScripts', 'minifyCSS'], function () {
    return gulp.src(["css/app.min.css", "js/app.min.js", "js/projects.json",
        "img/**", "fonts/**", "favicon.ico"], {base: './'})
            .pipe(gulp.dest('dist'));
});
gulp.task('replace', function () {
    gulp.src('index.html')
            .pipe(htmlreplace({
                'css': 'css/app.min.css',
                'js': 'js/app.min.js'
            }))
            .pipe(gulp.dest('dist'));
});
gulp.task('clean', ['replace'], function () {
    del(['css/app.*.css*', 'js/app.*.js*']);
});
gulp.task("default", ['build'], function () {
    gulp.start('clean');
});
