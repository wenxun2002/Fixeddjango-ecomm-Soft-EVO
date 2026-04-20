from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib import messages
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Avg, F, ExpressionWrapper, DecimalField
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.core import serializers
from core.models import Product, Category, Vendor, CartOrder, CartOrderItems, \
ProductImages, ProductReview, Wishlist, Address, ContactUs
from core.forms import ProductReviewFrom
from taggit.models import Tag

def index(request):
	products = Product.objects.filter(product_status='published', featured=True)

	special_offers = Product.objects.filter(product_status='published').annotate(
		discount_percentage=ExpressionWrapper(
			((F('old_price') - F('price')) / F('old_price')) * 100,
			output_field=DecimalField()
		)
    ).order_by('-discount_percentage')[:9]
    
	oldest_products = Product.objects.filter(product_status='published').order_by('date')

	context = {
		"products": products,
		"special_offers": special_offers,
		"oldest_products": oldest_products,
	}
	return render(request, 'core/index.html', context)

def products_list_view(request):
	products = Product.objects.filter(product_status='published')
	context = {
		"products": products
	}
	return render(request, 'core/product-list.html', context)

def category_list_view(request):
	categories = Category.objects.all()
	context = {
		"categories": categories,
	}
	return render(request, 'core/category-list.html', context)

def category_product_list_view(request, cid):
	category = Category.objects.get(cid=cid)
	products = Product.objects.filter(product_status='published', category=category)
	context = {
		"category": category,
		"products": products,
	}
	return render(request, 'core/category-products-list.html', context)

def vendor_list_view(request):
	vendors = Vendor.objects.all()
	context = {
		'vendors': vendors,
	}
	return render(request, 'core/vendor-list.html', context)

def vendor_detail_view(request, vid):
	vendor = Vendor.objects.get(vid=vid)
	products = Product.objects.filter(product_status='published', vendor=vendor)
	context = {
		'vendor': vendor,
		'products': products,
	}
	return render(request, 'core/vendor-detail.html', context)

def product_detail_view(request, pid):
	product = Product.objects.get(pid=pid)
	# product = get_object_or_404(Product, pid=pid)
	products = Product.objects.filter(category=product.category).exclude(pid=pid)
	p_image = product.p_images.all()

	reviews = ProductReview.objects.filter(product=product).order_by('-date')
	average_rating = ProductReview.objects.filter(product=product).aggregate(rating=Avg('rating'))
	review_form = ProductReviewFrom()

	make_review = True
	if request.user.is_authenticated:
		user_review_count = ProductReview.objects.filter(user=request.user, product=product).count() 

		if user_review_count > 0:
			make_review = False

	context = {
		'product': product,
		'p_image': p_image,
		'products': products,
		'reviews': reviews,
		'average_rating': average_rating,
		'review_form': review_form,
		'make_review': make_review,
	}
	return render(request, 'core/product-detail.html', context)

def tags_list(request, tag_slug=None):
	products = Product.objects.filter(product_status='published').order_by('-id')

	tag = None
	if tag_slug:
		tag = Tag.objects.get(slug=tag_slug)
		# tag = get_object_or_404(Tag, slug=tag_slug)
		products = products.filter(tags__in=[tag])

	context = {
		'products': products,
		'tag': tag,
	}

	return render(request, 'core/tag.html', context)

def ajax_add_review(request, pid):
	product = Product.objects.get(pk=pid)
	user = request.user
	image = user.image.url

	review = ProductReview.objects.create(
		user=user,
		product=product,
		review=request.POST['review'],
		rating=request.POST['rating'],
	)
	
	context = {
		'user': user.username,
		'review': request.POST['review'],
		'rating': request.POST['rating'],
		'image': image
	}

	average_reviews = ProductReview.objects.filter(product=product).aggregate(rating=Avg('rating'))


	return JsonResponse(
		{
			'bool': True,
			'context': context,
			'average_reviews': average_reviews,
		}
	)

def search_view(request):
	# query = request.GET['q'] OR
	query = request.GET.get('q') 

	products = Product.objects.filter(title__icontains=query).order_by('-date')

	context = {
		'products': products,
		'query': query,
	}

	return render(request, 'core/search.html', context)

