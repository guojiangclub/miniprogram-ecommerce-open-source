var gulp = require('gulp')
var minifycss = require('gulp-minify-css')
var less = require('gulp-less')
var path = require('path')
var fs = require('fs')
var changed = require('gulp-changed');
var notify = require('gulp-notify');
var merge = require('merge-stream')
var plumber = require('gulp-plumber')
var rename = require('gulp-rename')
var yargs = require('yargs')
var DIST = 'src/pages'

function getFile(type){
    if (typeof type !== 'string') return;
    var filePath = fs.readdirSync(path.resolve('./src/pages'))
    var fileArr = []
    filePath.forEach(function(item){
        var pagePath = path.join('./src/pages',item)
        var pageFiles = fs.readdirSync(pagePath)

        pageFiles.forEach(function(v) {
            var lastPath = path.join(pagePath,v,v + '.'+ type)

            fileArr.push(lastPath.split('\\').join('/'))
        })
    })

    return fileArr
}


var files = getFile('less');

gulp.task('less', function () {


    var tasks = files.map(function(item){

        return gulp.src('./'+ item)

            .pipe(changed(DIST))
            .pipe(less())
            .pipe(gulp.dest(path.join(item,'..')))
            .pipe(minifycss())
            .pipe(gulp.dest(path.join(item,'..')))


    })

    return merge(...tasks)

})



gulp.task('changeFileName',['less'],function(){
    var files = getFile('css')
    var tasks = files.map(function(v){
        return gulp.src(v)
            .pipe(changed(DIST))
            .pipe(rename(function(path){
                path.extname = ".wxss"
            }))
            .pipe(gulp.dest(path.join(v,'..')))
    })


    return merge(...tasks)
})



gulp.watch('src/pages/**/**/*.less',['less','changeFileName'])

gulp.task('default',['less','changeFileName']);

