"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/auth/', include('users.urls')),
    path('api/', include('properties.urls')),
    path('api/rentals/', include('rentals.urls')),
    path('api/', include('payments.urls')),
]

# Serve media files in both dev and prod (Render has no separate media server for MVP).
# For scale, move to S3/Cloudinary later.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

