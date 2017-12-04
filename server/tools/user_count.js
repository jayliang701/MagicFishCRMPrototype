/**
 * Created by Jay on 2016/10/24.
 */
var Model = require("weroll/model/Model");

exports.do = function(date1, date2) {
    var filter = {};
    if (date1) {
        date1 = parseDate(date1);
        if (date2) {
            //user count in date1 ~ date2
            date2 = parseDate(date2);
            filter.createTime = { $gte:date1.getTime(), $lte:date2.getTime() };
        } else {
            //use count in date1
            filter.createTime = { $gte:date1.getTime(), $lte:date1.getTime() + 24 * 60 * 60 * 1000 };
        }
    } else {
        //all user count
    }

    Model.DB.count("User", filter, function(err, count) {
        process.done(err ? err : `user count: ${count}`);
    });
}

function parseDate(date) {
    var year = date.substr(0, 4);
    var month = date.substr(4, 2);
    var day = date.substr(6, 2);
    return new Date(year, month, day, 0, 0, 0, 0);
}
