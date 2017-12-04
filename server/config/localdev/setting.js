/**
 * Created by Jay on 14-5-4.
 */
module.exports = {

    env:"localdev",

    host:"localhost",
    port:3000,

    compress:{
        api:false, //or false,  true -> use MsgPack,   false -> use json
    },

    model: {
        /* mongodb connection config */
        db: {
            host:"127.0.0.1",
            port:27017,
            name:"weroll_website",
            option: {
                driver:"mongoose",  //or "native"
                server: {
                    reconnectTries: Number.MAX_VALUE,
                    poolSize: 5,
                    socketOptions: { keepAlive: 120 }
                }
            }
        },
        /* redis connection config  */
        redis: {
            host:"127.0.0.1",
            port:6379,
            prefix:{
                "*": "weroll_website_",
                common: "weroll_common_"
            },
            ttl:24 * 60 * 60,  //sec,
            pass:"",
            maxLockTime:2 * 60,  //sec
            releaseLockWhenStart: true
        }
    },

    session: {
        /* user access session config. enable redis first */
        onePointEnter:false,
        cookiePath:"/",
        cacheExpireTime:3 * 60,  //sec
        tokenExpireTime:24 * 60 * 60,  //sec
        cookieExpireTime:24 * 60 * 60 * 1000  //million sec
    },
    /* update service config */
    upload: {
    },

    //site domain
    site:"http://localhost:3000/",
    siteName:"weroll_website",
    /* mail service config
    mail: {
        stamp: {
            user:"developer@magicfish.cn",
            password:"aabbcc",
            host:"smtp.xxxxx.com",
            port:465,
            ssl:true
        },
        sender:"developer@magicfish.cn",
        senderName:"developer"
    },
    */
    /* SMS service config */
    sms:{
        //some SMS service configuration
        simulate:true   //simulate send SMS without real world service
    },
    cdn:{
        res:"http://localhost:3000"
    },
    /* Ecosystem config
    ecosystem: {
        name: "mini",
        port: 3001,
        servers : {
            "test" : {
                message:"127.0.0.1:3101",
                api:"127.0.0.1:3100/api"
            }
        }
    }
    */
};
