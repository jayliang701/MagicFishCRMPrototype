/**
 * Created by jay on 30/01/2017.
 */
var Profiler = require("weroll/utils/Profiler");

exports.do = function(name, cmd) {
    var profiler = new Profiler({ name:name });
    if (cmd == "clean") {
        return profiler.clean(function(err) {
            process.done(err);
        });
    }
    profiler.view(function(err, result) {
        if (result) {
            console.log(`total requests: ${result.total}`);
            console.log(`avg request time: ${result.avg}ms`);
            console.log(`max request time: ${result.max}ms`);
        }
        process.done(err);
    }, function(obj) {
        console.log(`${obj.target} ---> count: ${obj.count}     avg: ${obj.avg}ms     min: ${obj.min}ms     max: ${obj.max}ms`);
    });
}