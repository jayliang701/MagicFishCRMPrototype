/**
 * Created by Jay on 3/21/2016.
 */
var Utils = require("weroll/utils/Utils");
var Model = require("weroll/model/Model");
var Redis = require("weroll/model/Redis");

var proc;

exports.init = function(invoker) {
    proc = invoker;
}

var TABLES =  [
    'User'
];

function findTheTopOne(target, callBack) {
    target = global[target];

    var find1 = function(len, done) {
        if (len <= 0) {
            done(null, 0);
            return;
        }
        target.count({_id:{ $regex:"^[0-9]{" + len + "}$" }}).exec(function(err, num) {
            if (err) done(err);
            else {
                if (num == 0) {
                    //again
                    find1(len - 1, done);
                } else {
                    //found
                    done(null, len);
                }
            }
        });
    }

    var find2 = function(len, done) {
        if (len <= 0) {
            done(null, null);
            return;
        }
        target.find({_id:{ $regex:"^[0-9]{" + len + "}$" }}).sort({_id:-1}).limit(1).exec(function(err, docs) {
            done(err, docs ? docs[0] : null)
        });
    }

    find1(9, function(err, len) {
        if (err) callBack(err);
        else {
            find2(len, function(err, doc) {
                callBack(err, doc);
            });
        }
    });
}

exports.do = function(table) {
    var tables = [];

    if (!table) {

        tables = [].concat(TABLES);
    } else {
        tables = [ table ];
    }

    var check = function(TableName, callBack) {

        findTheTopOne(TableName, function(err, topOne) {
            if (err) callBack(err);
            else {
                var topUUID = Number(topOne ? topOne._id : 0) || 0;

                var key = Redis.join("incremental_id");
                Redis.do("HDEL", [ key, TableName ], function(err, res) {
                    if (err) {
                        callBack(err);
                    } else {
                        Redis.do("HINCRBY", [ key, TableName, topUUID ], function(err, res) {
                            if (!err) console.log(TableName + " --> done, the last id is ---> " + topUUID);
                            callBack(err);
                        });
                    }
                });
            }
        });
    }

    var q = [];
    q.push(function(cb) {
        var MongoDB = require("weroll/model/MongoDB");
        var DAOFactory = require("weroll/dao/DAOFactory");
        DAOFactory.init(MongoDB.getDBByName(null) , { folder:require('path').join(global.APP_ROOT, "server/dao") });
        DAOFactory.releaseDBLocks( function(err) {
            cb(err);
        });
    });
    tables.forEach(function(dname) {
        q.push(function(cb) {
            var Schema = null;
            try {
                Schema = global.requireModule("dao/" + dname + "Schema");
            } catch (exp) {
                console.error("require module error ---> " + exp.toString());
                cb();
                return;
            }
            var TableName = Schema().name;
            if (!TableName) {
                cb("no such Data");
                return;
            }

            check(TableName, function(err) {
                if (err) console.log(`${TableName} sync error ----> ${err.toString()}`);
                else console.log(`${TableName} is synced...`);
                cb(err);
            });
        });
    });
    runAsQueue(q, function(err) {
        process.done(err);
    });
}