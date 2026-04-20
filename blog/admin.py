from django.contrib import admin
from blog.models import Post, Category, Comment

class PostAdmin(admin.ModelAdmin):
	list_display = ['title', 'blog_image', 'pid']
	readonly_fields = ['pid']
	fields = ['pid', 'user', 'categories', 'tags', 'image', 'title', 'subtitle', 'body', 'post_status']
	
class CategoryAdmin(admin.ModelAdmin):
	list_display = ['title', 'cid']
	readonly_fields = ['cid']
	fields = ['cid', 'title']

class CommentAdmin(admin.ModelAdmin):
	list_display = ['user', 'post']

admin.site.register(Post, PostAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Comment, CommentAdmin)