from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Landlord, Tenant


class LandlordSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    gender = serializers.CharField(source='user.gender', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    address = serializers.CharField(source='user.address', read_only=True)
    created_at = serializers.DateTimeField(source='user.created_at', read_only=True)
    updated_at = serializers.DateTimeField(source='user.updated_at', read_only=True)

    class Meta:
        model = Landlord
        fields = ['id', 'full_name', 'gender', 'phone', 'email', 'address',
                  'business_name', 'is_verified',
                  'created_at', 'updated_at']


class TenantSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    gender = serializers.CharField(source='user.gender', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    address = serializers.CharField(source='user.address', read_only=True)
    created_at = serializers.DateTimeField(source='user.created_at', read_only=True)
    updated_at = serializers.DateTimeField(source='user.updated_at', read_only=True)

    class Meta:
        model = Tenant
        fields = ['id', 'full_name', 'national_id', 'gender', 'phone', 'email', 'address',
                  'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    landlord = LandlordSerializer(read_only=True)
    tenant = TenantSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'gender', 'address', 'role',
                  'landlord', 'tenant', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name',
                  'phone', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email', '').strip()
        username = attrs.get('username', '').strip()

        # At least one of email or username must be provided
        if not email and not username:
            raise serializers.ValidationError(
                "Either 'email' or 'username' must be provided."
            )

        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth token validation"""
    token = serializers.CharField(required=True, help_text="Google ID token from frontend")
    role = serializers.ChoiceField(
        choices=['LANDLORD', 'TENANT'],
        default='TENANT',
        required=False,
        help_text="User role for new account creation"
    )

    def validate_token(self, value):
        if not value:
            raise serializers.ValidationError("Token is required")
        return value


class GoogleCallbackSerializer(serializers.Serializer):
    """Serializer for Google OAuth callback data"""
    id_token = serializers.CharField(required=True)
    access_token = serializers.CharField(required=True)
    role = serializers.ChoiceField(
        choices=['LANDLORD', 'TENANT'],
        default='TENANT',
        required=False
    )


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        help_text="Current password"
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        help_text="New password"
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        help_text="Confirm new password"
    )

    def validate(self, attrs):
        """Validate that new passwords match"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "New password fields didn't match."
            })
        return attrs

    def validate_old_password(self, value):
        """Validate that old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

