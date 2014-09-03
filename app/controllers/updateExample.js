var args = arguments[0] || {};
$.ptr.init($.table);
function myLoader(e) {
	Alloy.Collections.page.fetch({  success: e.hide, error: e.hide});

}

$.table.addEventListener('click', function(_e) {
	//alert(_e.rowData.model);
    var updateDetail = Alloy.createController('updateDetail', {
        parentTab : $.updateTab,
        data : Alloy.Collections.page.get(_e.rowData.model)
    });
    $.updateTab.open(updateDetail.getView());
});

