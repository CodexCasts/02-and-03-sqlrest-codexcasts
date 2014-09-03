exports.definition = {
	config: {
		columns: {
		    "nid": "integer",
			"type": "string",
			"language": "string",
			"title": "string",
			"uid": "integer",
			"status": "integer",
		  
		},
		URL: 'http://localhost:8888/services/mobile/node/' +'?api-key=IshouldGetAbetterKey&parameters[type]=page',
		debug: 1,
		useStrictValidation: 0,
		deleteAllOnFetch: true,
		parentNode: function(data) {
		    var entries = [];
		    
		    _.each(data, function(_entry){
		
		        var page = {};
		        page.nid = _entry.nid;
		        page.title = _entry.title,
		        entries.push(page);
		
		    });
		    
		    return entries;
		   
		},
		adapter: {
			type: "sqlrest",
			collection_name: "page",
			"idAttribute" : "nid"
		}
	},
	extendModel : function(Model) {
     _.extend(Model.prototype, {
             
            });
        return Model;
},
extendCollection : function(Collection) {
         _.extend(Collection.prototype, {
              
        });
        return Collection;
    } 
};