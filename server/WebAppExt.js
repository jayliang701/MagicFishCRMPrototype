/**
 * Created by Jay on 2016/3/8.
 */

var Session = require("weroll/model/Session");

exports.extend = function(webApp) {
    /* example codes to implement user session validation */
    webApp.handleUserSession = function(req, res, next, error, auth) {
        var user = { isLogined:false };
        var userid = auth ? auth.userid : null;
        if (userid) {
            var token = auth ? auth.token : null;
            var tokentimestamp = Number(auth ? auth.tokentimestamp : 0);
            if (!token || !tokentimestamp || tokentimestamp <= 0) {
                //no cookies...
                next(0, user);
            } else {
                Session.getSharedInstance().check(userid, token, function(err, sess) {
                    if (err) {
                        error(err, user);
                    } else {
                        if (sess) {
                            user.isLogined = true;
                            user.id = userid;
                            user._id = userid;
                            user.userid = userid;
                            user.token = token;
                            user.tokentimestamp = tokentimestamp;
                            //parse user extra data
                            if (sess.extra) {
                                user.username = sess.extra[0];
                                user.nickname = sess.extra[1];
                                user.email = sess.extra[2];
                                user.phone = sess.extra[3];
                            }
                            user.type = parseInt(sess.type);
                            next(1, user);
                        } else {
                            next(0, user);
                        }
                    }
                });
            }
        } else {
            next(0, user);
        }
    }
}