/**
 * Created by Jay on 2017/12/6.
 */
'use strict';
var AdminApp = function(options) {

    // Default Settings
    var settings = {};
    var defaults = {
        disableLayout:          false,
        disableTopbar:          false,
        disableNavbar:          false,
        disableSidebar:         false,
        assignActiveSidebar:    true,
        assignActiveBreadcrumb: true,
    };

    // Shared Vars
    var breadcrumbs = $('#breadcrumb');
    var sidebarLeft = $('#sidebar_left');
    var sidebarMenu = sidebarLeft.find('.sidebar-menu');

    var autoMatchMenus = function() {

        // Find Active Left Sidebar Menu Item
        // var activeSidebar = $('#sidebar_left').find('.menu-open').siblings('.sub-nav').find('.active');
        // var activeSidebarLink = activeSidebar.children('a').attr('href');

        // Find Current URL page/slug
        var urlSlug = window.location.pathname;
        if (urlSlug.substring(0, 1) == '/') { urlSlug = urlSlug.substring(urlSlug.lastIndexOf("/") + 1); }

        // Find Sidebar link that matches the url slug
        var sidebarSlug = sidebarMenu.find('a[href="'+ urlSlug +'"]');

        // Assign Active Sidebar Menu Item
        if ( sidebarSlug.length && settings.assignActiveSidebar === true ) {
            sidebarSlug.parent('li').addClass('active').parents('ul').siblings('.accordion-toggle').addClass('menu-open');
        }

        // Assign Active Breadcrumb Item
        if ( sidebarSlug.length && settings.assignActiveBreadcrumb === true ) {
            var activeCrumb = breadcrumbs.find('.crumb-trail a');
            activeCrumb.attr('href', sidebarSlug.attr('href')).html(sidebarSlug.text());
        }
    }

    return {
        init: function(options) {

            // Extend Default Options and expose to Core for shared yet scoped use
            settings = $.extend({}, defaults, options);

            // Run Init Functions
            autoMatchMenus();

            //setup
            Core.init();
        }
    }
}();