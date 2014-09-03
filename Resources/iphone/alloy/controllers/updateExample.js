function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function __alloyId31(e) {
        if (e && e.fromAdapter) return;
        __alloyId31.opts || {};
        var models = __alloyId30.models;
        var len = models.length;
        var rows = [];
        for (var i = 0; len > i; i++) {
            var __alloyId27 = models[i];
            __alloyId27.__transform = {};
            var __alloyId29 = Alloy.createController("TableViewRowUpdate", {
                $model: __alloyId27,
                __parentSymbol: __parentSymbol
            });
            rows.push(__alloyId29.getViewEx({
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
    this.__controllerPath = "updateExample";
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
    $.__views.Win = Ti.UI.createWindow({
        id: "Win",
        title: "Update & Delete Example"
    });
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
    $.__views.Win.add($.__views.table);
    var __alloyId30 = Alloy.Collections["page"] || page;
    __alloyId30.on("fetch destroy change add remove reset", __alloyId31);
    $.__views.updateTab = Ti.UI.createTab({
        window: $.__views.Win,
        id: "updateTab",
        title: "Update"
    });
    $.__views.updateTab && $.addTopLevelView($.__views.updateTab);
    exports.destroy = function() {
        __alloyId30.off("fetch destroy change add remove reset", __alloyId31);
    };
    _.extend($, $.__views);
    arguments[0] || {};
    $.ptr.init($.table);
    $.table.addEventListener("click", function(_e) {
        var updateDetail = Alloy.createController("updateDetail", {
            parentTab: $.updateTab,
            data: Alloy.Collections.page.get(_e.rowData.model)
        });
        $.updateTab.open(updateDetail.getView());
    });
    __defers["$.__views.ptr!release!myLoader"] && $.__views.ptr.on("release", myLoader);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;