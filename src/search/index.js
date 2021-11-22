/*
 * @Description: 
 * @Version: 1.0.22
 * @Autor: youdeyin
 * @Date: 2021-11-18 00:50:33
 * @LastEditors: youdeyin
 * @LastEditTime: 2021-11-23 01:54:16
 * @FilePath: \webpack-study\src\search\index.js
 */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import logo from '../images/vsCode-bg.png'
import './search.less';
import { common } from "../../common";
import { a, b } from './tree-shaking';

// 被 tree-shaking 干掉了
if (false) {
    b()
}

class Search extends React.Component {
    render () {
        // 不会被 tree-shaking 干掉
        const funcA = a()
        return <div className="search-text">
            搜索文字{funcA}<img src={ logo } />
        </div>;
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('root')
)