/**
 * Created by admin on 2017/8/31.
 */
/**
 * Created by admin on 2017/8/30.
 */
/**
 * Created by admin on 2017/8/17.
 */
var path = require('path');
var fs = require('fs')
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin')
var glob = require('glob')


// function getEntry() {
//     var entry = [];
//     var srcDirName = './src/utils/*.js'; //入口文件夹路径
//     glob.sync(srcDirName).forEach(function (name) {        //n 获取文件名字
//         var n = name.slice(0, name.length - 3);
//         n = n.slice(n.lastIndexOf('/')).split("/")[1];
//         entry.push(name.replace('src/', ''));
//     });
//
//     return entry;
// }


function getDir(str) {

    var dir = fs.readdirSync(str);

    return  dir.filter((item) => {

        var v = path.resolve(__dirname, item);

        if (fs.existsSync(v) && fs.statSync(v).isFile()) {
            return /^app.*/i.test(item)
        } else {
            return (!/(node_modules|dist|.idea)/i.test(item))
        }

        return (!/(node_modules|dist)/i.test(item) && !/^app.*/i.test(item)) || /^app.*/i.test(item)
    }).map((obj) => {

        return {
            from: path.resolve(__dirname, obj),
            to: path.resolve(__dirname, 'dist', obj)
        }
    })

}




module.exports = {
    context: path.join(__dirname, 'src/es6'),
    entry: {
        myapp:'./myapp.js'
    },
    output: {
        path: path.join(__dirname, 'dist/src/lib'),
        filename: '[name].js',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                query: {
                    presets: ['es2015','stage-0']
                },
                loader: 'babel-loader',
                exclude: /node_modules/
            },
        ]
    },
    plugins: [


        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '/src'),
                to: path.join(__dirname, '/dist/src')
            }
        ],{
                ignore: [
                    'es6/*.js',
                    '*.less',
                    '*.css'
                    // 'es6/*.js',
                    /*'pages/!**!/!*.less',
                    'pages/!**!/!**!/!*.less',*/

                ],
                copyUnmodified: true
        }),
    ],
    resolve: {
        extensions: ['.js']
    },
}


