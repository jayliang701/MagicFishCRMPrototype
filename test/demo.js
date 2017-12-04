/**
 * Created by YDY on 2016/3/2.
 */


var assert = require("assert");

describe('demo',function() {

    before(function (done) {
        //do something you need before run test cases.
        done();
    });

    //each it code block is a test case
    it('demo case', function(done){
        //do something to test
        var name = "Jay";
        assert.equal(name, "Jay");
        done();
    });

});
