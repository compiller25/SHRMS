from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    GoogleAuthSerializer, GoogleCallbackSerializer, ChangePasswordSerializer
)
from .google_auth import verify_google_token, get_or_create_google_user


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint - supports both email and username"""
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data.get('email', '').strip()
        username = serializer.validated_data.get('username', '').strip()
        password = serializer.validated_data['password']
        
        # Try to find user by email or username
        user = None
        try:
            if email:
                user = User.objects.get(email=email)
            elif username:
                user = User.objects.get(username=username)
        except User.DoesNotExist:
            pass
        
        # Check if user exists and password is correct
        if user and user.check_password(password):
            # User authenticated successfully
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Login successful'
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


class GoogleAuthView(APIView):
    """Google OAuth authentication endpoint"""
    permission_classes = (AllowAny,)
    serializer_class = GoogleAuthSerializer
    
    def post(self, request):
        """
        Authenticate user with Google ID token
        
        Expected request body:
        {
            "token": "google_id_token",
            "role": "TENANT" or "LANDLORD" (optional, defaults to TENANT)
        }
        """
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        role = serializer.validated_data.get('role', 'TENANT')
        
        try:
            # Verify Google token
            google_info = verify_google_token(token)
            
            # Get or create user
            user, created = get_or_create_google_user(google_info, role=role)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'created': created,
                'message': 'Registration successful via Google' if created else 'Login successful via Google'
            }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Authentication failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleCallbackView(APIView):
    """Google OAuth callback endpoint (alternative approach)"""
    permission_classes = (AllowAny,)
    serializer_class = GoogleCallbackSerializer
    
    def post(self, request):
        """
        Handle Google OAuth callback
        
        Expected request body:
        {
            "id_token": "google_id_token",
            "access_token": "google_access_token",
            "role": "TENANT" or "LANDLORD" (optional)
        }
        """
        serializer = GoogleCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        id_token = serializer.validated_data['id_token']
        role = serializer.validated_data.get('role', 'TENANT')
        
        try:
            # Verify Google ID token
            google_info = verify_google_token(id_token)
            
            # Get or create user
            user, created = get_or_create_google_user(google_info, role=role)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'created': created,
                'message': 'Registration successful via Google' if created else 'Login successful via Google'
            }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Authentication failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'refresh_token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # The JWT blacklist app is not installed, so we simply validate the
        # refresh token here; the client already discards its stored tokens.
        try:
            RefreshToken(refresh_token)
        except TokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change user password endpoint"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer
    
    def post(self, request):
        """
        Change user password
        
        Expected request body:
        {
            "old_password": "current_password",
            "new_password": "new_password",
            "new_password_confirm": "new_password"
        }
        """
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        new_password = serializer.validated_data['new_password']
        
        # Set the new password
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
