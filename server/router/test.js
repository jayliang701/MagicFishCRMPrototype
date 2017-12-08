var Setting = global.SETTING;
var Utils = require("weroll/utils/Utils");

function renderTestPage(req, res, output, user) {
    output({ msg:"hello!" });
}

exports.getRouterMap = function() {
    return [
        { url: "/test_form", view: "test_form", handle: renderTestPage, needLogin:false }
    ];
}
