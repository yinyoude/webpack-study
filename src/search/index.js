/*
 * @Description: 
 * @Version: 1.0.22
 * @Autor: youdeyin
 * @Date: 2021-11-18 00:50:33
 * @LastEditors: youdeyin
 * @LastEditTime: 2021-11-22 22:39:12
 * @FilePath: \webpack-study\src\search\index.js
 */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import logo from '../images/vsCode-bg.png'
import './search.less';

class Search extends React.Component {
    render () {
        debugger
        return <div className="search-text">
            搜索文字feew<img src={ logo } />
        </div>;
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('root')
)