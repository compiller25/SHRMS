from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Landlord, Tenant


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'auth_provider', 'is_staff', 'created_at']
    list_filter = ['role', 'auth_provider', 'is_staff', 'is_active']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone', 'gender', 'address')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser'),
        }),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
        ('Custom Fields', {'fields': ('role',)}),
        ('Google OAuth', {
            'fields': ('google_id', 'google_access_token', 'auth_provider'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone', 'gender', 'address')}),
        ('Custom Fields', {'fields': ('role',)}),
    )
    
    readonly_fields = ['google_id', 'created_at', 'updated_at', 'last_login']
    filter_horizontal = []  # Don't use many-to-many fields


@admin.register(Landlord)
class LandlordAdmin(admin.ModelAdmin):
    list_display = ['user_full_name', 'user_email', 'business_name', 'is_verified', 'created_at']
    list_filter = ['is_verified']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'business_name']

    @admin.display(description='Full name', ordering='user__first_name')
    def user_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    @admin.display(description='Email', ordering='user__email')
    def user_email(self, obj):
        return obj.user.email

    @admin.display(description='Created at', ordering='-user__created_at')
    def created_at(self, obj):
        return obj.user.created_at


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['user_full_name', 'national_id', 'user_phone', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'national_id']

    @admin.display(description='Full name', ordering='user__first_name')
    def user_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    @admin.display(description='Phone', ordering='user__phone')
    def user_phone(self, obj):
        return obj.user.phone

    @admin.display(description='Created at', ordering='-user__created_at')
    def created_at(self, obj):
        return obj.user.created_at