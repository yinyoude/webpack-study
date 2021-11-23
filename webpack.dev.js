"use strict";

const glob = require('glob');
const path = require('path');
const webpack = require('webpack'); // WDS 是 webpack 内置的
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// https://webpack.js.org/

// loaders 解决 webpack 不能解析原生不支持的文件格式
// webpack 原生支支持 js 和 json
// 对于一些新的语法糖 scss, less, vue, jsx 要通过 loaders 支持
// babel-loader 转换 es6\es7 新特性语法
// css-loader 支持 .css 文件的加载和解析（webpack 本身不支持 css 文件）
// less-loader 将 less 转换成 css
// file-loader 进行图片、字体等的打包
// row-loader 将文件以字符串的形式导入（首屏的资源需要内联的情况下可以借助 row-loader）
// thread-loader 多进程打包 js 和 css

// plugin 用来增强 webpack 的功能：通常用于 打包出来的 js 文件的优化，资源的管理 和 环境变量的注入
// 比如：打包之前，我们需要手动地删除 dist 目录，这种就可以通过 plugin 去完成
// plugin 是作用于整个构建地过程的，也就是说从构建的开始到构建的结束都是可以去使用 plugins 的
// CommonsChunkPlugin 通常是用在多个页面打包的情况下，将每个页面公共的 js 文件，js 模块 提取出来
// CleanWebpackPlugin 清理构建目录
// ExtractTextWebpackPlugin 将 css 从 bundle 文件里提取成一个独立的 css 文件
// CopyWebpackPlugin 将文件或者文件夹拷贝到构建的输出目录
// HtmlWebpackPlugin 创建 html 文件去承载输出的 bundle。不需要你在创建完成后的 dist 目录里再手动的去创建一个 html 文件去 引入 bundle.js
// UglifyjsWebpackPlugin 压缩 JS
// ZipWebpackPlugin 将打包出去的资源生成一个 Zip 包

/* 
    es6配置：配置在 .babelrc 里面，因为使用了 babel-loader 他会去找这个文件里面使用的一些 plugin
    {
        // presets 是一系列 plugins 的集合
        "presets": [
            "@babel/preset-env"
        ],
        // 一个 plugins 对应一个功能
        "plugins": [
            "@babel/proposal-class-properties"
        ]

    }
*/

// 解析 css
/* 
    css-loader 用于加载 .css 文件，并且转换成 common.js 对象
    style-loader 将样式通过 <style> 标签插入到 head 中
*/

// 解析图片
/* 
    file-loader 用于处理文件
    url-loader 可以处理图片和字体，可以设置较小资源自动 base64，内部用的其实还是 file-loader
*/







// webpack 中的文件监听
/* 
    需求：每次改动了代码之后，都要重新打包一次，才能看到效果，期望能自动监听源码发生变化的时候，自动重新构建出新的文件

    webpack 开启监听模式的两种方式：
    启动 webpack 命令的时候，带上 --watch 参数
    在配置 webpack.config.js 中设置 watch: true
    唯一缺陷：每次都需要手动刷新浏览器

    文件监听原理分析：
    轮询判断文件的最后编辑时间是否变化
    某个文件发生了变化，并不会立刻告诉监听者，而是把文件的修改先缓存起来，等待一定时间。
    在等待时间内，如果有其他文件也发生了变化，他会把这些变化的文件也一起构建。有点像节流（单位时间内只执行一次）

    module.export = {
        // 默认为 false，也就是不开启
        watch: true,
        // 只有开启监听模式时，watchOptions 才有意义
        watchOptions: {
            // 默认为空，不监听的文件或者文件夹，支持正则匹配
            ignored: /node_modules/,
            // 监听到变化发生之后会等待300ms再去执行，默认300ms
            aggregateTimeout: 300,
            // 判断文件是否发生变化是通过不停询问系统指定文件有没有变化实现的，默认每秒询问 1000 次。
            poll: 1000
        }
    }
*/






