/**
 * Created by Jay on 2016/3/7.
 */
var Schema = require("weroll/dao/DAOFactory").Schema;
var CODES = require("weroll/ErrorCodes");
var Model = require('weroll/model/Model');

var COLLECTION_NAME = "User";

var PASSWORD_SALT = "MagicFish@SH";

module.exports = function() {
    var schema = new Schema({
        _id: String,
        username: { type:String, index:true, required:true },
        pwd: { type:String, required:true },
        phone: { type:String, index:true, optional:true },
        email: { type:String, index:true, optional:true },
        nickname: { type:String, index:true, required:true },
        gender: { type:Number, default:1, optional:true },
        head: { type:String, optional:true },
        type: { type:Number, default:100 },
        createTime: { type:Number, default:0 },
        lastLoginTime: { type:Number, default:0 },
        status: { type:Number, default:1 }
    }, { collection:COLLECTION_NAME, strict: false });

    //用户数据创建前的唯一性验证
    schema.pre("save", function(next) {
        var data = this;
        data.set("createTime", Date.now());

        var opts = [ ];
        var phone = data.get("phone");
        if (String(phone).hasValue()) opts.push({ phone:phone });

        var email = data.get("email");
        if (String(email).hasValue()) opts.push({ email:email });

        var username = data.get("username");
        if (String(username).hasValue()) opts.push({ username:username });

        var query = schema.$ModelClass.findOne({ $or:opts });
        query.select("phone email username");
        query.exec(function (err, obj) {
            if (err) return next(Error.create(CODES.DB_ERROR, err.toString()));
            if (obj) {
                next(Error.create(CODES.DATA_EXISTED, `${COLLECTION_NAME} exists`));
            } else {
                //创建UUID
                Model.generateIncrementalID(COLLECTION_NAME, function(err, uuid) {
                    if (err) return next(err.code ? err : Error.create(CODES.DB_ERROR, err.toString()));
                    data.set("_id", uuid);
                    data.set("pwd", md5(uuid + PASSWORD_SALT + data.get("pwd")));
                    next();
                });
            }
        });
    });

    schema.static("login", function(passport, callBack) {
        var ins = this;
        return new Promise(function(resolve, reject) {
            //允许使用username,email或phone登录
            var opts;
            if (String(passport._id).hasValue()) {
                opts = { _id : passport._id };
            } else if (String(passport.username).hasValue()) {
                opts = { username : passport.username };
            } else if (String(passport.email).hasValue()) {
                opts = { email : passport.email };
            } else if (String(passport.phone).hasValue()) {
                opts = { phone : passport.phone };
            }

            var fields = "_id pwd username nickname email phone head type status lastLoginTime";
            ins.findOne(opts).select(fields).exec(function(err, doc) {
                if (doc && doc.get("pwd") == md5(doc._id + PASSWORD_SALT + passport.pwd)){
                    callBack ? callBack(null, doc) : resolve(doc);
                } else {
                    //用户不存在或密码不正确, 登录失败
                    err = err ? Error.create(CODES.DB_ERROR, err.toString()) : Error.create(CODES.DATA_NOT_EXISTED, "no such User");
                    callBack ? callBack(err) : reject(err);
                }
            });
        });
    });

    //firstUUID 设定自增的UUID从什么数字开始
    return { name:COLLECTION_NAME, ref:schema, firstUUID:1000 };
}