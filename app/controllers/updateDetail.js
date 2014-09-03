var args = arguments[0] || {};

// instance variable used in data-binding
// we do this set here to trigger the events
// that will cause the data to be rendered
$.pageDetail.set(args.data.attributes);


function updateButton() {

	// update the model and save
	var page = args.data;
	page.set("title", $.title_text_field.value);
	page.save();
};



function deleteButton() {
	// delete the model object
	var page = args.data;
	page.destroy();

	// force tables to update
	Alloy.Collections.page.fetch();

	$.updateDetailWindow.close();
};

