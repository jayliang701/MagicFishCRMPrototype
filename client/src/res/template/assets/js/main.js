'use strict';
/*! main.js - v0.1.1
 * http://admindesigns.com/
 * Copyright (c) 2017 AdminDesigns
 * Core function required for critical theme operation */
var Core = (function() {

    // Default Settings
    var usersettings = {}
    var settings = {}
    var defaults = {
        sbl: "sb-l-o", // sidebar left open onload
        sbr: "sb-r-c", // sidebar right closed onload
        sbState: "save", //Enable localstorage for sidebar states
        collapse: "sb-l-m", // sidebar left collapse style
        siblingRope: true // True reopens left sidebar upon right sidebar closing
    };

    // Core Selector Vars
    var Window = $(window);
    var Body = $('body');
    var Navbar = $('.navbar');
    var Topbar = $('.content-topbar');
    var Content = $('#content');
    var sidebarLeft = $('#sidebar_left');
    var sidebarRight = $('#sidebar_right');

    // Scroller Vars
    var hasScroller = $('.sidebar');
    var hasLeftScroller = sidebarLeft.find(hasScroller);
    var hasRightScroller = sidebarRight.find(hasScroller);
    var hasPanelScrollers = $('.panel-scroller');
    var hasHiddenScrollers = hasPanelScrollers.parents('.dropdown');

    // Nano Scroller Vars
    var scrollerOptions = {
        paneClass:    'sidebar-pane',
        sliderClass:  'sidebar-slider',
        contentClass: 'sidebar-content',
        activeClass:  'has-scroller',
        sliderMaxHeight: 600,
        preventPageScrolling: true
    }

    // Mobile Settings
    var mobileTopWidth =  900;
    var mobileCollapse =  600;  // should match resolution var in theme_settings.less
    var mobileWidth    =  1300; // should match resolution var in theme_settings.less


    // SideMenu Functions
    var runSidebar = function() {
        var sidebarMenu = $('ul.sidebar-menu');

        // Sidebar state naming conventions: Same naming convention applies to right sidebar
        // "sb-l-o" - SideBar Left Open
        // "sb-l-c" - SideBar Left Closed
        // "sb-l-m" - SideBar Left Minified

        // Sidebar Onload Setup
        sidebarOnLoad();
        runScrollers();

        // Sidebar Variables
        var hasSBTop = Body.hasClass('sb-top');

        // Sidebar Handlers
        $("[data-menu-toggle=sidebar_top]").on('click', sidebarTopToggle);
        $("[data-menu-toggle=sidebar_right]").on('click', sidebarRightToggle);
        $("[data-menu-toggle=sidebar_left]").on('click', sidebarLeftToggle);
        $("[data-menu-toggle=sidebar_left_mini]").on('click', sidebarLeftMiniToggle);
        $("[data-menu-toggle=sidebar_left_user]").on('click', sidebarLeftUserToggle);

        // Sidebar Menu Handlers
        sidebarMenu.find('a.accordion-toggle').on('click', sidebarLeftMenuToggle);

        // Window debounced resize handler. Prevents functions from firing
        // excessively by waiting until the window has finished resizing
        Window.on('resize', _debounce(function() {
            sidebarOnResize();
        }, 300));

        // SideBar Left Toggle Function
        function sidebarLeftToggle() {

            // If sidebar is set to Horizontal we return
            if (hasSBTop) { return; }

            // We check to see if the the user has closed the entire
            // leftside menu. If true we reopen it, this will result
            // in the menu resetting itself back to a minified state.
            // A second click will fully expand the menu.
            if (Body.hasClass('sb-l-c') && settings.collapse === "sb-l-m") {
                Body.removeClass('sb-l-c');
            }

            // Toggle sidebar state(open/close)
            Body.toggleClass(settings.collapse).removeClass('sb-r-o').addClass('sb-r-c');

            // Update left sidebar nanoscroller after 300ms delay
            runScrollers(300, hasLeftScroller);
        };

        // SideBar Left Mini Toggle Function
        function sidebarLeftMiniToggle() {
            // e.preventDefault();

            // If sidebar is set to Horizontal we return
            if (Body.hasClass('sb-top')) { return; }

            // Close Menu
            Body.addClass('sb-l-c');

            // After animation has occured we toggle the menu. Upon
            // the menu reopening the classes will be toggled again,
            // effectively restoring the menus state prior to being hidden
            if (!Body.hasClass('mobile-view')) {
                setTimeout(function() {
                    Body.toggleClass('sb-l-m sb-l-o');
                }, 300);
            }

            // Update left sidebar nanoscroller after 300ms delay
            runScrollers(300, hasLeftScroller);
        };

        // SideBar Left Menu Accordion Toggle Function
        function sidebarLeftMenuToggle(e) {
            e.preventDefault();

            // If the clicked menu item is minified and is a submenu (has sub-nav parent) we do nothing
            if (Body.hasClass('sb-l-m') && !$(this).parents('ul.sub-nav').length) { return; }

            // If the clicked menu item is a dropdown we open its menu
            if (!$(this).parents('ul.sub-nav').length) {

                // If sidebar menu is set to Horizontal mode we return
                // as the menu operates using pure CSS
                if (Window.width() > mobileTopWidth && hasSBTop) { return; }

                sidebarMenu.find('a.accordion-toggle.menu-open').next('ul').slideUp('fast', 'swing', function() {
                    $(this).attr('style', '').prev().removeClass('menu-open');
                });
            }
            // If the clicked menu item is a dropdown inside of a dropdown (sublevel menu)
            // we only close menu items which are not a child of the uppermost top level menu
            else {
                var activeMenu = $(this).next('ul.sub-nav');
                var siblingMenu = $(this).parent().siblings('li').children('a.accordion-toggle.menu-open').next('ul.sub-nav')
                activeMenu.slideUp('fast', 'swing', function() {
                    $(this).attr('style', '').prev().removeClass('menu-open');
                });
                siblingMenu.slideUp('fast', 'swing', function() {
                    $(this).attr('style', '').prev().removeClass('menu-open');
                });
            }

            // Now we expand targeted menu item, add the ".open-menu" class
            // and remove any left over inline jQuery animation styles
            if (!$(this).hasClass('menu-open')) {
                $(this).next('ul').slideToggle('fast', 'swing', function() {
                    $(this).attr('style', '').prev().toggleClass('menu-open');
                });
            }

            // Update nanoScroller if needed. Passing Left Sidebar Menu and Desired
            // init delay of 300ms. Timeout to account for animation duration
            runScrollers(300, hasScroller);
        };

        // Sidebar Left User Menu Dropdown Toggle
        function sidebarLeftUserToggle() {
            var authorWidget = sidebarMenu.find('.author-widget');

            // Horizontal menu does not support sidebar widgets
            // so we return and prevent the menu from opening
            if (hasSBTop) { return; }

            // If an author widget is present we let its sibling menu know it's open
            if (authorWidget.hasClass('menu-widget-open')) { authorWidget.toggleClass('menu-widget-open'); }

            // Toggle Class to signal state change
            $('.menu-widget').toggleClass('menu-widget-open').slideToggle('fast');
        };

        // SideBar Right Toggle Function
        function sidebarRightToggle() {

            // If sidebar is set to Horizontal we return
            if (hasSBTop) { return; }

            // toggle sidebar state(open/close)
            if (settings.siblingRope === true && !Body.hasClass('mobile-view') && Body.hasClass('sb-r-o')) {
                Body.toggleClass('sb-r-o sb-r-c').toggleClass(settings.collapse);
            } else {
                Body.toggleClass('sb-r-o sb-r-c').addClass(settings.collapse);
            }

            // Update right sidebar nanoscroller after 300ms delay
            runScrollers(300, hasRightScroller);
        };

        // SideBar Top Toggle Function
        function sidebarTopToggle() {

            // Toggle sidebar state(open/close)
            Body.toggleClass('sb-top-collapsed');
        };

        // Check window size on load
        // Adds/removes "mobile-view" class based on window size
        function sidebarOnLoad() {

            // If sidebar menu is set to Horizontal we add
            // unique custom mobile css classes
            if (hasSBTop) {

                // If window is < 1080px wide collapse both sidebars and add ".mobile-view" class
                if (Window.width() < mobileTopWidth) {
                    Body.addClass('sb-top-mobile').removeClass('sb-top-collapsed');
                }
                return;
            }

            // If window is < 1080px wide collapse both sidebars and add ".mobile-view" class
            if (Window.width() < mobileWidth) {
                Body.removeClass('sb-r-o').addClass('mobile-view sb-l-m sb-r-c');
            }
            if (Window.width() < mobileCollapse) {
                Body.removeClass('sb-r-o sb-r-m').addClass('mobile-view sb-l-c sb-r-c');
            }

            // Check Body for classes indicating the state of Left and Right Sidebar.
            // If not found add default sidebar settings(sidebar left open, sidebar right closed).
            if (!Body.hasClass('sb-l-o') && !Body.hasClass('sb-l-m') && !Body.hasClass('sb-l-c')) {
                Body.addClass(settings.sbl);
            }
            if (!Body.hasClass('sb-r-o') && !Body.hasClass('sb-r-o')) {
                Body.addClass(settings.sbr);
            }

            // Disabled for now - Animation helper that requires more performance investigation
            // if (Body.hasClass('sb-l-m')) { Body.addClass('sb-l-disable-animation'); } else { Body.removeClass('sb-l-disable-animation'); }
        };

        // Check window on resize
        // Adds/removes "mobile-view" class based on window size
        function sidebarOnResize() {

            // If sidebar menu is set to Horizontal mode we return
            // as the menu operates using pure CSS
            if (Body.hasClass('sb-top')) {

                // If window is < mobileTopWidth wide collapse both sidebars and add ".mobile-view" class
                if (Window.width() < mobileTopWidth && !Body.hasClass('sb-top-mobile')) {
                    Body.addClass('sb-top-mobile');
                } else if (Window.width() > mobileTopWidth) {
                    Body.removeClass('sb-top-mobile');
                }
                return;
            }

            // If window is < mobileWidth wide collapse both sidebars and add ".mobile-view" class
            if (Window.width() < mobileWidth && !Body.hasClass('mobile-view')) {
                Body.removeClass('sb-r-o').addClass('mobile-view sb-l-m sb-r-c');
            }
            if (Window.width() < mobileCollapse) {
                Body.removeClass('sb-l-m sb-l-o sb-r-o').addClass('mobile-view sb-l-c sb-r-c');
            }
            // else if (Window.width() > mobileWidth) {  Body.removeClass('mobile-view'); }
            else {
                Body.removeClass('mobile-view');
            }

        };

        // Runs nanoscroller plugin on .sidebar elements
        // optionally accepts an init delay and element
        function runScrollers(timer, ele) {
            var ele = ele ? ele : hasScroller;
            var timer = timer ? timer : 100;

            // If sidebar has transparent style class shorten its height
            if (ele.hasClass('nano-transparent')) { scrollerOptions.sliderMaxHeight = 350; }

            // If sidebar exist init/update it
            if (ele.length) {
                if (timer) {
                    setTimeout(function() {
                        ele.nanoScroller(scrollerOptions);
                    }, timer);
                } else {
                    ele.nanoScroller(scrollerOptions);
                }
            }
        };

        // Destroys nanoscroller instance on .sidebar elements
        // optionally accepts a targeted element
        function destroyScrollers(ele) {
            var ele = ele ? ele : hasScroller;
            var timer = timer ? timer : 100;

            // If scrollbar exist destroy instance
            if (ele.length) {
                if (timer) {
                    setTimeout(function() { ele.nanoScroller({ destroy: true }); }, timer);
                } else {
                    ele.nanoScroller({ destroy: true });
                }
            }
        };
    }

    // DropMenu Function
    var runDropMenu = function() {

        // Sliding Topbar Metro Menu
        var menu = $('#dropmenu');
        var items = menu.find('.metro-tile');
        var metroBG = $('.metro-modal');

        $('.topbar-menu-toggle').on('click', function() {
            bootbox.dialog({
                message: menu,
                backdrop: true,
                onEscape: true,
                className: "dropmenu",
                // size: 'small',
                // animate: false
            });
        });
    }

    // Header Functions
    var runHeader = function() {

        // Searchbar - Mobile modifcations
        $('.navbar-search').on('click', function(e) {

            var This = $(this);
            var searchForm = This.find('input');
            var searchRemove = This.find('.search-remove');

            // Don't do anything unless in mobile mode
            if ($('body.mobile-view').length || $('body.sb-top-mobile').length) {

                // Open search bar and add closing icon if one isn't found
                This.addClass('search-open');
                if (!searchRemove.length) {
                    This.append('<div class="search-remove"></div>');
                }

                // Fadein remove btn and focus search input on animation complete
                setTimeout(function() {
                    This.find('.search-remove').fadeIn();
                    searchForm.focus().one('keydown', function() {
                        $(this).val('');
                    });
                }, 250)

                // If remove icon clicked close search bar
                if ($(e.target).attr('class') == 'search-remove') {
                    This.removeClass('search-open').find('.search-remove').remove();
                }
            }
        });
    }

    // Footer Functions
    var runFooter = function() {

        // Init smoothscroll on page-footer "move-to-top" button if exist
        var pageFooterBtn = $('.footer-return-top');
        if (pageFooterBtn.length) {
            pageFooterBtn.smoothScroll({ offset: -55 });
        }
    }

    // Tray related Functions
    var runTrays = function() {

        // Calculate Height for inner content elements
        // var contentHeight = windowH - (navbarH + topbarH);
        var contentHeight;

        // Match height of tray with the height of body
        var trayFormat = Content.find('.tray');
        if (trayFormat.length) {
            var scrolling = false;

            // Loop each tray and set height to match body
            trayFormat.each(function(i, e) {
                var This = $(e);
                var trayScroll = This.find('.tray-scroller');

                This.height(contentHeight);
                trayScroll.height(contentHeight);
                if (trayScroll.length) {
                    scrolling = true;
                    trayScroll.scroller();
                }
            });

            // If tray scrollers exist ensure overflow is hidden on body
            if (scrolling) Body.addClass('of-y-h');

            // Scroll lock all fixed content overflow
            Content.scrollLock('on', 'div');
        };

        // Perform a custom animation if tray-nav has data attribute
        var navAnimate = $('.tray-nav[data-nav-animate]');
        if (navAnimate.length) {
            var Animation = navAnimate.data('nav-animate');

            // Set default "fadeIn" animation if one has not been previously set
            if (Animation == null || Animation == true || Animation == "") { Animation = "fadeIn"; }

            // Loop through each li item and add animation after set timeout
            setTimeout(function() {
                navAnimate.find('li').each(function(i, e) {
                    var Timer = setTimeout(function() {
                        $(e).addClass('animated animated-short ' + Animation);
                    }, 50 * i);
                });
            }, 500);
        }

        // Responsive Tray Javascript Data Helper. If browser window
        // is <575px wide (extreme mobile) we relocate the tray left/right
        // content into the element appointed by the user/data attr
        var dataTray = $('.tray[data-tray-mobile]');
        var dataAppend = dataTray.children();

        function fcRefresh() {
            if (Body.width() < 1200) {
                // dataAppend.appendTo($(dataTray.data('tray-mobile')));
                dataAppend.prependTo($(dataTray.data('tray-mobile')));

            }
            else {
                // dataAppend.appendTo(dataTray);
                dataAppend.prependTo(dataTray);
            }
            // console.log('fcr ran');
        };

        // Check on load if the trays need to be modified for mobile use
        fcRefresh();
        if (!Body.hasClass('disable-tray-rescale')) {
            if (Window.width() < 1000) { Body.addClass('tray-rescale'); } else { Body.removeClass('tray-rescale tray-rescale-left tray-rescale-right'); }
        }

        // Check on resize if the trays need to be modified for mobile use
        Window.on('resize', _debounce(function() {
            fcRefresh();
        }, 300));

    }

    // Form related Functions
    var runFormElements = function() {

        var btnStates = $('.active-toggle');
        var dropdownMenus = $('.dropdown-menu');
        var bsTooltips = $("[data-toggle=tooltip]");
        var bsPopovers = $("[data-toggle=popover]");
        var SmoothScroll = $('[data-smoothscroll]');

        // Init Bootstrap Popovers, if present
        if (bsPopovers.length) {
            bsPopovers.popover();
        }

        // Init Bootstrap tooltips, if present
        if (bsTooltips.length) {
            if (bsTooltips.parents(sidebarLeft)) {
                bsTooltips.tooltip({
                    container: Body,
                    animation: false,
                    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
                });
            } else { bsTooltips.tooltip(); }
        }

        // Init smoothscroll on elements with set data attr
        // data value determines smoothscroll offset
        if (SmoothScroll.length) {
            SmoothScroll.each(function(i, e) {
                var This = $(e);
                var Offset = This.data('smoothscroll');
                var Links = This.find('a');

                // Init Smoothscroll with data stored offset
                Links.smoothScroll({ offset: Offset });
            });
        }

        // if btn has ".btn-states" class we monitor it for user clicks. On Click we remove
        // the active class from its siblings and give it to the button clicked.
        // This gives the button set a menu like feel or state
        if (btnStates.length) {
            btnStates.on('click', function(e) {
                var Target = $(e.target);
                $(this).find('.active').filter('a, button').removeClass('active');

                if (Target.is('button') || Target.is('a')) {
                    Target.addClass('active');
                }
            });
        }

        // Init Dropdown Related functionality
        dropdownMenus.on('click', function(e) {
            var Elem = $(this);
            var Target = $(e.target);

            // If This is a Dropdown Tabs Menu Button - Nav Tabs must be <a> links
            // Not sure if this even exists in theme. Pending removal
            if (Target.parents('.nav-tabs').length && Target.is('a')) {
                e.preventDefault();
                e.stopPropagation();
                Target.tab('show');
            }

            // If This is a Dropdown Tabs Menu Group - Btn Tabs must contain data-target
            if (Target.parents('.btn-group-nav').length && Target.data('target')) {
                e.preventDefault();
                e.stopPropagation();

                // Remove active class from btn-group > btns and toggle tab content
                Elem.find('.active').removeClass('active');
                Target.addClass('active').tab('show');
            }

            if (Target.parents('.nav-pills').length && Target.is('a')) {
                e.preventDefault();
                e.stopPropagation();
                Target.tab('show');
            }

            // Modify if the dropdown handler contains the persist helper class
            if (Elem.hasClass('dropdown-persist')) {
                e.stopPropagation();
            }

            // Dropdown with checkbox propagation handling - Disabled
            // If This is a Dropdown Tabs Menu Group - Btn Tabs must contain data-target
            // if ( Elem.hasClass('dropdown-persist') && Target.is('[type="checkbox"]') ) {
            //     // Target.find(':checkbox').click()
            //     // var dropdownCheckbox = Elem.find('[type="checkbox"]');
            //     // dropdownCheckbox.prop('checked', dropdownCheckbox[0].checked);
            // }

        });

        // If a panel element has the ".panel-scroller" class we init
        // custom fixed height content scroller. An optional delay data attr
        // may be set. This is useful when you expect the panels height to
        // change due to a plugin or other external modification.
        // var hasPanelScrollers = $('.panel-scroller');
        var hasPanelScrollers = $('.panel-scroller');
        var hasHiddenScrollers = hasPanelScrollers.parents('.dropdown');

        // Update Hidden Panel Scrollbars on display toggle(popups, dropdowns, etc)
        hasHiddenScrollers.on('shown.bs.tab', activeHiddenScroller);
        hasHiddenScrollers.on('shown.bs.dropdown', activeHiddenScroller);

        if (hasPanelScrollers.length) {
            hasPanelScrollers.each(function(i, e) {
                var This = $(e);
                var Delay = This.data('scroller-delay');

                // Check if scroller bar is in a dropdown, if so return. These are init on open
                if (This.parents('.dropdown-menu').length) { return; }

                // Check if scroller bar margin is required
                var Margin = 5;
                if (This.hasClass('scroller-thick')) { Margin = 0; }

                // Otherwise check to see if a delay has been set
                // and init scroller + window lock
                if (Delay) {
                    var Timer = setTimeout(function() {
                        This.scroller({ trackMargin: Margin });
                        Content.scrollLock('on', 'div');
                    }, Delay);
                } else {
                    This.scroller({ trackMargin: Margin });
                    Content.scrollLock('on', 'div');
                }
            });
        }

        function activeHiddenScroller() {
            var Scroller = $(this).find('.panel-scroller');

            // If scroller is already activated destroy instance
            if (Scroller.hasClass('scroller')) { Scroller.scroller("destroy"); }

            // Init new instance
            Scroller.scroller({ trackMargin: 5 }).scrollLock('on', 'div');
        }

    }

    // Delayed Animations
    var runAnimations = function() {

        // Delayed Animations
        // data attribute accepts delay(in ms) and animation style
        // if only delay is provided fadeIn will be set as default
        // eg. data-animate='["500","fadeIn"]'
        var animateDelay = $('.animated-delay[data-animate]');
        if (animateDelay.length) {
            animateDelay.each(function() {
                var This = $(this)
                var delayTime = This.data('animate');
                var delayAnimation = 'fadeIn';

                // if the data attribute has more than 1 value
                // it's an array, reset defaults
                if (delayTime.length > 1 && delayTime.length < 3) {
                    delayTime = This.data('animate')[0];
                    delayAnimation = This.data('animate')[1];
                }

                var delayAnimate = setTimeout(function() {
                    This.removeClass('animated-delay').addClass('animated ' + delayAnimation)
                        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                            This.removeClass('animated ' + delayAnimation);
                        });
                }, delayTime);
            });
        }

        // "In-View" Animations
        // data attribute accepts animation style and offset(in %)
        // eg. data-animate='["fadeIn","40%"]'
        var animateWaypoint = $('.animated-waypoint');
        if (animateWaypoint.length) {
            animateWaypoint.each(function(i, e) {
                var This = $(this);
                var Animation = This.data('animate');
                var offsetVal = '35%';

                // if the data attribute has more than 1 value
                // it's an array, reset defaults
                if (Animation.length > 1 && Animation.length < 3) {
                    Animation = This.data('animate')[0];
                    offsetVal = This.data('animate')[1];
                }

                var waypoint = new Waypoint({
                    element: This,
                    handler: function(direction) {
                        console.log(offsetVal)
                        if (This.hasClass('animated-waypoint')) {
                            This.removeClass('animated-waypoint').addClass('animated ' + Animation)
                                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                                    This.removeClass('animated ' + Animation);
                                });
                        }
                    },
                    offset: offsetVal
                });
            });
        }

        // Init smoothscroll on elements with set data attr
        // data value determines smoothscroll offset
        var SmoothScroll = $('[data-smoothscroll]');
        if (SmoothScroll.length) {
            SmoothScroll.each(function(i, e) {
                var This = $(e);
                var Links = This.find('a');
                var Offset = This.data('smoothscroll');

                // Init Smoothscroll with data stored offset
                Links.smoothScroll({ offset: Offset });
            });
        }

        // Animation Helper - Disabled
        // Add a class after load to prevent css animations
        // from bluring pages that have load intensive resources
        // if (!Body.hasClass('boxed-layout')) {
        //     setTimeout(function() { Body.addClass('onload-check'); }, 100);
        // }

    }

    // jQuery Helper Functions
    var runHelpers = function() {

        // Disable element selection
        $.fn.disableSelection = function() {
            return this
                .attr('unselectable', 'on')
                .css('user-select', 'none')
                .on('selectstart', false);
        };

        // Find element scrollbar visibility
        $.fn.hasScrollBar = function() {
            return this.get(0).scrollHeight > this.height();
        }

        // Reverses order of an array
        $.fn.reverse = function() {
            return this.pushStack(this.get().reverse(), arguments);
        };

        // Test for IE, Add body class if version 9
        function msieversion() {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");
            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                var ieVersion = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
                if (ieVersion === 9) { Body.addClass('no-js ie' + ieVersion); }
                return ieVersion;
            } else { return false; }
        }
        msieversion();
    }

    // Helper Function - Debounce
    var _debounce = function(func, wait, immediate) {

        // Returns a function which will not be triggered until after repeated calls
        // to it have stopped(window resize, etc). Will be called after "wait" arg(milliseconds).
        // If `immediate` is passed the function will trigger leading rather than trailing
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };

    }

    // Helper Function - Refresh Shared Selector Cache. Useful if
    // theme init timing was modified and DOM state is/was unknown
    var _updateSelectors = function() {
        Window = $(window);
        Body = $('body');
        Navbar = $('.navbar');
        Topbar = $('.content-topbar');
        Content = $('#content');
        sidebarLeft = $('#sidebar_left');
        sidebarRight = $('#sidebar_right');

        // Scroller Vars
        hasScroller = $('.' + scrollerOptions.scroller);
        hasLeftScroller = sidebarLeft.find(hasScroller);
        hasRightScroller = sidebarRight.find(hasScroller);
    }

    return {
        init: function(options) {

            // Store  copy of user settings in shared scope
            usersettings = options;

            // Extend Default Options and expose to Core for shared yet scoped use
            settings = $.extend({}, defaults, options);

            // Call Core Startup Functions
            runHelpers();
            runAnimations();
            runSidebar();
            runDropMenu();
            runHeader();
            runFooter();
            runTrays();
            runFormElements();
        },
        debounce: _debounce // Expose debounce function for cross script use Core.debounce();
    }

})();

