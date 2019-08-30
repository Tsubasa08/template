var gulp = require("gulp");
var sass = require("gulp-sass");

var plumber = require("gulp-plumber");
var notify = require("gulp-notify");
var sassGlob = require("gulp-sass-glob");
var mmq = require("gulp-merge-media-queries");
var browserSync = require("browser-sync");

var imagemin = require("gulp-imagemin");
var imageminPngquant = require("imagemin-pngquant");
var imageminMozjpeg = require("imagemin-mozjpeg");

var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");

var cssdeclsort = require("css-declaration-sorter");

var imageminOption = [
  imageminPngquant({ quality: [0.65, 0.8] }),
  imageminMozjpeg({ quality: 85 }),
  imagemin.gifsicle({
    interlaced: false,
    optimizationLevel: 1,
    colors: 256
  }),
  imagemin.jpegtran(),
  imagemin.optipng(),
  imagemin.svgo()
];

gulp.task("sass", function() {
  return gulp
    .src("./sass/**/*.scss")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(
      postcss([
        autoprefixer({
          browsers: ["last 2 versions", "ie >= 11", "Android >= 4"],
          grid: true,
          cascade: false
        })
      ])
    )
    .pipe(postcss([cssdeclsort({ order: "SMACSS" })]))
    .pipe(mmq())
    .pipe(gulp.dest("./css"));
});

gulp.task("sass-watch", function() {
  gulp.watch("./sass/**/*.scss", gulp.task("sass"));
});

gulp.task("browser-sync", function() {
  browserSync.init({
    server: {
      baseDir: "./",
      index: "index.html"
    }
  });
});

gulp.task("bs-reload", function(done) {
  browserSync.reload();
  done();
});

gulp.task("file-watch", function() {
  gulp.watch("**/*.html", gulp.task("bs-reload"));
  gulp.watch("./css/*.css", gulp.task("bs-reload"));
  gulp.watch("./js/*.js", gulp.task("bs-reload"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("browser-sync", "file-watch", "sass-watch"))
);

gulp.task("imagemin", function() {
  return gulp
    .src("./img/base/*.{png,jpg,gif,svg}")
    .pipe(imagemin(imageminOption))
    .pipe(gulp.dest("./img"));
});
