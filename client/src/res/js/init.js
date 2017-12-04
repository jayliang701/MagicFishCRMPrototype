/**
 * Created by Jay on 2017/12/3.
 */
(function() {

    NProgress.set(0.7);

    window.RootStore = {};

    function loadDependency() {
        var total = 0;
        var loaded = 0;
        $('body > vue').each(function () {
            var src = $(this).attr('src');
            if (src) {
                total ++;
                $.getScript(src, function () {
                    console.log('load dependency -->', src);
                    loaded ++;
                    NProgress.set(0.7 + 0.3 * loaded / total);
                    if (loaded >= total) {
                        setup();
                    }
                });
            }
        });
        console.log('found ' + total + ' dependencies.');
        if (total == 0) return setup();
    }

    function setup() {

        var defaultInitor = {
            el: '.root',
            delimiters: ['[[', ']]'],
            data:{},
            methods:{ }
        };
        if (window.$user) {

            var basicUserOperation = {
                login:function(account, pwd, code, callBack) {
                    $callAPI("user.login", { account:account, pwd:pwd, code:code }, function(sess) {
                        callBack && callBack(null, sess);
                    }, function(code, msg) {
                        callBack && callBack(msg);
                    });
                }
            }
            defaultInitor.methods = Object.assign({}, defaultInitor.methods, basicUserOperation);

            defaultInitor.data.user = Object.assign({}, window.$user);
            window.$user = undefined;
            $('body > script[inject=user]').remove();
        }
        for (var key in defaultInitor) {
            var val = defaultInitor[key];
            if (val && typeof val == 'object') {
                window.RootModel[key] = Object.assign({}, val, window.RootModel[key]);
            }
        }
        window.RootApp = new Vue(Object.assign({}, defaultInitor, window.RootModel));
        console.log('vue app is inited.');
        NProgress.done(true);
        $('body > .root').css('display', 'block');
    }

    loadDependency();
})();