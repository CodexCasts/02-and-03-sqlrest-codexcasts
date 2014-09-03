var args = arguments[0] || {};
var hideActivity = function () {
	$.readWindow.remove($.activityIndicator);
};

function myLoader(e) {
	Alloy.Collections.page.fetch({  success: e.hide, error: e.hide});

}
// If I weren't directly binding the model to the view then I'd use the success key 
// to do a more advanced manipulation/display of the data.	 
Alloy.Collections.page.fetch({ success: hideActivity, error: hideActivity });
$.ptr.init($.table);
