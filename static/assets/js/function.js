
// Comment form

const monthNames = ["Jan", "Feb", "Mar", "April", "May",
	"June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

$('#commentForm').submit(function(e){
	e.preventDefault();

	let dt = new Date();
	let time = dt.getDate() + " " + monthNames[dt.getUTCMonth()] + ", " + dt.getFullYear();

	$.ajax({
		data: $(this).serialize(),

		method: $(this).attr('method'),

		url: $(this).attr('action'),

		dataType: 'json',

		success: function(res){
			console.log('Comment saved to DB!..');

			if(res.bool == true){
				$('#reviewRes').html('Review Added Successfully!')
				$('.hide-review').hide()
				$('.add-review').hide()

				let _html = '<div class="comment-block">'
					_html += '<img src="' + res.context.image + '" alt="User" style="width: 55px; height: 55px;">'
					_html += '<span>'+ res.context.user +'</span>'
					_html += '<span> - </span>'
					_html += '<span>'+ time +'</span>'
					_html += '<span> - </span>'

					for(let i = 1; i<=res.context.rating; i++){
						_html += '<i class="fas fa-star"></i>'
					}

					_html += '<p>'+ res.context.review +'</p>'

					_html += '</div>'

					$('.reviews-block').prepend(_html)
			}			
		}
	})
})

$('#blogCommentForm').submit(function(e){
	e.preventDefault();

	let dt = new Date();
	let time = dt.getDate() + " " + monthNames[dt.getUTCMonth()] + ", " + dt.getFullYear();

	$.ajax({
		data: $(this).serialize(),

		method: $(this).attr('method'),

		url: $(this).attr('action'),

		dataType: 'json',

		success: function(res){
			console.log('Comment saved to DB!..');

			if(res.bool == true){
				$('#blogCommentRes').html('Comment Added Successfully!')
				$('.hide-comment').hide()

				let	_html =	'<div class="card-body">'
					_html += '<div class="d-flex flex-start align-items-center">'
					_html += '<img class="rounded-circle shadow-1-strong mr-3" src="' + res.context.image + '" alt="avatar" width="60" height="60" />'
					_html += '<div>'
					_html += '<h6 class="font-weight-bold mb-1">'+ res.context.user +'</h6>'
					_html += '<p class="text-muted small mb-0">'+ time +'</p>'
					_html += '</div>'
					_html += '</div>'
					_html += '<p class="mt-3">'+ res.context.comment +'</p>'
					_html += '</div>'
					_html += '<hr class="my-0">'

					$('.card').prepend(_html)
 	
			}			
		}
	})
})



$(document).ready(function (){

	// Filter

	$('.filter-checkbox, #price-filter-btn').on('click', function(){
		// console.log('Its working Cliked..');

		let filter_object = {}
		let min_price = $('#max_price').attr('min')
		let max_price = $('#max_price').val()

		filter_object.min_price = min_price
		filter_object.max_price = max_price

		$('.filter-checkbox').each(function(){
			let filter_value = $(this).val()
			let filter_key = $(this).data('filter')

			// console.log("filter value is:", filter_value);
			// console.log("filter key is:", filter_key);

			filter_object[filter_key] = Array.from(document.querySelectorAll('input[data-filter='+ filter_key +']:checked')).map(function(element){
				return element.value
			})
		})
		// console.log('Filter Object is:', filter_object);
		$.ajax({
			url: '/filter-product',
			data: filter_object,
			dataType: 'json',
			beforeSend: function(){
				console.log('Trying to filter products...')
			},
			success: function(response){
				console.log(response)
				// console.log('Data filtered successfully')
				$('#filtered-product').html(response.data)
			}
		})
	})

	$("#max_price").on('blur', function(){
		let min_price = $(this).attr('min')
		let max_price = $(this).attr('max')
		let current_price = $(this).val()

		// console.log('current_price is:', current_price);
		// console.log('min_price is:', min_price);
		// console.log('max_price is:', max_price);

		if(current_price < parseInt(min_price) || current_price > parseInt(max_price)){
			// console.log('Price Error Occured')

			min_Price = Math.round(min_price * 100) / 100
			max_Price = Math.round(max_price * 100) / 100

			// console.log('Min price is:', min_Price)
			// console.log('Max price is:', max_Price)

			alert('Price must between $' +min_Price + ' and $' +max_Price)
			$(this).val(min_Price)
			$('#range').val(min_Price)

			$(this).focus()

			return false
		}
	})

	// Add to cart

	$('.add-to-cart-btn').on('click', function(){

		let this_val = $(this)
		
		// 解决场景B并发问题：如果在请求中（或者两秒动画内），禁用按钮防止连点
		if (this_val.prop('disabled')) {
			return false;
		}
		this_val.prop('disabled', true);
		this_val.css('pointer-events', 'none');

		let index = this_val.attr('data-index')

		let quantity = $('.product-quantity-' + index).val()
		let id = $('.product-id-' + index).val()
		let title = $('.product-title-' + index).val()
		let price = $('.current-product-price-' + index).text()
		let pid = $('.product-pid-' + index).val()
		let image = $('.product-image-' + index).val()

		$.ajax({
			url: '/add-to-cart',
			data: {
				'id': id,
				'pid': pid,
				'qty': quantity,
				'title': title,
				'price': price,
				'image': image,
			},
			dataType: 'json',
			beforeSend: function(){
				console.log('Adding product to cart...')
			},
			success: function(response){
				let originalHtml = this_val.html();
				this_val.html('<i class="fa fa-check"></i>')
				console.log('Added product to cart.')
				$('.cart-items-count').text(response.totalcartitems)
				if (response.warning) {
					setTimeout(function(){
						alert(response.warning);
					}, 100);
				}
				setTimeout(function(){
					this_val.html(originalHtml);
					// 恢复按钮可点击状态
					this_val.prop('disabled', false);
					this_val.css('pointer-events', 'auto');
				}, 2000);
			},
			error: function(){
				// 请求失败时也要恢复按钮
				this_val.prop('disabled', false);
				this_val.css('pointer-events', 'auto');
			}
		})
	})

	// Delete from cart

	$(document).on('click', '.delete-product', function(){

		let product_id = $(this).attr("data-product")
		let this_val = $(this)

		$.ajax({
			url: '/delete-from-cart',
			data: {
				'id': product_id,
			},
			dataType: 'json',
			beforeSend: function(){
				this_val.hide()
			},
			success: function(response){
				this_val.show()
				$('.cart-items-count').text(response.totalcartitems)
				$('#cart-list').html(response.data)
			}
		})
	})

	let updateCartTimer;

	function updateCartTotalsAndBackend(product_id, qty, row) {
		// Update item total locally
		let priceStr = row.find('.shoping__cart__price').text().replace('$', '').trim();
		let price = parseFloat(priceStr);
		if (!isNaN(price) && !isNaN(qty)) {
			let itemTotal = price * qty;
			row.find('.shoping__cart__total').text('$' + itemTotal.toFixed(2));
		}

		// Update overall cart total locally
		let total = 0;
		$('.shoping__cart__total').each(function(){
			let t = parseFloat($(this).text().replace('$', '').trim());
			if (!isNaN(t)) total += t;
		});
		$('.shoping__checkout ul li span').text('$' + total.toFixed(2));

		// Debounce backend update to avoid race conditions and massive spam
		clearTimeout(updateCartTimer);
		updateCartTimer = setTimeout(function(){
			$.ajax({
				url: '/update-cart',
				data: {
					'id': product_id,
					'qty': qty,
				},
				dataType: 'json',
				success: function(response){
					// We intentionally do not replace `#cart-list` with `response.data` here
					// Because doing so would lose input focus and reset UI elements while the user is rapidly clicking.
					// The cart totals and info are already updated locally and are visually correct.
				}
			});
		}, 500);
	}

	// Update products on clicking plus/minus
	$(document).on('click', '.qtybtn', function(){
		let _this = $(this);
		let input = _this.siblings('input');
		let qty = parseInt(input.val());
		let row = _this.closest('tr');
		// Determine if we are in cart page by checking for the update/delete product buttons
		let updateBtn = row.find('.update-product, .delete-product');

		if (updateBtn.length) {
			let product_id = updateBtn.attr("data-product");
			updateCartTotalsAndBackend(product_id, qty, row);
		}
	});

	// Update products on manually changing input value
	$(document).on('keyup change', '.shoping__cart__quantity input[type="text"]', function(){
		let input = $(this);
		let qty = parseInt(input.val());
		if (isNaN(qty) || qty < 0) return;
		let row = input.closest('tr');
		let updateBtn = row.find('.update-product, .delete-product');

		if (updateBtn.length) {
			let product_id = updateBtn.attr("data-product");
			updateCartTotalsAndBackend(product_id, qty, row);
		}
	});

	// Legacy manual update button logic (left intact roughly for compatibility, but skipping html replace)
	$(document).on('click', '.update-product', function(){
		let product_id = $(this).attr("data-product");
		let this_val = $(this);
		let product_quantity = $('.product-qty-' + product_id).val();

		$.ajax({
			url: '/update-cart',
			data: {
				'id': product_id,
				'qty': product_quantity,
			},
			dataType: 'json',
			beforeSend: function(){
				this_val.hide();
			},
			success: function(response){
				this_val.show();
				// Again, skipping `.html(response.data)` to not reset interactions, 
				// but triggering local calculation just in case.
				let row = this_val.closest('tr');
				updateCartTotalsAndBackend(product_id, product_quantity, row);
			}
		});
	});

	$(document).on('click', '.add-to-wishlist', function(){
		let product_id = $(this).attr('data-product-item')
		let this_val = $(this)

		$.ajax({
			url: '/add-to-wishlist',
			data: {
				'id': product_id,
			},
			dataType: 'json',
			beforeSend: function(){
				console.log('Saving to wishlist...')
			},
			success: function(response){
				if (response.bool === true) {
					this_val.html('<span class="icon_heart"></span>')
					console.log('Added product to wishlist.')
				} else {
					this_val.html('<span class="icon_heart_alt"></span>')
					console.log('Removed product from wishlist.')
				}
				$('.wishlist-items-count').text(response.wishlist_count)
			}
		})
	})

	$(document).on('click', '.delete-wishlist-product', function(){
		let wishlist_id = $(this).attr("data-wishlist-product")
		let this_val = $(this)

		console.log('id', wishlist_id)

		$.ajax({
			url: '/remove-from-wishlist',
			data: {
				'id': wishlist_id,
			},
			dataType: 'json',
			beforeSend: function(){
				console.log('Deleting from wishlist...')
			},
			success: function(response){
				$('#wishlist-list').html(response.data)
			}
		})
	})

	$(document).on('submit', '#ajax-contact-form', function(e){
		e.preventDefault()

		let name = $('#name').val()
		let email = $('#email').val()
		let message = $('#message').val()

		$.ajax({
			url: '/ajax-contact-form',
			data: {
				'name': name,
				'email': email,
				'message': message,
			},
			dataType: 'json',
			beforeSend: function(){
				console.log('Sending data to server...')
			},
			success: function(response){
				console.log('Data send to server successfully.')
				$('#ajax-contact-form')[0].reset();
				$('#ajax-contact-form').hide()
				$('.contact__form__title').html('<h2>Message Sent Successfully!</h2>')
			}
		})
	})
})

// Delete symbols from cart quantity & Restrict max stock

$(document).on('input', '.shoping__cart__quantity input[type="text"], .product__details__quantity input[type="text"]', function() {
    var value = $(this).val();
    var cleanedValue = value.replace(/[^\d]/g, '');

    var maxStock = $(this).data('max');
    if (cleanedValue !== '' && maxStock !== undefined && parseInt(cleanedValue) > parseInt(maxStock)) {
        alert("You can't add more than the available stock (" + maxStock + ")!");
        cleanedValue = maxStock;
    }

    $(this).val(cleanedValue);
});

// Username Validation

$(document).on('input', '.username-validation', function() {
    var value = $(this).val();
    var cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '');
    cleanedValue = cleanedValue.substring(0, 12);
    $(this).val(cleanedValue);
});

// For account photo file input
function updateFileName() {
	var input = document.getElementById('customFile');
	var label = document.getElementById('fileNameLabel');
	var fileName = input.files[0].name;
	label.innerText = fileName;
}