var Setting = global.SETTING;
var Utils = require("weroll/utils/Utils");

function renderIndexPage(req, res, output, user) {
    output({ msg:"hello!" });
}

exports.getRouterMap = function() {
    return [
        { url: "/", view: "index", handle: renderIndexPage, needLogin:false },
        { url: "/index", view: "index", handle: renderIndexPage, needLogin:false },
        { url: "/login", view: "login", handle: renderIndexPage, needLogin:false },
        { url: "/test", view: "test", handle: renderIndexPage, needLogin:false }
    ];
}