// 热更新：解决 webpack 的文件监听需要手动刷新浏览器的问题，代码改变自动刷新页面
/* 
    webpack-dev-server: 
    WDS 不刷新浏览器
    WDS 不输出文件，没有磁盘的 IO，而是放在内存中，构建速度更有优势
    和 HotModuleReplacementPlugin 插件一起使用

    webpack-dev-middleware：
    和 WDS 可以实现相同的效果，不过更加灵活 
    WDM 将 webpack 输出的文件传输给服务器，适用于灵活的定制场景

    热更新的原理：
    webpack Compile: 将 JS 编译成 Bundle
    HMR Server: 将热更新的文件输出给 HMR Runtime
    Bundle server: 提供文件在浏览器的访问，正常访问是以文件目录的方式其访问，通过 Bundle server，就可以以服务器的方式（localhost:8080），让 bundle.js 通过这种方式进行访问
    HMR Runtime: 会被注入到浏览器，更新文件的变化。在打包阶段，把 HMR Runtime 注入到浏览器端的 bundle.js 里面。浏览器端的 bundle.js 就可以和服务器端建立一个链接。通常这个链接是 webSocket 的。这样就可以
    在接受到文件变化的一些回包之后，自动输出构建的文件。
    bundle.js: 构建输出的文件
    
    HMR Server 是运行到 webpage-dev-server 上的一个服务，HMR Runtime 是注入在 bundle.js 里面的一段代码，在浏览器端执行，他们之间通过 webSocket 进行通信，
    方便在文件发生改变，重新编译后。通过 HMR Server 通知 HMR Runtime 去重新请求自动刷新页面
    
    热更新的过程：
    热更新一共有两个过程：启动阶段
    启动阶段：是在文件系统中进行编译，将初始的代码通过 webpack-compiler 进行打包，打包之后，把编译好的文件传输给 bundle server。bundle server 其实就是一个服务器。bundler server 就可以
    通过 server（localhost:8080）的方式，让浏览器访问到。 图中的 1-> 2 -> A -> B
    文件更新阶段：文件系统发生变化，通过 webpack compiler 进行编译，编译好之后，会把代码发送给 HMR Server，HMR Server 就可以知道哪些模块发生了改变，通知 HMR Runtime。HMR Server 实在服务端，
    HMR Runtime 是在客户端。通常是以 json 格式的数据进行传输。通知到了 HMR Runtime 之后，HMR Runtime 就会更新我们的代码，不需要我们手动刷新。图中的 1 -> 2 -> 3 -> 4
    
    以上就是我们热更新的原理和过程
*/






/* 
    补充知识：compiler 和 compilation
    webpack 的生命周期：before - run - beforeCompiler - compile - make - finishMake - afterCompile - done
    compiler 在 webpack 构建之初就已经创建，并且贯穿 webpack 整个生命周期，只要是做 webpack 编译，都会先创建一个 compiler
    compilation 是到准备编译模块的时候，才会创建 compilation 对象。是 compile-make 阶段主要使用的对象

    为什么需要 compilation ?
    在使用 watch，源码发生改变的时候就需要重新编译模块，但是 compiler 可以继续使用
    如果使用 compiler 则需要初始化注册所有 plugin，但是 plugin 没有必要重新注册
    这个时候就需要创建一个新的 compilation 对象
    而只有修改新的 webpack 配置才需要重新运行 npm run build 来重新生成 compiler 对象
*/

// 文件指纹：打包后输出的文件名的后缀
/* 
    使用文件指纹的好处：1、方便做一些版本的管理，比如说：项目要发布的时候，有些文件修改了的，这个时候只需要把修改的文件发不上去，没有修改的文件是不需要修改它的文件指纹的
                      2、对于没有修改的文件，他还能持续的使用浏览器的缓存
    
    常见的文件指纹：
    Hash:和整个项目的构建相关，只要项目文件有修改，整个项目构建的 hash 值就会改变
        在 webpack 中，有 Compile 和 Compilation 这两个概念，Compile 是 webpack 启动的那一次，他会创建一个 Compile 对象， Compilation 是每次文件发生变化的时候，Compilation 都是会
        变化的。Hash 就是随这个 Compilation 变化而变化。打包的时候 A 页面如果发生了变化， B 页面的文件 hash 也会随着改变，这其实是没有必要的。所以引入 Chunkhash。
    Chunkhash:和 webpack 打包的 chunk 有关，不同的 entry 会生成不同的 chunkhash 值。
        所以每个 chunk 的 hash 就会相对独立，修改某一个 chunk 的入口文件中的一个，不会影响其他 chunk 的 hash。
        注意：Chunkhash 是没有办法和热更新（HotModuleReplacePlugin）一起使用的，一般用作生产环境的配置。
    Contenthash:根据文件内容来定义 hash，文件内容不变，则 contenthash 不变。
        某一个页面，既有 js 资源，又有 css 资源。如果 css 资源也使用 Chunkhash，这个时候就会有一个问题。就是我们修改了 js，但是 css 并没有变，由于我们的 css 也是使用了 Chunkhash。
        就会导致 css 内容没有变化，但是发布上去的文件发生了变化。因此对于这种 css，通常我们采用根据内容来进行文件的生成。这种就是使用 Contenthash 的情况。


    js 文件指纹的设置：设置 output 的 filename，使用 [chunkhash]  ----  filename: '[name][chunkhash:8].js'
    css 文件指纹的设置：按照我们之前使用 css-loader 来配置 css 文件解析的话，会先使用 css-loader 解析 css，然后将解析的内容，通过 style-loader 插入到文件的头部 head 标签。这个过程
        并没有生成 css 文件。也就是说没有办法生成文件指纹。因此我们通常采用 MiniCssExtractPlugin 这个插件，把 style-loader 里面的 css 提取成一个独立的文件。
        new MiniCssExtractPlugin({
            filename: '[name][contenthash:8].css'
        })
    图片的文件指纹的设置：设置 file-loader 的 name，使用 [hash]
    注：chunkhash:8,contenthash:8,hash:8 中的 :8 是指取生成的 hash 值的前 8 位，因为像文件指纹使用的 hash 默认其实是使用 MD5 生成的，有 32 二位，而我们只取前面 8 位就可以了。
*/






