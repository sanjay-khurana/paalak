/**
Created by Sanjay Khurana (2016-11-05)
======================================
Catalog Listing Functionality
=============================
*/

var BaseController = require('./BaseController');


var CatalogController = BaseController.extend({

	'createProduct' : function(req, res) {

		if (req.method == 'POST') {

			var productData = {
			 "idProduct": 23,
			  "name": req.body.prdoductname,
			  "fkCategoryId": req.body.categoryId,
			  "price": req.body.productprice,
			  "specialPrice": req.body.productspprice,
			  "unit":  {},
			  "isActive" : req.body.isActive ? true : false,
			  "imagePath": "/images/capsicum.png"
			}
			if (!_.isEmpty(req.body.productvariant) && !_.isEmpty(req.body.productvariantprice)) {
				var prdVariant = req.body.productvariant.split(',');
				var prdPrice = req.body.productvariantprice.split(',');
				_.forEach(prdVariant, function(value, key){
					productData.unit[value] = {};
					productData.unit[value].price = prdPrice[key];
					productData.unit[value].specialPrice = 0;
				});
			}
			
		ProductCollection.create(productData).exec(function(error, response){
			if (error) {
				console.log("Error", error)
			} else {
				if (!_.isEmpty(response)) {
					return res.view('catalog/success.ejs');
				}
			}
		});	
		} else {
			CategoryCollection.find().exec(function(error, categories){
				if (error) {

				} else {
					if (!_.isEmpty(categories)) {
						var data = {};
						data.categories = categories;
						return res.view('catalog/createProduct.ejs', {"data" : data});			
					}
				}

			});
			
		}
		
	},
	'updateProduct' : function(req, res) {

		if (req.method == 'POST') {

			var productData = {
			  "idProduct": req.body.prdoductid,
			  "name": req.body.prdoductname,
			  "fkCategoryId": req.body.categoryId,
			  "price": req.body.productprice,
			  "specialPrice": req.body.productspprice,
			  "unit":  {},
			  "isActive" : req.body.isActive ? true : false,
			  "imagePath": "/images/capsicum.png"
			}
			if (!_.isEmpty(req.body.productvariant) && !_.isEmpty(req.body.productvariantprice)) {
				var prdVariant = req.body.productvariant.split(',');
				var prdPrice = req.body.productvariantprice.split(',');
				_.forEach(prdVariant, function(value, key){
					productData.unit[value] = {};
					productData.unit[value].price = prdPrice[key];
					productData.unit[value].specialPrice = 0;
				});
			}
			
		ProductCollection.update({'idProduct' : productData.idProduct}, productData).exec(function(error, response){
			if (error) {
				console.log("Error", error)
			} else {
				if (!_.isEmpty(response)) {
					return res.view('catalog/success.ejs');
				}
			}
		});	
		} else {
			CategoryCollection.find().exec(function(error, categories){
				if (error) {
					console.log(error);
				} else {
					ProductCollection.find({'idProduct' : req.param('id')}).exec(function (err, product) {
						if (!_.isEmpty(product[0])) {
							var data = {};
							data.categories = categories;
							data.product = product[0];
							var productvariant=[];var prdVariantPrice=[];
							_.forEach(data.product.unit, function(value, key){
								productvariant.push(key);
								prdVariantPrice.push(value['price']); 
							});
							data.prdVariant = productvariant.join(',');
							data.prdVariantPrice = prdVariantPrice.join(',');
							return res.view('catalog/updateProduct.ejs', {"data" : data});			
						}
				});
				}
			});
			
		}
		
	},
	'updateProductList' : function(req, res) {
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
						res.view('catalog/updateProductList.ejs', {"products": products, "categories" : categoryJson, "req" : req});
					});
				}
			}
		});
	},

	'index' : function(req, res) {

		ProductCollection.find({'isActive' : true}).exec(function (err, products) {
			if (err) {
				BaseController.logInfo("paalak.log", {"testLog" : "Error Log"});
			} else {
				if (!_.isEmpty(products)) {
					BaseController.logInfo("paalak", {"testLog" : "Error Log"});
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