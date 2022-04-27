var gulp = require('gulp');
var pug = require('gulp-pug');
var less = require('gulp-less');
var clean = require('gulp-clean');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var minifyCSS = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var rootFiles = ['./src/*.*'];
var vendorFiles = ['./src/vendor/**/*.*'];
var reload = browserSync.reload;
var stream = browserSync.stream();

gulp.task('clean', () => {
  gulp.src('./build', { read: false })
        .pipe(clean())
        .pipe(plumber());
});

gulp.task('move-root', function () {
    return gulp.src(rootFiles)
        .pipe(gulp.dest('./build'))
        .pipe(plumber());
});

gulp.task('move-vendor', function () {
    return gulp.src(vendorFiles, { base: './src' })
        .pipe(gulp.dest('./build'))
        .pipe(plumber());
});

gulp.task('html', function(){
  return gulp.src(['src/pages/*.pug', '!./src/templates/**/_*.pug'])
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest('./build'))
    .pipe(plumber());
});

gulp.task('css', function(){
  return gulp.src('src/styles/*.less')
    .pipe(less())
    .pipe(plumber())
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/css'))
    .pipe(stream);
});

gulp.task('js', function(){
  return gulp.src('src/javascript/*.js')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write())
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'))
});
// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('js-watch', ['js'], function (done) {
    reload;
    done();
});

gulp.task('img', () =>
    gulp.src('src/images/**')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 })
        ]))
        .pipe(gulp.dest('./build/images'))
);
// Another one if a new image its added
gulp.task('img-watch', ['img'], function (done) {
    reload;
    done();
});



gulp.task('default', ['move-root', 'move-vendor', 'html', 'css', 'js', 'img'], function () {
    // Start Browser Sync
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
    // Check for source changes
    gulp.watch('src/styles/*.less', ['css']);
    gulp.watch(['src/pages/*.pug', 'src/templates/**/_*.pug'], ['html']).on("change", reload);
    gulp.watch('src/images/**', ['img-watch']);
    gulp.watch('src/javascript/*.js', ['js-watch']);
});