// Global Library of Theme colors for cross script plug and play use. ie adColors.bgPrimary
var adColors = {
    bgPrimary: '#4a89dc',
    bgPrimaryL: '#5d9cec',
    bgPrimaryLr: '#83aee7',
    bgPrimaryD: '#2e76d6',
    bgPrimaryDr: '#2567bd',
    bgSuccess: '#70ca63',
    bgSuccessL: '#87d37c',
    bgSuccessLr: '#9edc95',
    bgSuccessD: '#58c249',
    bgSuccessDr: '#49ae3b',
    bgInfo: '#3bafda',
    bgInfoL: '#4fc1e9',
    bgInfoLr: '#74c6e5',
    bgInfoD: '#27a0cc',
    bgInfoDr: '#2189b0',
    bgWarning: '#f6bb42',
    bgWarningL: '#ffce54',
    bgWarningLr: '#f9d283',
    bgWarningD: '#f4af22',
    bgWarningDr: '#d9950a',
    bgDanger: '#e9573f',
    bgDangerL: '#fc6e51',
    bgDangerLr: '#f08c7c',
    bgDangerD: '#e63c21',
    bgDangerDr: '#cd3117',
    bgAlert: '#967adc',
    bgAlertL: '#ac92ec',
    bgAlertLr: '#c0b0ea',
    bgAlertD: '#815fd5',
    bgAlertDr: '#6c44ce',
    bgSystem: '#37bc9b',
    bgSystemL: '#48cfad',
    bgSystemLr: '#65d2b7',
    bgSystemD: '#2fa285',
    bgSystemDr: '#288770',
    bgLight: '#f3f6f7',
    bgLightL: '#fdfefe',
    bgLightLr: '#ffffff',
    bgLightD: '#e9eef0',
    bgLightDr: '#dfe6e9',
    bgDark: '#3b3f4f',
    bgDarkL: '#424759',
    bgDarkLr: '#51566c',
    bgDarkD: '#2c2f3c',
    bgDarkDr: '#1e2028',
    bgBlack: '#283946',
    bgBlackL: '#2e4251',
    bgBlackLr: '#354a5b',
    bgBlackD: '#1c2730',
    bgBlackDr: '#0f161b'
}