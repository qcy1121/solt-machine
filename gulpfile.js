var fs = require('fs');
var path = require('path');

var gulp = require('gulp');

var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
//var rename = require('gulp-rename');
// var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
var minifyCss = require("gulp-clean-css");
var image = require("gulp-image");
var less = require("gulp-less");

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
    // 'copy:main.css',
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
        //.pipe(gulp.)
        .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        //'!'+dirs.src+"/js/*.js",
        '!' + dirs.src + "/js/*.js.map",
        '!' + dirs.src + "/js/*.es6",
        '!' + dirs.src + '/css/*.css',
        '!' + dirs.src + '/css/*.less',
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
gulp.task('convertJS', function () {
    return gulp.src('./src/js/**/*.es6')//多个文件以数组形式传入
        .pipe(concat('main.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        // .pipe(uglify({
        //     mangle: true,//类型：Boolean 默认：true 是否修改变量名
        //     compress: true,//类型：Boolean 默认：true 是否完全压缩
        //     preserveComments: 'none'// 'all' //保留所有注释
        // }))
        .pipe(gulp.dest('./dist/js'));
});
//压缩图片，压缩后的文件放入dest/images
gulp.task('image', function () {
    gulp.src('./src/img/*.+(jpg|png|gif|svg)')
        .pipe(image())//压缩
        .pipe(gulp.dest('dist/img'));//输出
});

//
gulp.task('convertCSS', function () {
    return gulp.src('./src/css/**/*.less')
        .pipe(less())
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9', '> 1%'],
            cascade: false
        }))
        .pipe(minifyCss({
            advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            //compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            //keepBreaks: true,//类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        //.pipe(rename(function(path){
        //    path.basename += '.min';
        //}))
        .pipe(gulp.dest('./dist/css'));
});

// 监视文件的变化
gulp.task('watch', function () {
    return gulp.watch(['src/js/**/*.es6', 'src/css/**/*.less', 'src/index.html'], ['copy:index.html', 'convertJS', 'convertCSS']);
});

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
        ['clean'],
        'copy',
        ['convertJS', 'convertCSS'],
        done);
});
gulp.task('start', ['build', 'watch']);
gulp.task('default', ['build']);
