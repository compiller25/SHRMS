from rest_framework import permissions


class IsLandlordOrReadOnly(permissions.BasePermission):
    """Only landlords can create/edit, others can read"""

    def has_permission(self, request, view):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions only for landlords
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'LANDLORD'
            and hasattr(request.user, 'landlord')
        )


class IsPropertyOwner(permissions.BasePermission):
    """Only property owner can edit"""

    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only for property owner
        return obj.landlord.user == request.user