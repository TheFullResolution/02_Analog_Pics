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
        pngquant = require('imagemin-pngquant');
;

var resizeImages = function (options) {
    gulp.src('img/full_size/**.{jpg,JPG}')
        .pipe(changed('img/gallery'))
        .pipe(imageResize({width: options.width}))
        .pipe(imagemin({
                progressive: true,
                interlaced: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }))
        .pipe(rename(function (path) {
                path.basename += options.fileSuffix;
                path.extname = ".jpg";
                return path;
            }))
        .pipe(gulp.dest('img/gallery'));
};

gulp.task('resize-images', function () {
    var small = {
        width: 640,
        fileSuffix: '_small'
    };
    var medium = {
        width: 820,
        fileSuffix: '_mid'
    };
    var zoom = {
        width: 1290,
        fileSuffix: '_zoom'
    };
    resizeImages(small);
    resizeImages(medium);
    resizeImages(zoom);
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
