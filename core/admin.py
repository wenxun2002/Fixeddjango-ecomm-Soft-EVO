from django.contrib import admin
from core.models import Product, Category, Vendor, CartOrder, CartOrderItems, \
ProductImages, ProductReview, Wishlist, Address, ContactUs

class ProductImagesAdmin(admin.TabularInline):
	model = ProductImages

class ProductAdmin(admin.ModelAdmin):
	inlines = [ProductImagesAdmin]
	list_display = ['title', 'product_image', 'price','category', 'vendor', 'featured', 'product_status', 'pid', 'user']
	readonly_fields = ['pid']
	fields = ['pid', 'user', 'title', 'category', 'vendor', 'image', 'description', 'price', 'old_price', 'specifications', 'product_status', 'featured']

class CategotyAdmin(admin.ModelAdmin):
	list_display = ['title', 'category_image', 'cid']
	readonly_fields = ['cid']
	fields = ['cid', 'title']	

class VendorAdmin(admin.ModelAdmin):
	list_display = ['title', 'vendor_image', 'vid']
	readonly_fields = ['vid']
	fields = ['vid', 'title']

# class CartOrderAdmin(admin.ModelAdmin):
# 	list_display = ['user', 'price', 'paid_status', 'order_date', 'product_status']

# class CartOrderItemsAdmin(admin.ModelAdmin):
# 	list_display = ['order', 'invoice_no', 'item', 'image', 'qty', 'price', 'total']

class ProductReviewAdmin(admin.ModelAdmin):
	list_display = ['user', 'product', 'rating']
	readonly_fields = ['user', 'product', 'rating', 'review']
	fields = ['user', 'product', 'rating', 'review']

class WishlistAdmin(admin.ModelAdmin):
	list_display = ['user', 'product', 'date']
	readonly_fields = ['user', 'product']
	fields = ['user', 'product']

# class AddressAdmin(admin.ModelAdmin):
# 	list_display = ['user', 'address', 'status']

class ContactUsAdmin(admin.ModelAdmin):
	list_display = ['name', 'email']

admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategotyAdmin)
admin.site.register(Vendor, VendorAdmin)
# admin.site.register(CartOrder, CartOrderAdmin)
# admin.site.register(CartOrderItems, CartOrderItemsAdmin)
admin.site.register(ProductReview, ProductReviewAdmin)
admin.site.register(Wishlist, WishlistAdmin)
# admin.site.register(Address, AddressAdmin)
admin.site.register(ContactUs, ContactUsAdmin)
