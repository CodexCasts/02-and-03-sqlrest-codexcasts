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
    new (require("alloy/widget"))("nl.fokkezb.pullToRefresh");
    this.__widgetId = "nl.fokkezb.pullToRefresh";
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "view";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.ptr = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 51,
        backgroundColor: "#F5F8FA",
        id: "ptr"
    });
    $.__views.ptr && $.addTopLevelView($.__views.ptr);
    $.__views.prtCenter = Ti.UI.createView({
        bottom: 11,
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        visible: false,
        id: "prtCenter"
    });
    $.__views.ptr.add($.__views.prtCenter);
    $.__views.ptrArrow = Ti.UI.createImageView({
        left: 8,
        width: 12,
        height: 30,
        image: WPATH("/images/clean.png"),
        id: "ptrArrow"
    });
    $.__views.prtCenter.add($.__views.ptrArrow);
    $.__views.ptrIndicator = Ti.UI.createActivityIndicator({
        left: 0,
        style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
        id: "ptrIndicator"
    });
    $.__views.prtCenter.add($.__views.ptrIndicator);
    $.__views.ptrText = Ti.UI.createLabel({
        left: 30,
        wordWrap: false,
        color: "#8899A6",
        font: {
            fontSize: 13
        },
        id: "ptrText"
    });
    $.__views.prtCenter.add($.__views.ptrText);
    $.__views.ptrLine = Ti.UI.createView({
        bottom: 0,
        height: 1,
        width: Ti.UI.FILL,
        backgroundColor: "#E1E8ED",
        id: "ptrLine"
    });
    $.__views.ptr.add($.__views.ptrLine);
    exports.destroy = function() {};
    _.extend($, $.__views);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;