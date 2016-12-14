/**
Created by Sanjay Khurana (2016-11-05)
======================================
Catalog Listing Functionality
=============================
*/

var BaseController = require('./BaseController');


var CatalogController = BaseController.extend({


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
						res.cookie('userCookie', req.userCookie);
						res.view('catalog/index.ejs', {"products": products, "categories" : categoryJson, "req" : req});
					});
				}
			}
		});
	}

});

module.exports = CatalogController;