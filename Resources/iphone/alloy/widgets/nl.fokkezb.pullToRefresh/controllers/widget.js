function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "nl.fokkezb.pullToRefresh/" + s : s.substring(0, index) + "/nl.fokkezb.pullToRefresh/" + s.substring(index + 1);
    return path;
}

function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function show(msg) {
        if (!attached || pulled) return false;
        pulled = true;
        hidden = false;
        $.view.ptrText.text = msg || options.msgUpdating;
        $.view.ptrArrow.opacity = 0;
        $.view.ptrIndicator.show();
        $.view.prtCenter.show();
        __parentSymbol.setContentInsets({
            top: options.top + height
        }, {
            animated: true
        });
        return true;
    }
    function hide() {
        if (!attached || !pulled) return false;
        $.view.ptrIndicator.hide();
        $.view.ptrArrow.transform = Ti.UI.create2DMatrix();
        $.view.ptrArrow.opacity = 1;
        $.view.ptrText.text = options.msgPull;
        __parentSymbol.setContentInsets({
            top: options.top
        }, {
            animated: true,
            duration: 250
        });
        setTimeout(function() {
            $.view.prtCenter.hide();
        }, 250);
        hidden = true;
        pulled = false;
        loading = false;
        return true;
    }
    function refresh() {
        if (!attached || loading) return false;
        loading = true;
        show();
        $.trigger("release", {
            hide: hide
        });
        return true;
    }
    function scrollListener(e) {
        if (e.source !== __parentSymbol) return;
        if (pulled) return;
        offset = e.contentOffset.y;
        if (offset >= 0 - options.top) {
            if (!hidden) {
                $.view.prtCenter.hide();
                hidden = true;
            }
        } else if (hidden) {
            $.view.prtCenter.show();
            hidden = false;
        }
        if (pulling && !loading && offset > 0 - options.top - height) {
            pulling = false;
            var unrotate = Ti.UI.create2DMatrix();
            $.view.ptrArrow.animate({
                transform: unrotate,
                duration: 180
            });
            $.view.ptrText.text = options.msgPull;
        } else if (!pulling && !loading && offset <= 0 - options.top - height) {
            pulling = true;
            var rotate = Ti.UI.create2DMatrix().rotate(180);
            $.view.ptrArrow.animate({
                transform: rotate,
                duration: 180
            });
            $.view.ptrText.text = options.msgRelease;
        }
        return;
    }
    function dragEndListener(e) {
        if (e.source !== __parentSymbol) return;
        if (!pulled && pulling && !loading && offset <= 0 - options.top - height) {
            pulling = false;
            refresh();
        }
        return;
    }
    function setOptions(_options) {
        _.extend(options, _options);
        return;
    }
    function attach() {
        if (attached) return false;
        __parentSymbol.headerPullView = $.view.ptr;
        init();
        return true;
    }
    function init(_table) {
        _table && (__parentSymbol = _table);
        __parentSymbol.addEventListener("scroll", scrollListener);
        height = $.view.ptr.height;
        attached = true;
        pulling = false;
        pulled = false;
        loading = false;
        offset = 0;
        __parentSymbol.addEventListener("dragEnd", dragEndListener);
        $.view.ptrText.text = options.msgPull;
        return;
    }
    function dettach() {
        if (!attached) return false;
        __parentSymbol.removeEventListener("scroll", scrollListener);
        __parentSymbol.removeEventListener("dragEnd", dragEndListener);
        __parentSymbol.headerPullView = null;
        attached = false;
        return true;
    }
    new (require("alloy/widget"))("nl.fokkezb.pullToRefresh");
    this.__widgetId = "nl.fokkezb.pullToRefresh";
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "widget";
    if (arguments[0]) {
        var __parentSymbol = __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.view = Alloy.createWidget("nl.fokkezb.pullToRefresh", "view", {
        id: "view",
        __parentSymbol: __parentSymbol
    });
    $.__views.view.getViewEx({
        recurse: true
    }) && $.addProxyProperty("headerPullView", $.__views.view.getViewEx({
        recurse: true
    }));
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var options = {
        msgPull: L("ptrPull", "Pull to refresh..."),
        msgRelease: L("ptrRelease", "Release to refresh..."),
        msgUpdating: L("ptrUpating", "Updating..."),
        top: 0
    };
    var height = 50, attached = false, hidden = true, pulling = false, pulled = false, loading = false, offset = 0;
    delete args.__parentSymbol;
    delete args.__itemTemplate;
    delete args.$model;
    setOptions(args);
    __parentSymbol && init();
    exports.setOptions = setOptions;
    exports.show = show;
    exports.hide = hide;
    exports.refresh = refresh;
    exports.dettach = dettach;
    exports.attach = attach;
    exports.init = init;
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;