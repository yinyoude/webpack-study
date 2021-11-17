"use strict";

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: {
        index: './src/index.js',
        search: './src/search.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]_[chunkhash:8].js'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /.js$/,
                use: 'babel-loader'
            },
            {
                test: /.css$/,
                use: [
                    // 因为 mini-css-extract-plugin 与 style-loader 是不一样的操作，只要选择其中一个来使用，要使用文件指纹，所以用 mini-css-extract-plugin
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader',
                    {
                        loader: 'postcss-loader'
                        // 此版本不支持 postcss-loader 的这种写法，改成在项目目录中增加 postcss.config.js 文件，下面这段代码放到了文件中
                        /* options: {
                            plugins: () => {
                                require('autoprefixer')({
                                    browsers: ['last 2 version', '>1%', 'ios 7'] // 兼容最近的两个版本，兼容使用人数大于1%的版本，兼容 IOS 7 以上的浏览器
                                })
                            }
                        } */
                    }
                ]
            },
            {
                test: /.(png|jpg|gif|jpeg)$/,
                // use: 'file-loader'
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]_[hash:8].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name]_[contenthash:8].css'
        }),
        /* new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano')
        }) */
        new CssMinimizerWebpackPlugin(),
        // 一般来说一个页面对应一个 HtmlWebpackPlugin
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/search.html'), // 模板所在位置
            filename: 'search.html',    // 指定打包出来的文件名称
            chunks: ['search'],                 // 指定生成的 html 要使用哪些 chunk
            inject: true,                   // 设置 inject 为 true 的话，打包出来的 js 和 css 会自动地注入到里面来
            minify: {
                html: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: false 
            }
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.html'),
            filename: 'index.html',
            chunks: ['index'],
            inject: true,
            minify: {
                html: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: false 
            }
        }),
        new CleanWebpackPlugin()
    ]
}