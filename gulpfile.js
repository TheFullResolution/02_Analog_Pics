/*eslint-env node*/


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
    fs = require('fs'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    cssnext = require('postcss-cssnext'),
    browserSync = require('browser-sync').create();

var resizeImages = function(options) {
    return gulp.src('app/img/gallery/full_size/*.{jpg,JPG}')
        .pipe(changed('app/img/gallery/' + options.folder))
        .pipe(imageResize({
            width: options.width
        }))
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(rename(function(path) {
            path.dirname += options.folder;
            path.extname = '.jpg';
            return path;
        }))
        .pipe(gulp.dest('app/img/gallery'));
};

gulp.task('images1', function() {

    var files = fs.readdirSync('app/img/gallery/full_size/'),
        index = 1,
        prename = '';

    // here we will find maximum number of index
    // keep in mind that this is very inefficient.
    files.forEach(function(currentFile) {
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

    return gulp.src('NewImages/**.{jpg,JPG}')
        .pipe(chmod(666))
        .pipe(rename(function(path) {
            path.basename = name();
            path.dirname += '/full_size';
            path.extname = '.jpg';
            return path;
        }))
        .pipe(gulp.dest('app/img/gallery'));
});


gulp.task('images2', function() {


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

    return resizeImages(small),
        resizeImages(medium),
        resizeImages(zoom);
});

gulp.task('images3', function() {
    del('NewImages/**/*');
});


gulp.task('concatScripts', function() {
    return gulp.src([
            'app/js/libraries/hammer.min.js',
            'app/js/libraries/vue.min.js',
            'app/js/libraries/vue-router.min.js',
            'app/js/app.js'
        ])
        .pipe(maps.init())
        .pipe(concat('app.concat.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('app/js'));
});
gulp.task('minifyScripts', ['concatScripts'], function() {
    return gulp.src('app/js/app.concat.js')
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest('app/js'));
});
gulp.task('concatCSS', function() {
    return gulp.src([
            'app/css/normalize.css',
            'app/css/app.css'
        ])
        .pipe(maps.init())
        .pipe(concat('app.concat.css'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('app/css'));
});
gulp.task('minifyCSS', ['concatCSS'], function() {
    return gulp.src('app/css/app.concat.css')
        .pipe(cssnano({
            compatibility: 'ie11'
        }))
        .pipe(rename('app.min.css'))
        .pipe(gulp.dest('app/css'));
});
gulp.task('build', ['minifyScripts', 'minifyCSS'], function() {
    return gulp.src(['app/css/app.min.css', 'app/js/app.min.js', 'app/js/gallery.json',
            'app/js/libraries/lazysizes.min.js', 'app/img/gallery/**', 'app/img/**.{svg,gif,png,jpg}',
            'app/fonts/**', 'app/favicon.ico'
        ], {
            base: 'app'
        })
        .pipe(gulp.dest('dist'));
});
gulp.task('replace', function() {
    gulp.src('app/index.html')
        .pipe(htmlreplace({
            'css': 'css/app.min.css',
            'js': 'js/app.min.js'
        }))
        .pipe(gulp.dest('dist'));
});
gulp.task('clean', ['replace'], function() {
    del(['app/css/app.*.css*', 'app/js/app.*.js*']);
});
gulp.task('default', ['build'], function() {
    gulp.start('clean');
});
gulp.task('postcss', function() {
    var processors = [
        autoprefixer({
            browsers: ['last 2 versions', '> 5%']
        }),
        mqpacker,
        cssnext()
    ];
    return gulp.src('app/css/app.css')
        .pipe(postcss(processors))
        .pipe(rename('app.post.css'))
        .pipe(gulp.dest('app/css/'));
});
//Serve development verison
gulp.task('serve', function() {
    browserSync.init({
        server: 'app/'
            // browser: 'Chrome'

    });
    gulp.watch('app/js/*.js').on('change', browserSync.reload);
    gulp.watch('app/*.html').on('change', browserSync.reload);
    gulp.watch('app/css/*.css').on('change', browserSync.reload);

});

gulp.task('serveBuild', function() {
    browserSync.init({
        server: 'dist/'
            // browser: 'Chrome'

    });
    gulp.watch('dist/js/*.js').on('change', browserSync.reload);
    gulp.watch('dist/*.html').on('change', browserSync.reload);
    gulp.watch('dist/css/*.css').on('change', browserSync.reload);

});
