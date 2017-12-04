/**
 * Created by Jay on 2017/11/30.
 */
import React from 'react';
import { BaseComp } from 'easy-react';

class Clock extends BaseComp {
    constructor() {
        super();
        this.state = {
            date:null
        };
    }

    componentDidMount() {
        this.bindData('time.date', 'time');
    }

    render() {
        return (
            <div>
                <h3>{this.state.time && this.state.time.toTimeString()}</h3>
            </div>
        );
    }
}

export default Clock;