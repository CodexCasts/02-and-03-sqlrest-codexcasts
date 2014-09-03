function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "tableviewrowupdate";
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        var $model = __processArg(arguments[0], "$model");
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    $.__views.row = Ti.UI.createTableViewRow({
        id: "row",
        model: "undefined" != typeof $model.__transform["nid"] ? $model.__transform["nid"] : "" + $model.get("nid"),
        hasDetail: "true"
    });
    $.__views.row && $.addTopLevelView($.__views.row);
    $.__views.title = Ti.UI.createLabel({
        top: "2dp",
        height: Ti.UI.SIZE,
        left: "20",
        right: "20",
        font: {
            fontSize: "24dp"
        },
        Color: "black",
        id: "title",
        text: "undefined" != typeof $model.__transform["title"] ? $model.__transform["title"] : "" + $model.get("title")
    });
    $.__views.row.add($.__views.title);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;