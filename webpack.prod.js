"use strict";

const glob = require('glob');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const setMAP = () => {
    /*  目标：将 entry 设置成下面的
        entry: {
            index: './src/index.js',
            search: './src/search.js'
        },
    */
    const entry = {};
    const htmlWebpackPlugins = [];

    const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));
    /* [
        'D:/personal/study/workSpace/webpack-study/src/index/index.js',
        'D:/personal/study/workSpace/webpack-study/src/search/index.js'
    ] */

    Object.keys(entryFiles).map((index) => {
        const entryFile = entryFiles[index]

        const match = entryFile.match(/src\/(.*)\/index\.js/)
        const pageName = match && match[1]  // 正则匹配，pageName 用来设置 entry 的 key
        /* 
        pageName [
            'src/search/index.js',
            'search',
            index: 42,
            input: 'D:/personal/study/workSpace/webpack-study/src/search/index.js',
            groups: undefined
        ]
        */
        entry[pageName] = entryFile

        htmlWebpackPlugins.push(new HtmlWebpackPlugin({
            template: path.join(__dirname, `src/${pageName}/index.html`),
            filename: `${pageName}.html`,
            chunks: ['vendors', 'commons', pageName],
            inject: true,
            minify: {
                html: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: false 
            }
        }))
    })

    return {
        entry,
        htmlWebpackPlugins
    }
}

const { entry, htmlWebpackPlugins } = setMAP();

module.exports = {
    entry: entry,
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
                    },
                    {
                        loader: 'px2rem-loader',
                        options: {
                            remUnit: 75, // 这样设置 750 的设计稿对应 10 rem
                            remPrecesion: 8 // 小数点位数
                        }
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
        // 一般来说一个页面对应一个 HtmlWebpackPlugin，后面改成了用 glob 动态引入的方式，具体的方法看上面的 setMAP
        /* new HtmlWebpackPlugin({
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
        }), */
        new CleanWebpackPlugin(),
        new HtmlWebpackExternalsPlugin({
            externals: [
              {
                module: 'react',
                entry: 'https://now8.gtimg.com/now/lib/16.8.6/react.min.js',
                global: 'React',
              },
              {
                module: 'react-dom',
                entry: 'https://now8.gtimg.com/now/lib/16.8.6/react-dom.min.js',
                global: 'ReactDOM',
              }
            ],
        })
    ].concat(htmlWebpackPlugins),
    /* 分离基础包 */
    /* optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /(react|react-dom)/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    } */
    /* 提取公共文件 */
    optimization: {
        splitChunks: {
            minSize: 0, // 不限制大小，只要引入条件达到了，就打一个 commons 文件出来
            cacheGroups: {
                commons: {
                    name: 'commons',
                    chunks: 'all',
                    minChunks: 2 // 最少引入次数是两次
                }
            }
        }
    }
    // devtool: 'source-map'
}
