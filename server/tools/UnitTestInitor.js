/**
 * Created by YDY on 2016/1/26.

 注意：
 当在linux上运行
 #sh runtest.sh
 出现如下出错提示时：
 /home/svn/taodi/test/magicfish_web/App.js:29
 if (!global.APP_ROOT) global.APP_ROOT = PATH.parse(process.mainModule.file
 ^
 TypeError: Object #<Object> has no method 'parse'
 at new App (/home/svn/taodi/test/magicfish_web/App.js:29:50)
 at Object.<anonymous> (/home/wwwroot/taodi/test/test/test/UnitTestInitor.js:19:11)

 将第18行global.APP_ROOT = __dirname.substring(0, __dirname.lastIndexOf("\\"));中的"\\"改为"/"即可正常运行。
 */

//global.APP_ROOT = __dirname.substring(0, __dirname.lastIndexOf("\\"));

var PATH = require("path");

var folderPath = PATH.dirname(module.filename);
folderPath = PATH.normalize(folderPath + "/../../");
global.APP_ROOT = folderPath;

var APP = require("weroll/App");
var app = new APP();

if (global.VARS.target) global.ENV = global.VARS.target;
else global.ENV = "localdev";