def filter_product(request):
	categories = request.GET.getlist('category[]')
	vendors = request.GET.getlist('vendor[]')

	min_price = request.GET.get('min_price')
	max_price = request.GET.get('max_price')

	products = Product.objects.filter(product_status='published').order_by('-id').distinct()

	products = products.filter(price__gte=min_price)
	products = products.filter(price__lte=max_price)

	if len(categories) > 0:
		products = products.filter(category__id__in=categories).distinct()
	if len(vendors) > 0:
		products = products.filter(vendor__id__in=vendors).distinct()

	context = {
		'products': products
	}

	data = render_to_string('core/async/product-list.html', context)
	return JsonResponse({'data': data})

def add_to_cart(request):
	product_id = str(request.GET['id'])
	try:
		product_obj = Product.objects.get(id=product_id)
		max_stock = product_obj.stock_count
	except Exception:
		max_stock = float('inf')

	cart_product = {}
	cart_product[product_id] = {
		'qty': int(request.GET['qty']),
		'title': request.GET['title'],
		'price': request.GET['price'],
		'image': request.GET['image'],
		'pid': request.GET['pid'],
	}

	warning_msg = ""
	
	if 'cart_data_object' in request.session:
		if product_id in request.session['cart_data_object']:
			cart_data = request.session['cart_data_object']
			existing_qty = int(cart_data[product_id]['qty'])
			new_qty = existing_qty + cart_product[product_id]['qty']
			if new_qty > max_stock:
				new_qty = max_stock
				warning_msg = f"Cannot add more than {max_stock} items."
			cart_data[product_id]['qty'] = new_qty
			request.session['cart_data_object'] = cart_data
		else:
			if cart_product[product_id]['qty'] > max_stock:
				cart_product[product_id]['qty'] = max_stock
				warning_msg = f"Cannot add more than {max_stock} items."
			cart_data = request.session['cart_data_object']
			cart_data.update(cart_product)
			request.session['cart_data_object'] = cart_data
	else:
		if cart_product[product_id]['qty'] > max_stock:
			cart_product[product_id]['qty'] = max_stock
			warning_msg = f"Cannot add more than {max_stock} items."
		request.session['cart_data_object'] = cart_product

	return JsonResponse({
			'data': request.session['cart_data_object'],
			'totalcartitems': len(request.session['cart_data_object']),
			'warning': warning_msg
		})

def cart_view(request):
	cart_total_amount = 0
	if 'cart_data_object' in request.session:
		for product_id, item in request.session['cart_data_object'].items():
			cart_total_amount += int(item['qty']) * float(item['price'])
			try:
				product = Product.objects.get(id=product_id)
				item['stock_count'] = product.stock_count
			except Exception:
				item['stock_count'] = ''

		return render(request, 'core/cart.html', {
			'cart_data': request.session['cart_data_object'],
			'totalcartitems': len(request.session['cart_data_object']),
			'cart_total_amount': cart_total_amount
		})
		
	else:
		return render(request, 'core/cart.html')

def delete_from_cart(request):
	product_id = str(request.GET['id'])
	if 'cart_data_object' in request.session:
		if product_id in request.session['cart_data_object']:
			cart_data = request.session['cart_data_object']
			del request.session['cart_data_object'][product_id]
			request.session['cart_data_object'] = cart_data

	cart_total_amount = 0
	if 'cart_data_object' in request.session:
		for product_id, item in request.session['cart_data_object'].items():
			cart_total_amount += int(item['qty']) * float(item['price'])
			try:
				product = Product.objects.get(id=product_id)
				item['stock_count'] = product.stock_count
			except Exception:
				item['stock_count'] = ''

	context = render_to_string('core/async/cart-list.html', {
			'cart_data': request.session['cart_data_object'],
			'totalcartitems': len(request.session['cart_data_object']),
			'cart_total_amount': cart_total_amount
		})
	return JsonResponse({
			'data': context,
			'totalcartitems': len(request.session['cart_data_object']),
		})

