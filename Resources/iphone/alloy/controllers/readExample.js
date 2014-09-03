function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function __alloyId19(e) {
        if (e && e.fromAdapter) return;
        __alloyId19.opts || {};
        var models = __alloyId18.models;
        var len = models.length;
        var rows = [];
        for (var i = 0; len > i; i++) {
            var __alloyId15 = models[i];
            __alloyId15.__transform = {};
            var __alloyId17 = Alloy.createController("tableviewrow", {
                $model: __alloyId15,
                __parentSymbol: __parentSymbol
            });
            rows.push(__alloyId17.getViewEx({
                recurse: true
            }));
        }
        $.__views.table.setData(rows);
    }
    function myLoader(e) {
        Alloy.Collections.page.fetch({
            success: e.hide,
            error: e.hide
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "readExample";
    if (arguments[0]) {
        var __parentSymbol = __processArg(arguments[0], "__parentSymbol");
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    Alloy.Collections.instance("page");
    $.__views.readWindow = Ti.UI.createWindow({
        id: "readWindow",
        title: "Read Example"
    });
    $.__views.activityIndicator = Ti.UI.createActivityIndicator({
        id: "activityIndicator",
        message: "Loading..."
    });
    $.__views.readWindow.add($.__views.activityIndicator);
    $.__views.ptr = Alloy.createWidget("nl.fokkezb.pullToRefresh", "widget", {
        id: "ptr",
        __parentSymbol: __parentSymbol
    });
    myLoader ? $.__views.ptr.on("release", myLoader) : __defers["$.__views.ptr!release!myLoader"] = true;
    $.__views.table = Ti.UI.createTableView({
        headerPullView: $.__views.ptr.getProxyPropertyEx("headerPullView", {
            recurse: true
        }),
        headerView: $.__views.ptr.getProxyPropertyEx("headerView", {
            recurse: true
        }),
        id: "table"
    });
    $.__views.readWindow.add($.__views.table);
    var __alloyId18 = Alloy.Collections["page"] || page;
    __alloyId18.on("fetch destroy change add remove reset", __alloyId19);
    $.__views.readTab = Ti.UI.createTab({
        window: $.__views.readWindow,
        id: "readTab",
        title: "Read"
    });
    $.__views.readTab && $.addTopLevelView($.__views.readTab);
    exports.destroy = function() {
        __alloyId18.off("fetch destroy change add remove reset", __alloyId19);
    };
    _.extend($, $.__views);
    arguments[0] || {};
    var hideActivity = function() {
        $.readWindow.remove($.activityIndicator);
    };
    Alloy.Collections.page.fetch({
        success: hideActivity,
        error: hideActivity
    });
    $.ptr.init($.table);
    __defers["$.__views.ptr!release!myLoader"] && $.__views.ptr.on("release", myLoader);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;