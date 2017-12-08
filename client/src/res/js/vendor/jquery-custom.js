/**
 * Created by Jay on 2017/12/7.
 */
(function() {
    $.fn.showLoading = function() {
        var btn = $(this);
        if (btn.isLoading()) return;
        btn.addClass('disabled');
        btn.attr('original-content', btn.html());
        btn.attr('status-loading', 'true');
        var bw = btn.width();
        var bh = btn.height();
        //var spinner = $('<span class="loading-spinner"></span>');
        var spinner = '<object data="' + window.RES_CDN_DOMAIN + '/img/loading-white.svg" width="' + bw + '" height="' + bh + '" type="image/svg+xml" pluginspage="http://www.adobe.com/svg/viewer/install/"  />';
        btn.html(spinner);
    };

    $.fn.stopLoading = function() {
        var btn = $(this);
        var text = btn.attr('original-content');
        if (!text) return;
        btn.removeClass('disabled');
        btn.removeAttr('status-loading');
        btn.html(text);
    };

    $.fn.isLoading = function() {
        var btn = $(this);
        var status = btn.attr('status-loading');
        if (status) {
            return true;
        }
        return false;
    };
})();