var args = arguments[0] || {};
function createPage(){
	var model = Alloy.createModel('page', {
			title : $.title.value,
			type: "page"
		});
		model.save();
		model.fetch();
};

		
