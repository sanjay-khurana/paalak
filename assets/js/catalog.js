/**

JS file for catalog Page

Created By: Sanjay Khurana
*/


$(document).ready(function($){
	
	var cartJson = getCartJson();
	$('.category_name').click(function(){
		var categoryId = $(this).attr('data-category-id');
		showActiveCategory(categoryId);
		$(this).addClass('active');
	});

	$('.add-qty').click(function(){
		addToBasket($(this).parents('.item-list'));
	});

	$('.sub-qty').click(function() {
		var productId = $(this).parents('.item-list').find('.item-name').data('product-id');
		var productVariant = $(this).parents('.item-list').find('.item-name').find('.item-weight :selected').text();
		removeFromBasket(productId, productVariant);
	});	

	$('.item-weight').change(function(){
		$(this).parents('.item-list').find('.actual-price').html($(this).val());
	});

	$('.order-now').click(function(){
		saveCart(true);
	});

	$('#pincode').on('change', function(){
		if ($(this).val().length == 6) {
			getPincodeDetails($(this).val());
		}
	});

	$('#placeorder').click(function(){
		placeOrder();
	});

	$('#generate-otp').click(function(){
		if (($('#contact-no').val().length > 10 || $('#contact-no').val().length < 10)) {
			return false;
		}
		generateOtp();
	});

	$('#verify-otp').click(function(){
		verifyOtp();
	});

	function generateOtp() {
		$.ajax({
			'url' : '/generateOtp',
			'data' : {'contact' : $('#contact-no').val()},
			'method' : 'post',
			'success' : function(response) {
				$('.generateOtp').addClass('hidden');
				$('.verifyOtp').removeClass('hidden');
			}
		})
	}

	function verifyOtp() {
		var data = {"otp" : $('#otp-no').val(), 'contact' : $('#contact-no').val()};
		$.ajax({
			'url' : '/verifyOtp',
			'data': data,
			'method' : 'post',
			'success' : function(response) {
				if (response.success) {
					window.location.reload();
				}
			}
		})
		
	}
	function showActiveCategory(categoryId){
		$('.category_name').removeClass('active');
		$('.item-list').addClass('hidden');
		$('.category_' + categoryId).removeClass('hidden');
		$('.nav-tabs').find('.category_id_'+ categoryId).addClass('active');
	}

	function addToBasket(itemList) {
		var productJson = {
			"productId" : "",
			"price" : "",
			"specialPrice" : 0,
			"image" : "",
			"qty" : 0,
			"name" : "",
			"variant" : ""
		}
		productJson.productId = itemList.find('.item-name').data('product-id');
		productJson.name  = itemList.find('.item-name').data('product-name');
		productJson.price = itemList.find('.item-weight').val();
		productJson.qty =  1;
		productJson.variant = itemList.find('.item-weight :selected').text();

		var cartJson = getCartJson();
		if (typeof cartJson === 'object' && cartJson.hasOwnProperty(productJson.productId + "-" + productJson.variant)) {
			cartJson[productJson.productId + "-" + productJson.variant]['qty'] = parseInt(cartJson[productJson.productId + "-" + productJson.variant]['qty']) + 1; 
		} else {
			cartJson[productJson.productId + "-" + productJson.variant] = productJson;	
		}
		
		localStorage.setItem('cartJson', JSON.stringify(cartJson));
		userState();
	}

	function removeFromBasket(productId, productVariant) {
		var userCart =  JSON.parse(localStorage.getItem('cartJson'));
		if (typeof userCart === 'object' && Object.keys(userCart).length && userCart.hasOwnProperty(productId + '-' + productVariant)) {
			if (userCart[productId + '-' + productVariant].qty == 1) {
				delete userCart[productId + '-' + productVariant];
				$('.product_' + productId).find('.product-cnt').val(0);
			} else {
				userCart[productId + '-' + productVariant].qty = parseInt(userCart[productId + '-' + productVariant].qty) - 1;
			}
		}
		localStorage.setItem('cartJson', JSON.stringify(userCart));
		userState();
	}	

	function refreshCart(){
		var localCartJson = getCartJson();
		var cartHtml = "";
		var newCartHtml = "";
		var total = 0;

		for (var key in localCartJson) {
			cartHtml = $('.cart-items-temp');
			cartHtml.find('.prd-name').html(localCartJson[key].name);
			cartHtml.find('.prd-qty').html(localCartJson[key].qty);
			cartHtml.find('.prd-price').html(localCartJson[key].price * localCartJson[key].qty);
			cartHtml.find('.prd-variant').html(localCartJson[key].variant);
			cartHtml.find('.onpage-cart-item').removeClass('hidden');
			total = total + parseInt(localCartJson[key].price * localCartJson[key].qty);
			newCartHtml += cartHtml.html();
			cartHtml = "";
		}
		
		$('.actual-total').html(total);
		$('.actual-payable').html(total);
		if (newCartHtml === "") {
			newCartHtml = "Create your basket of fresh produce";
		}
		$('.cart-items').html(newCartHtml);
		saveCart(false);
	}

	function userState() {
		var userCart =  getCartJson();
		
		var productId, productVariant, productHtml;var cartCount = 0;
		if (typeof userCart === 'object' && Object.keys(userCart).length) {
			$.each(userCart, function(key, value){
				productId = value.productId;
				productVariant = value.variant;
				productDropdown = $('.product_' + productId).find('.item-weight');
				productDropdown.val(value.price);
				$('.product_' + productId).find('.product-cnt').val(value.qty);
				cartCount = cartCount + value.qty;
			});
		}
		$('.dsk-count > span').html(cartCount);
		$('.mob-count').html(cartCount);
		refreshCart();
	}

	function saveCart(orderNow) {
		var userCart = getCartJson();
		var postData = {};
		if (typeof userCart === 'object'  && Object.keys(userCart).length) {
			var i=0;
			$.each(userCart, function(key, value){
				postData[i] = {};
				postData[i].productId = value.productId;
				postData[i].variant = value.variant;
				postData[i].qty = value.qty;
				postData[i].price = value.price;
				postData[i].specialPrice = value.specialPrice;
				postData[i].name = value.name;
				i++;
			});
		}
		
		if (Object.keys(postData).length) {
			$.ajax({
				url: '/saveUserCart/',
				data: postData,
				method: 'post',
				success: function(response){
					if (response.success == true) {
						if (orderNow) {
							window.location.href = "/orderAddress/";	
						}
					}
				}
			})
		}		
		
	}

	function getPincodeDetails(pincode) {
		$('.wrong-pincode-error').addClass('hidden');
		$('#placeorder').attr('disabled', false);
		var data = {"pincode" : pincode};
		$.ajax({
			'method' : 'get',
			'url': '/getPincodeDetails/',
			'data': data,
			success: function(response) {
				if (response.success == false) {
					$('.wrong-pincode-error').removeClass('hidden');
					$('#placeorder').attr('disabled','disabled');
				} else {
					$('#city').val(response.city);
					$('#state').val(response.state);
				}
			}
		})
	}

	function showThankyouPage(deliveryTime) {
		$('.address-screen').hide();
		$('#final-delivery-time').html(deliveryTime);
		$('.thankyou-screen').removeClass('hidden');
		localStorage.removeItem('cartJson');
	}

	function placeOrder(){
		$('.error').addClass('hidden');
		var frm = $('#place-order-form');
		$('#placeOrder').attr('disabled', 'disabled');
	    frm.submit(function (ev) {
	        $.ajax({
	            type: frm.attr('method'),
	            url: frm.attr('action'),
	            data: frm.serialize(),
	            success: function (response) {
	                if (response.success == false) {
	                	if (response.errors.length) {
	                		for (var key in response.errors) {
	                			$('.' + response.errors[key]).removeClass('hidden');
	                		}
	                	}
	                	$('#placeOrder').attr('disabled', false);
	                } else {
	                	if (response.deliveryTime) {
	                		showThankyouPage(response.deliveryTime);	
	                	}
	                }
	            }
	        });

	        ev.preventDefault();
	    });
		
	}

	function getCartJson() {
		var cartJson  = JSON.parse(localStorage.getItem('cartJson')) != null ? JSON.parse(localStorage.getItem('cartJson')) : {};
		if (Object.keys(cartJson).length) {
			return cartJson;
		} else if ($('.cart-json').length > 1) {
			
				var userCartJson = JSON.parse($('.cart-json').html());var newCartJson = {};
				$.each(userCartJson, function(key, productJson){
					if (typeof newCartJson === 'object' && cartJson.hasOwnProperty(productJson.productId + "-" + productJson.variant)) {
						newCartJson[productJson.productId + "-" + productJson.variant]['qty'] = parseInt(newCartJson[productJson.productId + "-" + productJson.variant]['qty']) + 1; 
					} else {
						newCartJson[productJson.productId + "-" + productJson.variant] = productJson;	
					}
				});
				return newCartJson;
		} else {
			return cartJson;
		}
		
	}

	function init() {
		showActiveCategory(1);
		userState();
	}

	init();
});