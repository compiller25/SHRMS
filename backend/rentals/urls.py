from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RentalAgreementViewSet

router = DefaultRouter()
router.register('agreements', RentalAgreementViewSet, basename='agreement')

urlpatterns = [
    path('', include(router.urls)),
]
