var gulp           = require('gulp'),
gutil          = require('gulp-util' ),
sass           = require('gulp-sass'),
browserSync    = require('browser-sync'),
concat         = require('gulp-concat'),
uglify         = require('gulp-uglify'),
cleanCSS       = require('gulp-clean-css'),
rename         = require('gulp-rename'),
del            = require('del'),
imagemin       = require('gulp-imagemin'),
cache          = require('gulp-cache'),
autoprefixer   = require('gulp-autoprefixer'),
notify         = require("gulp-notify"),
rsync          = require('gulp-rsync'),
pngquant     = require('imagemin-pngquant'),
spritesmith = require('gulp.spritesmith');

gulp.task('common-js', function() {
	return gulp.src([
		'app/js/common.js',
		])
	.pipe(concat('common.min.js'))
	// .pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('js', ['common-js'], function() {
	return gulp.src([
		'app/js/common.min.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Minimize the whole js 
	.pipe(gulp.dest('app/js'))

	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});


gulp.task('sprite', function () {
	var sprite = gulp.src('./app/img/icons/*.png')
	.pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: '_sprite.sass',
		imgPath: '../img/sprite.png',
		algorithm: 'top-down',
		padding: 5,
	}));
	sprite.img
	.pipe(gulp.dest('./app/img/'))
	.pipe(browserSync.reload({ stream: true }))
	sprite.css
	.pipe(gulp.dest('./app/sass/'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
	// output_style = :expanded or :nested or :compact or :compressed
	.pipe(sass({outputStyle: 'nested'}).on("error", notify.onError()))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions']))
	// .pipe(cleanCSS()) // Optionally, comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});


gulp.task('watch', ['sprite','sass', 'js', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/img/icons/*.png', ['sprite']);
});

// gulp.task('imagemin', function() {
// 	return gulp.src(['app/img/**/*', '!app/img/icons/**/*'])
// 	.pipe(cache(imagemin()))

// 	.pipe(imagemin({
// 		interlaced: true,
// 		progressive: true,
// 		optimizationLevel: 5,
// 		svgoPlugins: [{removeViewBox: true}]
// 	}));
// 	.pipe(gulp.dest('dist/img')); 
// });
gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*') 
	.pipe(cache(imagemin({  
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img')); 
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/css/main.min.css',
		]).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));

});


gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });
gulp.task('default', ['watch']);
