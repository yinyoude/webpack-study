module.exports = {
    plugins: [
        require('autoprefixer')({
            overrideBrowserslist: ['last 2 version', '>1%', 'ios 7'] // 兼容最近的两个版本，兼容使用人数大于1%的版本，兼容 IOS 7 以上的浏览器
        })
    ]
}