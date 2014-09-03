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
    this.__controllerPath = "index";
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    var __alloyId3 = [];
    $.__views.__alloyId4 = Alloy.createController("readExample", {
        id: "__alloyId4"
    });
    __alloyId3.push($.__views.__alloyId4.getViewEx({
        recurse: true
    }));
    $.__views.__alloyId6 = Alloy.createController("createExample", {
        id: "__alloyId6"
    });
    __alloyId3.push($.__views.__alloyId6.getViewEx({
        recurse: true
    }));
    $.__views.__alloyId8 = Alloy.createController("updateExample", {
        id: "__alloyId8"
    });
    __alloyId3.push($.__views.__alloyId8.getViewEx({
        recurse: true
    }));
    $.__views.tabGroup = Ti.UI.createTabGroup({
        tabs: __alloyId3,
        id: "tabGroup"
    });
    $.__views.tabGroup && $.addTopLevelView($.__views.tabGroup);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.tabGroup.open();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;