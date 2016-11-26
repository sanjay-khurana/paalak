/**

JS file for catalog Page

Created By: Sanjay Khurana
*/


$(document).ready(function($){
	
	var cartJson = JSON.parse(localStorage.getItem('cartJson'));;
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

	function showActiveCategory(categoryId){
		$('.category_name').removeClass('active');
		$('.item-list').addClass('hidden');
		$('.category_' + categoryId).removeClass('hidden');
		$('.category_' + categoryId).parents('.category_name').addClass('active');
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
		productJson.qty = productJson.qty + 1;
		productJson.variant = itemList.find('.item-weight :selected').text();


		if (cartJson.hasOwnProperty(productJson.productId + "-" + productJson.variant)) {
			cartJson[productJson.productId + "-" + productJson.variant]['qty'] = cartJson[productJson.productId + "-" + productJson.variant]['qty'] + 1; 
		} else {
			cartJson[productJson.productId + "-" + productJson.variant] = productJson;	
		}
		itemList.find('.product-cnt').val(cartJson[productJson.productId + "-" + productJson.variant]['qty']);
		localStorage.setItem('cartJson', JSON.stringify(cartJson));
		refreshCart();
	}

	function removeFromBasket(productId, productVariant) {
		var userCart =  JSON.parse(localStorage.getItem('cartJson'));
		if (Object.keys(userCart).length && userCart.hasOwnProperty(productId + '-' + productVariant)) {
			if (userCart[productId + '-' + productVariant].qty == 1) {
				delete userCart[productId + '-' + productVariant];
			} else {
				userCart[productId + '-' + productVariant].qty--;
			}
		}
		localStorage.setItem('cartJson', JSON.stringify(userCart));
		refreshCart();
	}	

	function refreshCart(){
		var localCartJson = JSON.parse(localStorage.getItem('cartJson'));
		var cartHtml = "";
		var newCartHtml = "";
		
		for (var key in localCartJson) {
			cartHtml = $('.cart-items-temp');
			cartHtml.find('.prd-name').html(localCartJson[key].name);
			cartHtml.find('.prd-qty').html(localCartJson[key].qty);
			cartHtml.find('.prd-price').html(localCartJson[key].price * localCartJson[key].qty);
			cartHtml.find('.prd-variant').html(localCartJson[key].variant);
			cartHtml.find('.onpage-cart-item').removeClass('hidden');
			newCartHtml += cartHtml.html();
			cartHtml = "";
		}
		$('.cart-items').html(newCartHtml);
	}

	function userState() {
		var userCart =  JSON.parse(localStorage.getItem('cartJson'));
		var productId, productVariant, productHtml;
		if (Object.keys(userCart).length) {
			$.each(userCart, function(key, value){
				productId = value.productId;
				productVariant = value.variant;
				productDropdown = $('.product_' + productId).find('.item-weight');
				productDropdown.val(value.price);
				$('.product_' + productId).find('.product-cnt').val(value.qty);
			});
		}
		refreshCart();
	}

	function init() {
		showActiveCategory(1);
		userState();
	}

	init();
});