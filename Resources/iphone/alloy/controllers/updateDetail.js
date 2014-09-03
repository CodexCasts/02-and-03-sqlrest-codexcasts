function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function updateButton() {
        var page = args.data;
        page.set("title", $.title_text_field.value);
        page.save();
    }
    function deleteButton() {
        var page = args.data;
        page.destroy();
        Alloy.Collections.page.fetch();
        $.updateDetailWindow.close();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "updateDetail";
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
    $.pageDetail = Alloy.createModel("page");
    $.__views.updateDetailWindow = Ti.UI.createWindow({
        layout: "vertical",
        backgroundColor: "white",
        id: "updateDetailWindow",
        model: "$.pageDetail"
    });
    $.__views.updateDetailWindow && $.addTopLevelView($.__views.updateDetailWindow);
    $.__views.title_text_field = Ti.UI.createTextField({
        height: 40,
        top: 50,
        width: 250,
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DONE,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        hintText: "Title of page",
        id: "title_text_field"
    });
    $.__views.updateDetailWindow.add($.__views.title_text_field);
    $.__views.update_button = Ti.UI.createButton({
        title: "update",
        top: "20",
        id: "update_button"
    });
    $.__views.updateDetailWindow.add($.__views.update_button);
    updateButton ? $.__views.update_button.addEventListener("click", updateButton) : __defers["$.__views.update_button!click!updateButton"] = true;
    $.__views.delete_button = Ti.UI.createButton({
        title: "delete",
        top: "20",
        id: "delete_button"
    });
    $.__views.updateDetailWindow.add($.__views.delete_button);
    deleteButton ? $.__views.delete_button.addEventListener("click", deleteButton) : __defers["$.__views.delete_button!click!deleteButton"] = true;
    var __alloyId20 = function() {
        $.title_text_field.value = _.isFunction($.pageDetail.transform) ? $.pageDetail.transform()["title"] : _.template("<%=pageDetail.title%>", {
            pageDetail: $.pageDetail.toJSON()
        });
    };
    $.pageDetail.on("fetch change destroy", __alloyId20);
    exports.destroy = function() {
        $.pageDetail.off("fetch change destroy", __alloyId20);
    };
    _.extend($, $.__views);
    var args = arguments[0] || {};
    $.pageDetail.set(args.data.attributes);
    __defers["$.__views.update_button!click!updateButton"] && $.__views.update_button.addEventListener("click", updateButton);
    __defers["$.__views.delete_button!click!deleteButton"] && $.__views.delete_button.addEventListener("click", deleteButton);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;