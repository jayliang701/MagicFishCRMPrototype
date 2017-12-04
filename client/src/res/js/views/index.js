/**
 * Created by Jay on 2017/11/30.
 */
import React from 'react';
import { BaseComp, DataComm } from 'easy-react';
import TimeAction from './actions/TimeAction';
import Clock from './components/Clock';

DataComm.registerAction(TimeAction);

class Index extends BaseComp {

    render() {
        return <div>
                    <h1>Hello World!</h1>
                    <Clock />
                </div>;
    }
}

import ReactDOM from 'react-dom';
ReactDOM.render(
    <Index />,
    document.getElementById('root')
);