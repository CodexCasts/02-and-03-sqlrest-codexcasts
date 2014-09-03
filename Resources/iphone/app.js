var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

Alloy.Globals.winTop = true && parseInt(Ti.Platform.version, 10) >= 7 ? 20 : 0;

Ti.UI.backgroundColor = "white";

Alloy.createController("index");