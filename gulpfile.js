var fs = require('fs');
var path = require('path');

var gulp = require('gulp');

var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
//var rename = require('gulp-rename');
var cssnano = require('gulp-cssnano');
//var concat = require('gulp-concat');
var browserify = require('browserify');
var  source = require('vinyl-source-stream');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath).mode
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ]).then(function () {
        done();
    });
});

gulp.task('copy', [
    'copy:.htaccess',
    'copy:index.html',
    'copy:jquery',
    'copy:license',
    'copy:main.css',
    'copy:misc',
    'copy:normalize'
]);

gulp.task('copy:.htaccess', function () {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
               .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:index.html', function () {
    return gulp.src(dirs.src + '/index.html')
               //.pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
               .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
               .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
               .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:license', function () {
    return gulp.src('LICENSE.txt')
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:main.css', function () {

    var banner = '/*! HTML5 Boilerplate v' + pkg.version +
                    ' | ' + pkg.license.type + ' License' +
                    ' | ' + pkg.homepage + ' */\n\n';

    return gulp.src(dirs.src + '/css/main.css')
               .pipe(plugins.header(banner))
               .pipe(plugins.autoprefixer({
                   browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
                   cascade: false
               }))
               .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!'+dirs.src+"/js/*.js",
        '!'+dirs.src+"/js/*.es6",
        '!' + dirs.src + '/css/main.css',
        '!' + dirs.src + '/index.html'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:normalize', function () {
    return gulp.src('node_modules/normalize.css/normalize.css')
               .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js'
    ]).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});
//
gulp.task('convertJS', function(){
    return gulp.src('./src/js/**/*.es6')//多个文件以数组形式传入
        //.pipe(plugins.plumber())
        //.pipe(concat('main.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});
gulp.task('es6to5', function() {
    return gulp.src('./src/**/*.es6')
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest('./src/js'));
});

gulp.task('pack', ['es6to5'], function() {
    return gulp.src('./src/js/*.js')
        //.pipe(browserify())
        //.pipe(concat('app.js'))
        .pipe(uglify({
            mangle: true,//类型：Boolean 默认：true 是否修改变量名
            compress: true,//类型：Boolean 默认：true 是否完全压缩
            preserveComments:'none'// 'all' //保留所有注释
        }))
        .pipe(gulp.dest('./dist/js'));
});

//
gulp.task('convertCSS', function(){
    return gulp.src('.src/css/*.css')
        //.pipe(concat('app.css'))
        .pipe(cssnano())
        //.pipe(rename(function(path){
        //    path.basename += '.min';
        //}))
        .pipe(gulp.dest('./dist/css'));
});

//
gulp.task('watch', function(){
    gulp.watch('./src/css/*.css', ['convertCSS']);
    gulp.watch('./src/js/*.js', ['convertJS', 'browserify']);
});

// browserify
gulp.task("browserify", function () {
    var b = browserify({
        entries: "dist/js/main.js"
    });

    return b.bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest("dist/js"));
});

gulp.task('start', ['convertJS', 'convertCSS', 'browserify', 'watch']);

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('build', function (done) {
    runSequence(
        //['clean', 'convertJS', 'convertCSS','lint:js'],
        ['clean', 'convertJS', 'convertCSS'],
        //['clean'],
        'copy',
        //[ 'convertJS', 'convertCSS'],
        //[ 'pack', 'convertCSS'],
    done);
});
gulp.task('start', ['convertJS', 'convertCSS', 'browserify', 'watch']);
gulp.task('default', ['build']);
