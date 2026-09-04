from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, HouseUnitViewSet, MarketplaceViewSet

router = DefaultRouter()
router.register('properties', PropertyViewSet, basename='property')
router.register('units', HouseUnitViewSet, basename='unit')
router.register('marketplace', MarketplaceViewSet, basename='marketplace')

urlpatterns = [
    path('', include(router.urls)),
]
