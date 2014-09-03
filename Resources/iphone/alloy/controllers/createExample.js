function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function createPage() {
        var model = Alloy.createModel("page", {
            title: $.title.value,
            type: "page"
        });
        model.save();
        model.fetch();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "createExample";
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
    var __defers = {};
    Alloy.Collections.instance("page");
    $.__views.Win = Ti.UI.createWindow({
        id: "Win",
        title: "Create Example"
    });
    $.__views.title = Ti.UI.createTextField({
        height: 40,
        top: 50,
        width: 250,
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DONE,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        hintText: "Title of page",
        id: "title"
    });
    $.__views.Win.add($.__views.title);
    $.__views.save_button = Ti.UI.createButton({
        title: "Save",
        id: "save_button"
    });
    $.__views.Win.add($.__views.save_button);
    createPage ? $.__views.save_button.addEventListener("click", createPage) : __defers["$.__views.save_button!click!createPage"] = true;
    $.__views.createTab = Ti.UI.createTab({
        window: $.__views.Win,
        id: "createTab",
        title: "Create"
    });
    $.__views.createTab && $.addTopLevelView($.__views.createTab);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    __defers["$.__views.save_button!click!createPage"] && $.__views.save_button.addEventListener("click", createPage);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;