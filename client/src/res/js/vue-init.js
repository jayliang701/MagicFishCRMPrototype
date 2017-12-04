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
            delimiters: ['[[', ']]']
        };
        window.RootApp = new Vue(Object.assign({}, defaultInitor, window.RootModel));
        console.log('vue app is inited.');
        NProgress.done(true);
        $('body > .root').css('display', 'block');
    }

    loadDependency();
})();