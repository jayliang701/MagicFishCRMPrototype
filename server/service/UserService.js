/**
 * Created by Jay on 4/1/15.
 */

exports.config = {
    name: "user",
    enabled: true,
    security: {
        //@login 账户登录 @account 账号 @pwd 密码 @code 验证码
        "login":{ needLogin:false, checkParams:{ account:"string", pwd:"string" }, optional:{ code:"string" } }
    }
};

var Setting = global.SETTING;
var CODES = require("weroll/ErrorCodes");
var Utils = require("weroll/utils/Utils");
var Session = require("weroll/model/Session");

exports.login = async function(req, res, params) {

    var sess;
    var passport = { pwd:params.pwd };
    var account = params.account;
    if (Utils.checkEmailFormat(account)) {
        passport.email = account;
    } else if (Utils.cnCellPhoneCheck(account)) {
        passport.phone = account;
    } else {
        passport.username = account;
    }
    try {
        console.log(passport);
        var user = await User.login(passport);

        user = user.toObject();
        user.extra = [ user.username, user.nickname || "", user.head || "", user.type ];
        sess = await Session.getSharedInstance().save(user);

        //set cookies
        var option = { path: Setting.session.cookiePath, expires: new Date(Date.now() + Setting.session.cookieExpireTime) };
        res.cookie("userid", sess.userid, option);
        res.cookie("token", sess.token, option);
        res.cookie("tokentimestamp", sess.tokentimestamp, option);
    } catch (exp) {
        return res.sayError(new Error("username or password is wrong."));
    }

    res.sayOK(sess);
}