def update_cart(request):
	product_id = str(request.GET['id'])
	product_qty = request.GET['qty']
	if 'cart_data_object' in request.session:
		if product_id in request.session['cart_data_object']:
			cart_data = request.session['cart_data_object']
			cart_data[str(request.GET['id'])]['qty'] = product_qty
			request.session['cart_data_object'] = cart_data

	cart_total_amount = 0
	if 'cart_data_object' in request.session:
		for product_id, item in request.session['cart_data_object'].items():
			cart_total_amount += int(item['qty']) * float(item['price'])
			try:
				product = Product.objects.get(id=product_id)
				item['stock_count'] = product.stock_count
			except Exception:
				item['stock_count'] = ''
	context = render_to_string('core/async/cart-list.html', {
			'cart_data': request.session['cart_data_object'],
			'totalcartitems': len(request.session['cart_data_object']),
			'cart_total_amount': cart_total_amount
		})
	return JsonResponse({
			'data': context,
			'totalcartitems': len(request.session['cart_data_object']),
		})

@login_required
def wishlist_view(request):
	try:
		wishlist = Wishlist.objects.filter(user=request.user)
	except:
		wishlist = None

	context = {
		'wishlist': wishlist
	}
	return render(request, 'core/wishlist.html', context)

@login_required
def add_to_wishlist(request):
	product_id = request.GET['id']
	product = Product.objects.get(id=product_id)

	context = {}

	wishlist_qs = Wishlist.objects.filter(product=product, user=request.user)

	if wishlist_qs.exists():
		wishlist_qs.delete()
		context	= {
			'bool': False,
			'wishlist_count': Wishlist.objects.filter(user=request.user).count()
		}
	else:
		new_wishlist = Wishlist.objects.create(
			product=product,
			user=request.user
		)
		context = {
			'bool': True,
			'wishlist_count': Wishlist.objects.filter(user=request.user).count()
		}

	return JsonResponse(context)

def remove_from_wishlist(request):
	product_id = request.GET['id']
	wishlist = Wishlist.objects.filter(user=request.user)

	product = Wishlist.objects.get(id=product_id)
	product.delete()

	context = {
		'bool': True,
		'wishlist': wishlist
	}
	qs_json = serializers.serialize('json', wishlist)
	data = render_to_string('core/async/wishlist-list.html', context)
	return JsonResponse({'data': data, 'wishlist': qs_json})

def contact(request):
	return render(request, 'core/contact.html')

def ajax_contact_form(request):
	name = request.GET['name']
	email = request.GET['email']
	message = request.GET['message']

	contact = ContactUs.objects.create(
		name=name,		
		email=email,		
		message=message,		
	)

	try:
		# Send email alert to the store owner
		send_mail(
			subject=f"New Contact Message from {name}",
			message=f"Name: {name}\nEmail: {email}\nMessage:\n{message}",
			from_email=settings.EMAIL_HOST_USER,
			recipient_list=[settings.EMAIL_HOST_USER],
			fail_silently=True,
		)
		
		# Send an auto-reply to the user who filled the form
		send_mail(
			subject=f"We received your message, {name}!",
			message=f"Hi {name},\n\nThank you for contacting Valleys. We have received your message and will get back to you shortly.\n\nYour message:\n{message}\n\nBest regards,\nThe Valleys Team",
			from_email=settings.EMAIL_HOST_USER,
			recipient_list=[email],
			fail_silently=True,
		)
	except Exception:
		pass

	data = {
		'bool': True,
	}

	return JsonResponse({'data': data})

def about(request):
	return render(request, 'core/about.html')

def subscribe_newsletter(request):
	if request.method == "POST":
		email = request.POST.get("email")
		if email:
			try:
				subject = "Thank you for subscribing!"
				message = "Welcome to Valleys! Thank you for subscribing to our newsletter! You will receive updates about our latest shop and special offers right here."
				html_message = "<strong>Welcome to Valleys!</strong><br><br>Thank you for subscribing to our newsletter! You will receive updates about our latest shop and special offers right here.<br><br>Best regards,<br>The Valleys Team"
				
				send_mail(
					subject=subject,
					message=message,
					from_email=settings.EMAIL_HOST_USER, # Replace with your sender email
					recipient_list=[email],
					fail_silently=False,
					html_message=html_message
				)
				messages.success(request, "Successfully subscribed to our newsletter!", extra_tags="subscribe_success")
			except Exception as e:
				messages.error(request, f"Subscription failed. Please check your email config.", extra_tags="subscribe_error")
		return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))
	return redirect('core:index')
