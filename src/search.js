'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import logo from './images/vsCode-bg.png'
import './search.less';

class Search extends React.Component {
    render () {
        return <div className="search-text">
            搜索文字feew<img src={ logo } />
        </div>;
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('root')
)