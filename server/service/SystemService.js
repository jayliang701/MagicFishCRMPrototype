/**
 * Created by Jay on 4/1/15.
 */

exports.config = {
    name: "system",
    enabled: true,
    security: {
        //@now 获得服务器当前时间 @format 时间格式,1 - 时间戳,2 - 字符串
        "now":{ needLogin:false, checkParams:{ format:"int" } }
    }
};

var CODES = require("weroll/ErrorCodes");

exports.now = function(req, res, params) {
    var format = params.format;
    if (format == 1 || format == 2) {
        var now = new Date();
        if (format == 1) {
            now = now.getTime();
        } else {
            now = now.toString();
        }
        res.sayOK({ time:now });
    } else {
        res.sayError(CODES.REQUEST_PARAMS_INVALID, "invalid time format");
    }
}


