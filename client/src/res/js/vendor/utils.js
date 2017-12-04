/**
 * Created by Jay on 04/12/2017.
 */
var queryParams = parseUrlQueryString();

var WEEK_DAY_CN = [ '周日', '周一', '周二', '周三', '周四', '周五', '周六' ];

try {
    var now = Date.now();
} catch (err) {
    Date.now = function() {
        return new Date().getTime();
    }
}

if (!Object.prototype.hasOwnProperty) {
    Object.prototype.hasOwnProperty = function(key) {
        return this[key] != null && this[key] != undefined;
    }
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }
        var O = Object(this);
        var len = O.length >>> 0; // Hack to convert O.length to a UInt32
        if ({}.toString.call(callback) != "[object Function]") {
            throw new TypeError(callback + " is not a function");
        }
        if (thisArg) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length >>> 0;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) from += len;
        for (; from < len; from++) {
            if (from in this && this[from] === elt) return from;
        }
        return -1;
    };
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+/g, "");
    }
}

String.prototype.fillData = function(key, value) {
    return this.replace(new RegExp("\\{" + key + "\\}", "g"), value);
}

String.prototype.hasValue = function() {
    return this != "undefined" && this != "null" && this != "";
}

function dec2bin(num){
    if(isNaN(num))return;
    return parseInt(num,10).toString(2);
}

function trace(str) {
    if (window.console && window.console.log) {
        window.console.log(str);
    }
}

function parseUrlQueryString(){
    var vars = {}, hash;
    var url = window.location.href;
    if (url.indexOf('#') > 0) {
        url = url.substring(0, url.lastIndexOf('#'));
    }
    var index = url.indexOf('?');
    if (index < 0) return vars;


    var hashes = url.slice(index + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        //vars.push(hash[0]);
        if (!hash[0] || hash[0] == "" || hash[0] == "null") continue;
        vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
}

function $getCookie(key) {
    var opt = { };
    if (window.COOKIE_PATH) opt.path = window.COOKIE_PATH;
    return $.cookie(key, undefined, opt);
}

function $setCookie(key, val, expire) {
    var opt = { };
    if (window.COOKIE_PATH) opt.path = window.COOKIE_PATH;
    if (Number(expire) > 0) {
        opt.expires = expire;
    }
    $.cookie(key, val, opt);
}

function $delCookie(key) {
    var opt = { };
    if (window.COOKIE_PATH) opt.path = window.COOKIE_PATH;
    $.removeCookie(key, opt);
}

function $callAPILazy(method, data, onSuccess, onError, showLoading) {
    if (showLoading && window.$callAPILoading) {
        window.$callAPILoading(true);
    }
    setTimeout(function() {
        $callAPI(method, data, onSuccess, onError, showLoading);
    }, 300 + Math.random() * 700);
}

function $callAPIStack(reqs, onSuccess, onError, showLoading, errorStop) {
    var CODE;
    var MSG;

    if (showLoading && window.$callAPILoading) {
        window.$callAPILoading(true);
    }

    var doNext = function() {
        if (reqs.length == 0) {
            if (CODE > 1) {
                if (onError) onError(CODE, MSG);
            } else {
                if (onSuccess) onSuccess();
            }

            if (showLoading && window.$callAPILoading) {
                window.$callAPILoading(false);
            }
        } else {
            var workingReq = reqs.shift();
            if (!workingReq[1]) workingReq[1] = {};
            $callAPI(workingReq[0], workingReq[1], function(data) {
                if (workingReq[2]) workingReq[2](data);
                doNext();
            }, function(code, msg) {
                CODE = code;
                MSG = msg;
                if (workingReq[3]) workingReq[3](code, msg);
                if (!errorStop) doNext();
            });
        }
    }
    doNext();
}

function $callAPI(method, data, onSuccess, onError, showLoading) {
    trace('>> request send ==> ' + method);
    if (showLoading && window.$callAPILoading) {
        window.$callAPILoading(true);
        trace('show loading...');
    }

    var auth = {};
    var userid = $getCookie("userid");
    if (userid) auth.userid = userid;

    var token = $getCookie("token");
    if (token) auth.token = token;

    var tokentimestamp = $getCookie("tokentimestamp");
    if (tokentimestamp) auth.tokentimestamp = tokentimestamp;

    var params = {};
    params.method = method;
    params.data = data;
    params.auth = auth;

    $.ajax({
        type: "post",
        url: API_GATEWAY,
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        xhrFields : {
            responseType : window.API_COMPRESS ? 'arraybuffer' : 'text'
        },
        data: JSON.stringify(params),
        success: function (data, status, xhr) {
            if (data instanceof ArrayBuffer) data = msgpack.decode(new Uint8Array(data));
            if (data.code == 1) {
                if (onSuccess) {
                    onSuccess(data.data);
                }
            } else {
                var err = 'API调用错误 ==> [' + data.code + '] - ' + data.msg;
                trace(err);
                if (data.code < 1000) {
                    if (window.__callAPIFatalError) {
                        window.__callAPIFatalError(data.msg, data.code);
                    }
                }
                if (onError && typeof onError == 'function') {
                    onError(data.code, data.msg);
                } else if (window.__callAPIError) {
                    window.__callAPIError(err);
                }
            }

            if (showLoading && window.$callAPILoading) {
                window.$callAPILoading(false);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            trace('API调用错误 ==> status: ' + textStatus + '      error: ' + errorThrown);

            if (onError && typeof onError == 'function') {
                var flag = onError(-1, 'network connection error');
                if (flag != true && window.__callAPIFatalError) {
                    window.__callAPIFatalError('API调用错误 ==> status: ' + textStatus + '      error: ' + errorThrown);
                }
            }

            if (showLoading && window.$callAPILoading) {
                window.$callAPILoading(false);
            }
        }
    });
}