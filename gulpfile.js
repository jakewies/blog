var gulp = require('gulp'),
	ghost = require('ghost'),
	symlink = require('gulp-sym'),
	replace = ('gulp-replace'),
	browserSync = require('browser-sync').create(),
	runSequence = require('run-sequence'),
	prefix = require('gulp-autoprefixer'),
	cssNano = require('gulp-cssnano'),
	sourcemaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	del = require('del'),
	env = require('gulp-env'),
	path = require('path');

var g;



/*************************************************************************************
* * * * * * * * * * * * * * * * * DEVELOPMENT Tasks * * * * * * * * * * * * * * * * *
*************************************************************************************/



/**
*
* Create a symbolic link between ./app and ./node_modules/ghost/content/themes/blok-theme for DEVELOPMENT
*
**/
gulp.task('symlink:dev', function () {
  return gulp.src('app')
    .pipe(symlink('node_modules/ghost/content/themes/blok-theme', { force: true }));
});

/**
*
* Browsersync DEVELOPMENT
*
**/
gulp.task('browsersync', function (callback) {
  browserSync.init({
    proxy: 'localhost:2368'
  });

  callback();
});
gulp.task('browsersync:reload', function (callback) {
  browserSync.reload();

  callback();
});

/**
*
* Start the Ghost server
*
**/
gulp.task('ghost:start', function (callback) {
    g = ghost({
        config: path.join(__dirname, 'ghost-dev-config.js')
    });

    g.then(function (ghostServer) {
		ghostServer.start().then(function () {
      		runSequence('browsersync'); // Once Ghost has started, start Browsersync proxy
    	});
    });
    callback();
});

/**
*
* Autoprefixer and concatination DEVELOPMENT
*
**/
gulp.task('css:dev', function(callback) {
	return gulp.src('app/assets/css/src/*.css')
		.pipe(sourcemaps.init())
		.pipe(concat('styles.css'))
		.pipe(prefix({
			browsers: ['last 2 versions']
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/assets/css'))

	callback();
});

/**
*
* Combine all JS files DEVELOPMENT
*
**/
gulp.task('js:dev', function(callback) {
	return gulp.src('app/assets/js/src/*.js')
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest('app/assets/js'))

	callback();
});

/**************************
*
* Run Ghost theme locally
*
**************************/
gulp.task('ghost:dev', ['css:dev', 'ghost:start'], function (callback) {
	// watch for file and changes and reload browser
	gulp.watch('app/assets/css/src/*.css', ['css:dev', 'browsersync:reload']);
	gulp.watch('app/assets/js/src/*.js', ['js:dev', 'browsersync:reload']);
	gulp.watch(['app/*.hbs', 'app/partials/*.hbs'], ['browsersync:reload']);

	callback();
});



/*************************************************************************************
* * * * * * * * * * * * * * * * * Production Tasks * * * * * * * * * * * * * * * * *
*************************************************************************************/



/**
*
* Clean the ./dist directory
*
**/
gulp.task('delete', function(callback) {
	del(['dist']);

  	callback();
});

/**
*
* Copy all files at the root of ./app to the root ./dist
*
**/
gulp.task('copy:root', function(callback) {
	return gulp.src(['app/*.hbs', 'app/package.json', 'app/README.md'])
		.pipe(gulp.dest('dist'))

	callback();
});

/**
*
* Move all font files to ./dist/assets/fonts
*
**/
gulp.task('copy:fonts', function(callb2ack) {
	return gulp.src('app/assets/fonts/**')
		.pipe(gulp.dest('dist/assets/fonts'))

	callback();
})

/**
*
* Move partials folder to ./dist
*
**/
gulp.task('copy:partials', function(callback) {
	return gulp.src('app/partials/**')
		.pipe(gulp.dest('dist/partials'))

	callback();
})

/**
*
* Autoprefixer and CSS minification PRODUCTION
*
**/
gulp.task('css:prod', function(callback) {
	return gulp.src('app/assets/css/src/*.css')
		.pipe(concat('styles.css'))
		.pipe(prefix({
			browsers: ['last 2 versions']
		}))
		.pipe(cssNano())
		.pipe(gulp.dest('dist/assets/css'))

	callback();
});

/**
*
* Combine and minify all JS files PRODUCTION
*
**/
gulp.task('js:prod', function(callback) {
	return gulp.src('app/assets/js/src/*.js')
		.pipe(concat('scripts.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/assets/js'))

	callback();
});

/**
*
* Deploy Ghost theme for production
*
**/
gulp.task('deploy', function(callback) {
	runSequence('delete',
				'copy:root',
				'copy:fonts',
				'copy:partials',
				[
					'css:prod',
					'js:prod'
				],
				callback);
});

/**
*
* Create a symbolic link between ./dist and ./node_modules/ghost/content/themes/blok-theme for PRODUCTION
*
**/
gulp.task('symlink:production', function () {
  return gulp.src('dist')
    .pipe(symlink('node_modules/ghost/content/themes/blok-theme', { force: true }));
});

/**
*
* Browsersync PRODUCTION
*
**/
gulp.task('browsersync:production', function (callback) {
  browserSync.init({
    proxy: 'localhost:2368'
  });

  callback();
});

/*******************************
*
* Run Ghost theme in PRODUCTION
*
********************************/
gulp.task('ghost:production', ['deploy'], function () {
  g = ghost({
    config: path.join(__dirname, 'ghost-prod-config.js')
  });

  env({
    file: 'prod.env.json'
  });

  g.then(function (ghostServer) {
    ghostServer.start().then(function () {
      runSequence(
        'symlink:production',
        'browsersync:production'
      );
    });
  });
});
