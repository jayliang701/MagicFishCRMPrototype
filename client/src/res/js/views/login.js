/**
 * Created by Jay on 2017/11/30.
 */
import React from 'react';
import { BaseComp, DataComm } from 'easy-react';

class LoginAction {
    constructor() {
        this.type = "login";
    }

    getDefaultStorage() {
        return {
            isWorking:false,
            err:''
        };
    }

    request(account, pwd, callBack) {
        // this.update('account', account);
        // this.update('pwd', pwd);
        this.update('isWorking', true);
        setTimeout(function () {
            this.update('isWorking', false);
            callBack && callBack();
        }.bind(this), 200 + Math.random() * 600);
    }

}
DataComm.registerAction(LoginAction);

class Login extends BaseComp {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.bindData('login', '*');
    }

    doLogin() {
        var account = $('input[name=account]').val();
        var pwd = $('input[name=pwd]').val();
        this.exec('login.request', account, pwd, function () {
            console.log('ok...');
        });
    }

    render() {
        return <div>
                    <h1>Login</h1>
                    <div>
                        <input name="account" type="text" />
                        <input name="pwd" type="password" />
                        <button onClick={this.doLogin.bind(this)}>{this.state.isWorking ? '...' : 'Login'}</button>
                    </div>
                </div>;
    }
}

import ReactDOM from 'react-dom';
ReactDOM.render(
    <Login />,
    document.getElementById('root')
);