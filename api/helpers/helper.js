/**
	Helper Functions 

	Created By :Sanjay Khurana
**/
var moment =require('moment');

var HelperFunction =  {

	getDeliveryTimeOptions : function() {

		var timeSlots = {9 : "09:00 AM - 10:00 AM", 10 : "10:00 AM - 11:00 AM", 11 : "11:00 AM - 12:00 PM", 
							12 : "12:00 AM - 01:00 PM", 13: "01:00 PM - 02:00 PM", 
							14 : "02:00 PM - 03:00 PM", 15 : "03:00 PM - 04:00 PM", 16 : "04:00 PM - 05:00 PM",
							17 : "05:00 PM - 06:00 PM", 18 : "06:00 PM - 07:00 PM",19 : "07:00 PM - 08:00 PM",20 : "08:00 PM - 09:00 PM"};
		
		var availableTimeSlots = [];var showTimeSlots = 5;
		var i = 0;
		var today = new Date();
		var currHour = today.getHours();
		var dateString = moment(today).format('MMMM Do  YYYY');
		while (availableTimeSlots.length <= showTimeSlots) {
			_.forEach(timeSlots, function(value, key){
				if (availableTimeSlots.length <= showTimeSlots) {
					if (currHour + 3 > parseInt(key) + i) {
						//continue;
					} else  {
						availableTimeSlots.push(dateString + " " + value);
					}
				}
			});
			 i = i + 24;
			 dateString = moment(today).add(1, 'days').format('MMMM Do  YYYY');
			 
		}
		return availableTimeSlots;
	},

	getOrderNumber : function() {
		return moment().format("YYMMDDHHmmss");
	},

	getCartValue : function(cartData) {
		var cartValue = 0;
		if (!_.isEmpty(cartData)) {
			_.forEach(cartData, function(value, key){
				if (value.specialPrice > 0) {
					cartValue += parseInt(value.specialPrice, 2);
				} else {
					cartValue += parseInt(value.price, 10);
				}
			})
		}
		return cartValue;
	},
	getOrderDetailHtml : function(cartData) {
		var cartString = "";
		_.forEach(cartData, function(value, key){
			cartString += "<br>";
			cartString += value.qty + 'X ';
			cartString += value.name + " ";
			cartString += value.variant + " ";
			cartString += "Rs. " + value.price + ' each';
			cartString += "</>";
		});
		return String(cartString).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		//return ;
	}
}

module.exports = HelperFunction;