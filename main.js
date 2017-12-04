/**
 * Created by Jay on 14-4-30.
 */
var App = require("weroll/App");
var app = new App();

var Setting = global.SETTING;
var Model = require("weroll/model/Model");

app.addTask(function(cb) {
    Model.init(Setting.model, function(err) {
        cb(err);
    });
});
app.addTask(function(cb) {
    var DAOFactory = require("weroll/dao/DAOFactory");
    DAOFactory.init(Model.getDBByName(), function(err) {
        cb(err);
    });
});
app.addTask(function(cb) {
    /* initialize SMS service */
    var SMSUtil = require("weroll/utils/SMSUtil");
    SMSUtil.init(Setting.sms);
    /** custom your SMS service
    var MyProxy = {};
    MyProxy.send = async function(phone, msg, option, callBack) {
        //send ...
        //then callback
        callBack();
    };
    SMSUtil.setProxy(MyProxy);
     */

    /* initialize TemplateLib */
    var TemplateLib = require("weroll/utils/TemplateLib");
    TemplateLib.init({ site:Setting.site, siteName:Setting.siteName });

    cb();
});
app.addTask(function(cb) {
    /* enable CORS
    require("weroll/web/WebRequestPreprocess").inject("head", function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Authorization, Accept, X-Requested-With");
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        next();
    });
    */
    /* custom view engine if you need, e.g: use ejs
    Setting.viewEngine = {
        //webApp: an instance of Express
        init: function(webApp, viewPath, useCache) {
            var engine = {};
            engine.$setFilter = function(key, func) {
                //do nothing
            };
            webApp.set('view engine', 'ejs');
            console.log("use view engine: ejs");
            return engine;
        }
    };
    */
    //create and start a web application
    var webApp = require("weroll/web/WebApp").start(Setting, function(webApp) {
        /* setup Ecosystem if you need
        var Ecosystem = require("weroll/eco/Ecosystem");
        Ecosystem.init();
         */
        cb();
    });
    //extend WebApp if you need
    require("./server/WebAppExt").extend(webApp);
});

app.run();