/**
Created by Sanjay Khurana (2016-11-05)
======================================
Catalog Listing Functionality
=============================
*/

var BaseController = require('./BaseController');


var CatalogController = BaseController.extend({


	'create' : function(req, res) {
		var currDate = new Date();
		ProductCollection.create([
			]
			).exec(function(err, category) {
				console.log("Error", err);
				console.log("category", category);
			});	;
		res.ok({});
	},
	'index' : function(req, res) {

		ProductCollection.find().exec(function (err, products) {
			if (err) {
				console.log("error", err);
			} else {
				if (!_.isEmpty(products)) {
					CategoryCollection.find().exec(function(error, categories){
						var categoryJson = [];
						if (!_.isEmpty(categories)) {
							_.forEach(categories, function(category, key){
								categoryJson[category.idCategory] = category.name;
							})
						}
						if (!_.isEmpty(categoryJson)) {
							_.forEach(products, function(value, key){
								products[key]['categoryName'] = categoryJson[value.fkCategoryId];	
							})	
						}
						res.view('catalog/index.ejs', {"products": products, "categories" : categoryJson});
					});
				}
			}
		});
	}

});

module.exports = CatalogController;