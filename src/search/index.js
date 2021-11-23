/*
 * @Description: 
 * @Version: 1.0.22
 * @Autor: youdeyin
 * @Date: 2021-11-18 00:50:33
 * @LastEditors: youdeyin
 * @LastEditTime: 2021-11-24 00:09:36
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

    constructor () {
        super(...arguments);

        this.state = {
            Text: null
        }
    }

    loadComponent() {
        import('./text.js').then((Text) => {
            this.setState({
                Text: Text.default
            })
        })
    }

    render () {
        const { Text } = this.state
        return <div className="search-text">
            {
                Text ? <Text /> : null
            }
            搜索文字<img src={ logo } onClick={ this.loadComponent.bind(this) }/>
        </div>;
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('root')
)