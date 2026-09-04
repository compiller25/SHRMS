from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property, HouseUnit
from .serializers import (PropertySerializer, PropertyListSerializer, PropertyCreateSerializer,
                          HouseUnitSerializer, HouseUnitCreateSerializer)
from .permissions import IsLandlordOrReadOnly, IsPropertyOwner


class PropertyViewSet(viewsets.ModelViewSet):
    """Property CRUD operations"""
    queryset = Property.objects.select_related('landlord', 'landlord__user').prefetch_related('units')
    permission_classes = [IsAuthenticated, IsLandlordOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['property_type', 'city', 'area']
    search_fields = ['name', 'address', 'description', 'area']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action in ('create', 'update', 'partial_update'):
            return PropertyCreateSerializer
        return PropertySerializer

    def create(self, request, *args, **kwargs):
        """Override create to return full PropertySerializer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Return full property data
        instance = serializer.instance
        output_serializer = PropertySerializer(instance)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        """Filter properties based on user role"""
        queryset = super().get_queryset()
        user = self.request.user

        # Landlords see only their properties
        if user.role == 'LANDLORD':
            return queryset.filter(landlord__user=user)

        # Tenants and admins see all properties
        return queryset

    def perform_create(self, serializer):
        """Set landlord as current user's landlord entity"""
        serializer.save(landlord=self.request.user.landlord)

    @action(detail=True, methods=['get'])
    def available_units(self, request, pk=None):
        """Get available units for a property"""
        property_obj = self.get_object()
        units = property_obj.units.filter(status='AVAILABLE')
        serializer = HouseUnitSerializer(units, many=True)
        return Response(serializer.data)


class HouseUnitViewSet(viewsets.ModelViewSet):
    """House Unit CRUD operations"""
    queryset = HouseUnit.objects.select_related('property', 'property__landlord')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['property', 'status', 'bedrooms', 'bathrooms']
    ordering_fields = ['rent_amount', 'bedrooms', 'created_at']
    ordering = ['rent_amount']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return HouseUnitCreateSerializer
        return HouseUnitSerializer

    def create(self, request, *args, **kwargs):
        """Override create to return full HouseUnitSerializer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Return full unit data
        instance = serializer.instance
        output_serializer = HouseUnitSerializer(instance)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        """Filter units based on user role and query params"""
        queryset = super().get_queryset()
        user = self.request.user

        # Landlords see only their property units
        if user.role == 'LANDLORD':
            queryset = queryset.filter(property__landlord__user=user)

        # Filter by availability for tenants
        if user.role == 'TENANT':
            available_only = self.request.query_params.get('available', None)
            if available_only:
                queryset = queryset.filter(status='AVAILABLE')

        # Filter by rent range
        min_rent = self.request.query_params.get('min_rent', None)
        max_rent = self.request.query_params.get('max_rent', None)

        if min_rent:
            queryset = queryset.filter(rent_amount__gte=min_rent)
        if max_rent:
            queryset = queryset.filter(rent_amount__lte=max_rent)

        return queryset

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update unit status (landlord only)"""
        unit = self.get_object()

        # Check if user is the property owner
        if unit.property.landlord.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status not in dict(HouseUnit.UnitStatus.choices):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        unit.status = new_status
        unit.save()

        serializer = HouseUnitSerializer(unit)
        return Response(serializer.data)


class MarketplaceViewSet(viewsets.ReadOnlyModelViewSet):
    """Public marketplace for tenants to browse properties"""
    queryset = Property.objects.select_related('landlord', 'landlord__user').prefetch_related('units')
    serializer_class = PropertyListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['property_type', 'city', 'area']
    search_fields = ['name', 'address', 'description', 'area']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return only properties with available units"""
        queryset = super().get_queryset()
        has_available = self.request.query_params.get('has_available', None)

        if has_available:
            queryset = queryset.filter(units__status='AVAILABLE').distinct()

        return queryset