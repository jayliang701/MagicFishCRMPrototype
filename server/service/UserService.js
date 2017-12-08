/**
 * Created by Jay on 4/1/15.
 */

exports.config = {
    name: "user",
    enabled: true,
    security: {
        //@login 账户登录 @account 账号 @pwd 密码 @code 验证码
        "login":{ needLogin:false, checkParams:{ account:"string", pwd:"string" }, optional:{ code:"string" } },
        //@checkPhoneExist 检查使用某个手机号的账户是否存在 @phone 手机号
        "checkPhoneExist":{ needLogin:false, checkParams:{ phone:"string" } }
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

exports.checkPhoneExist = async function(req, res, params, user) {
    var result = { exists:0 };
    try {
        var uobj = await User.findOne({ phone:params.phone }, "_id");
        if (uobj) result.exists = 1;
    } catch (err) {
        return res.sayError(err);
    }
    setTimeout(function () {
        res.sayOK(result);
    }, 5000);
}