// 文件压缩
/* 
    js 的文件压缩：内置了 uglifyjs-webpack-plugin，默认的 js 文件已经压缩。也可以手动安装然后设置参数开启并行压缩
    css 的文件压缩：使用 optimize-css-assets-webpack-plugin，同时使用 cssnano
        注：使用发现 optimize-css-assets-webpack-plugin 在 webpack5 中已不再友好支持，使用 css-minimizer-webpack-plugin 代替
        optimization: {
            minimize: true,
            minimizer: [
                new CssMinimizerPlugin(),
            ]
        }
    html 的文件压缩：修改 html-webpack-plugin，设置压缩参数
*/



// 自动清理构建目录
/* 
    避免构建前每次都需要手动删除 dist，使用 clean-webpack-plugin，默认会删除 output 指定地输出目录
*/

// 自动补齐 css3 前缀  -ms(IE) -webkit(Chrome) -moz(Geko) -o(Presto)
/* 
    使用 autoprefixer 插件自动补齐，autoprefixer 其实是 css 的一个后缀处理器，与 less 和 sass 不同， less 和 sass 通常是 css 的一个预处理器，预处理器一般是在打包前去处理
    autoprefixer 是在样式处理好之后，代码最终生成完之后，对他进行一个后置处理。
    根据 Can I Use 规则（https://caniuse.com/），如果是在 can i use 上面能搜索到的属性，在出现浏览器不兼容的时候，会自动使用支持的前缀
*/


/* 
    source map 关键字
    eval: 使用 eval 包裹模块代码
    source map: 产生 .map 文件
    cheap: 不包含列信息
    inline: 将 .map 作为 DataURI 嵌入，不单独生成 .map 文件
    module: 包含 loader 的 sourcemap
*/


/* 
tree shaking (摇树优化)
概念：1个模块可能有多个方法，只要其中的某个方法使用到了，则整个文件都会被打包到 bundle 中去，tree shaking 就是只把用到的方法打入到 bundle，没用到的方法会在 uglify 阶段被删除掉。
使用：webpack 默认支持，在 .babelrc 里设置 modules: false 即可
production mode的情况下默认开启
要求：必须是 es6 的语法，CJS 的方式不支持


DCE(Elimination)
1、代码不会被执行，不可到达
if (false) {
    console.log('这段代码永远不会执行');
}
2、代码执行的结果不会被用到
function a () {
    return 'a 函数只定义了，没有被调用，需要执行 a() 才会不满足 tree shaking 的条件'
}
3、代码只会影响死变量（只写不读）
var noUseElement = 1
function a () {
    noUseElement = 2
}
定义了 noUseElement，但是 noUseElement 没有写的操作，没有读的操作，这种一般 eslint 会报错。需要执行 var nowUse = noUseElement 或者 if (noUseElement) 这种才会不满足 tree shaking 的条件

tree-shaking 原理
利用 ES6 模块的特点：
（1）只能作为模块顶层的语句出现
（2）import 的模块名只能是字符串常量
（3）import binding 是 immutable 的
代码擦除： uglify 阶段删除无用代码
结合上面为什么 CJS 的方式不支持来理解：tree-shaking 本质其实是对模块的代码进行静态的分析，在编译阶段，哪些代码有用到，其实是需要确定下来的。而 CJS 是可以在代码运行的过程中动态的去 require，这样就满足不了 tree-shaking 的条件。
tree-shaking 在知道了哪些代码没有用到之后，会给这些代码进行一些注释来标记，然后在 uglify 阶段把一些没有用的代码删除掉
*/


/* 
Scope Hosting 使用和原理解析
Scope Hosting 为了解决 webpack 构建后的代码存在大量的闭包代码的现象。大量函数闭包包裹代码，导致体积增大（模块越多越明显）；运行代码时创建的函数作用域变多，内存开销变大。

scope hosting 原理： 将所有模块的代码按照引用顺序放在一个函数作用域里，让后适当的重命名一些变量以防止变量名冲突
对比：通过 scope hosting 可以减少函数声明代码和内存开销 
从原理可以得知，使用 scope hosting 需要知道模块的引用顺序，所以必须是 ES6 语法， CJS 是不支持的

使用 scope hosting 对应 ModuleConcatenationPlugin 插件，webpack4 中，当 mode 为 production 的时候默认开启。
*/


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
            chunks: [pageName],
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
        filename: '[name].js'
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /.js$/,
                use: 'babel-loader'
            },
            {
                test: /.css$/,
                use: [
                    // 这里注意：loader 的调用是链式调用的，他的执行顺序也是从右到左的，因此我们需要先写 style-loader，再写 css-loader。
                    // 这样在他实际执行的时候呢，会先用 css-loader 去解析 css。然后再将解析好的 css 传递给 style-loader
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                test: /.(png|jpg|gif|jpeg)$/,
                use: 'file-loader'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin()
    ].concat(htmlWebpackPlugins),
    devServer: {
        contentBase: './dist',  // WDS 服务的基础目录
        hot: true
    },
    devtool: 'source-map'
}
