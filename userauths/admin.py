from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from userauths.models import User

class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_image']
    
    fieldsets = (
        ('Account', {'fields': ('username', 'password')}),
        ('Personal', {'fields': ('name', 'email', 'phone', 'bio', 'image')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('last_login', 'date_joined')}),
    )

admin.site.register(User, UserAdmin)
