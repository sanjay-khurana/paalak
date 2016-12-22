/**
Created by Sanjay Khurana (2016-11-26)
======================================
Order Functionality
=============================
*/


var BaseController = require('./BaseController');
var ExternalAPI = require('./../services/ExternalApi');
var HelperFunction = require('./../helpers/helper');

var OrderController = BaseController.extend({ 

	'cartSave' : function(req, res) {
		if (!_.isEmpty(req.body)) {
			var cartData = req.body;
			var userData = {
				'idSession' : req.userCookie,
				'name' : 'Guest',
				'contact' : "",
				'email' : "",
				'cart' : cartData,
				'address' : JSON.stringify({}),
				'cartValue' : HelperFunction.getCartValue(cartData)
			}
			
			if (!_.isEmpty(req.user)) {
				userData.name = req.user.name;
				userData.contact = req.user.contact;
				userData.email = req.user.email;
				if (!_.isEmpty(req.user.address) && !_.isObject(req.user.address)) {
					userData.address = JSON.stringify(req.user.address);	
				}
			}
			
			
			UserCollection.find({'idSession' : userData.idSession}).exec(function(err, response){
				if (err) {
					BaseController.logInfo("paalak.log", {"ErrorLog" : err, "error" :  "Session Id not found","date" : new Date()});
					return res.json({
						'success' : false,
						"error" :  "Session Id not found"

					});
				} else {
					if (!_.isEmpty(response)) {
						UserCollection.update({'idSession' : userData.idSession}, userData).exec(function(err, updateRes){
							if (err) {
								BaseController.logInfo("paalak.log", {"ErrorLog" : err, 'error':"Update failed", "date" : new Date()});
								return res.json({
									'success' : false,
									'error':"Update failed"
								});
							}
							return res.json({'success' : true});
						});
					} else {
						UserCollection.create(userData).exec(function(err, createRes){
							if (err) {
								BaseController.logInfo("paalak.log", {"ErrorLog" : err, "error": 'New use create failed', "date" : new Date()});
								return res.json({
									'success' : false,
									"error": 'New use create failed'
								});
							}
							return res.json({'success' : true});
						});
					}
				}
			});
			
		} else {

		}
	},
	'orderAddress' : function(req, res) {
		var data = {};
		data.errors = {};
		data.availableSlots = HelperFunction.getDeliveryTimeOptions();
		return res.view('order/address.ejs', {"data" : data});
	},
	
	'getPincodeDetails' : function(req, res) {
		var pincode = req.query.pincode;
		var pincodeAvailaility = _.filter(sails.config.deliverablePincodes, function(pc){
			return pc == pincode;
		});

		if (!_.isEmpty(pincode)) {
			if (!_.isEmpty(pincodeAvailaility)) {
				return res.json({
					'success' : true,
					'city' : sails.config.pincodeCityStateMapping[pincode].city,
					'state' : sails.config.pincodeCityStateMapping[pincode].state
				});
			}
		}
		BaseController.logInfo("paalak.log", {"InfoLog" : pincode + " Check for availabilty"});
		return res.json({
			'success' : false,
		});
	},
	'placeOrder' : function(req, res) {
		if (!_.isEmpty(req.body)) {
			var addressData = req.body;
			var orderData = {};
			orderData.orderId = 'PAALAK' + HelperFunction.getOrderNumber();
			orderData.idSession = req.userCookie;
			orderData.contact = addressData.contact;
			orderData.email = addressData.email;
			orderData.name = addressData.name;
			orderData.pincode = addressData.pincode;
			orderData.address1 = addressData.address1;
			orderData.address2 = addressData.address2;
			orderData.city = addressData.city;
			orderData.state = addressData.state;
			orderData.deliveryTime = addressData.deliveryTime;
			orderData.paymentMethod = addressData.paymentMethod;
			orderData.status = "placed";
			orderData.orderValue = 0;


			//Creating data for User Update
			var userData = {};
			userData.pincode = orderData.pincode;
			userData.contact = addressData.contact;
			userData.name = addressData.name;
			userData.email = addressData.email;
			userData.address = JSON.stringify({
				'address1' : orderData.address1,
				'address2' : orderData.address2,
				'pincode'  : orderData.pincode,
				'city'	: orderData.city,
				'state' : orderData.state
			});

			// Checkinn validity of Order Data
			var errors = [];
			if (orderData.contact.length < 10 || orderData.contact.length > 10) {
				errors.push('contact-error');
			}
			
			if (orderData.pincode.length < 6 || orderData.pincode.length > 6) {
				errors.push('pincode-error');
			}

			if (!orderData.name.length) {
				errors.push('fullname-error');
			}
			if (!orderData.address1.length) {
				errors.push('address1-error');	
			}
			if (!orderData.city.length) {
				errors.push('city-error');
			}
			if (!orderData.state.length) {
				errors.push('state-error');
			}

			if (!orderData.paymentMethod) {
				errors.push('paymentmethod-error');
			}

			if (!orderData.email.length) {
				errors.push('email-error');
			}

			if (errors.length) {
				BaseController.logInfo("paalak.log", {"Error Log" : errors});
				return res.json({
						'success' : false,
						'errors' : errors
				});
			}

			var apiRequestUrl = sails.config.orderSmsConfig.url;
			var apiRequestData = {
				"listId":sails.config.orderSmsConfig.listId,
				"userId":sails.config.orderSmsConfig.userId,
				"subscribers":{
					"headers":["ID","Name", "Mobileno","ordconfdate"],
					"data":{
						"sequence":{
							"1":{
								"ID":3,"Name": orderData.name,"Mobileno":orderData.contact,"ordconfdate": orderData.deliveryTime
							}
						}
					}
				}
			}

			var emailRequestUrl = sails.config.orderEmailConfig.url;
			var emailApiRequestData = {
				"listId":sails.config.orderEmailConfig.listId,
				"userId":sails.config.orderEmailConfig.userId,
				"subscribers":{
					"headers":["OrderID","name","email","mobile","timeoforder","order_detail","OrderValue","Exp_DeliveryDate","address","Paymentmethod"],
					"data":{
						"sequence":{
							"1":{
								"OrderID":orderData.orderId,
								"name": orderData.name,
								"email":orderData.email,
								"mobile": orderData.contact,
								"timeoforder": new Date(),
								"order_detail" : {},
								"OrderValue": 0,
								"Exp_DeliveryDate" : orderData.deliveryTime,
								"address":orderData.address1 + ', ' + orderData.address2 + ', ' + orderData.city + ', ' + orderData.state + ', ' + orderData.pincode,
								"Paymentmethod": orderData.paymentMethod
							}
						}
					}
				}
			}
			

			var data = {};
			data.deliveryTime = orderData.deliveryTime;
			UserCollection.find({'idSession' : orderData.idSession}).exec(function(err, response){
				if (err) {
					BaseController.logInfo("paalak.log", {"Error Log" : "Session Id Not found in order"});
					return res.json({
						'success' : false
					});
				} else {
					
					if (!_.isEmpty(response) && !_.isEmpty(response[0].cart)) {
						orderData.cart = response[0].cart;
						orderData.orderValue = response[0].cartValue;
						emailApiRequestData.subscribers.data.sequence["1"].order_detail = JSON.stringify(orderData.cart);
						emailApiRequestData.subscribers.data.sequence["1"].OrderValue = orderData.orderValue;
						
						OrderCollection.create(orderData).exec(function(err, resp){
								if (err) {
									BaseController.logInfo("paalak.log", {"Error Log" : "Order Creating Issue"});
									return res.json({
										'success' : false
									});
								} else {
									if (!_.isEmpty(res)) {
										UserCollection.update({'idSession' : orderData.idSession}, {'name' : userData.name, 'contact': userData.contact, 'pincode' : userData.pincode, 'address' : userData.address, 'cart' : "", "email" : userData.email}).exec(function(err, updateRes){
											if (err) {
												// Log Error
											}
											var apiRequest = {
												url : apiRequestUrl,
												body : JSON.stringify(apiRequestData),
												method : 'POST',
												headers: {
								                    'Content-Type': 'application/json'
								                 }
											}
											ExternalApi.request(apiRequest).then(function(response){
												
												return res.json({
														'success' : true,
														'deliveryTime' : data.deliveryTime
												});
											});
											var emailApiRequest = {
												url : emailRequestUrl,
												body : JSON.stringify(emailApiRequestData),
												method : 'POST',
												headers: {
								                    'Content-Type': 'application/json'
								                 }
											}
											ExternalApi.request(emailApiRequest).then(function(response){
													
											});

										});
										
									}
								}
							})
					}
				}

			});
		}
		
	},
	
	'verifyOtp' : function(req, res) {
		
		if (!_.isEmpty(req.body) && !_.isEmpty(req.body.otp) && !_.isEmpty(req.body.contact)) {
			var contact = req.body.contact;
			if (req.body.otp != req.cookies.userOtp) {
				return res.json({"success" : false, "error" : "OTP does not match"});
			}

			UserCollection.find({'contact' : contact}).exec(function(err, response){

				if (err) {

				} else {
					if (!_.isEmpty(response)) {
						res.cookie('userCookie', response[0].idSession);
						return res.json({"success" : true})
					} else {
						var userData = {
							'idSession' : req.userCookie,
							'name' : 'Guest',
							'contact' : contact,
							'cart' : "",
							'address' : JSON.stringify({})
						}
						UserCollection.create(userData).exec(function(err, createRes){
							if (err) {
								return res.json({
									'success' : false,
									"error":
									'New use create failed'
								});
							}
							return res.json({'success' : true});
						});
					}
				}
			});		
			
		}

	},

	generateOtp : function(req, res) {
		if (!_.isEmpty(req.body) && !_.isEmpty(req.body.contact)) {
			var contact = req.body.contact;
			var otp = Math.floor(1000 + Math.random() * 9000);
			var apiRequestUrl = sails.config.otpApiConfig.url;
			var apiRequestData = {
				"listId":sails.config.otpApiConfig.listId,
				"userId":sails.config.otpApiConfig.userId,
				"subscribers":{
					"headers":["SR","Mobileno","otp"],
					"data":{
						"sequence":{
							"4":{
								"SR":3,"Mobileno":contact,"otp":otp
							}
						}
					}
				}
			}

			var apiRequest = {
				url : apiRequestUrl,
				body : JSON.stringify(apiRequestData),
				method : 'POST',
				headers: {
                    'Content-Type': 'application/json'
                 }
			}
			
			ExternalApi.request(apiRequest).then(function(err, response){
				res.cookie('userOtp', otp);
				if (err) {
					return res.json({"success" : true});
				}
				
				return res.json({"success" : true});	
			})
			
		}
	}

});

module.exports = OrderController;