from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission
from .serializers import UserSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.utils import timezone
from .models import PasswordResetToken
from django.core.exceptions import PermissionDenied

User = get_user_model()

class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperUser])
def list_users(request):
    """List all users except superusers."""
    users = User.objects.filter(is_superuser=False)  # Exclude superusers
    user_list = UserSerializer(users, many=True).data  # Use the serializer to format the data
    return Response({'users': user_list})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsSuperUser])
def delete_user(request, user_id):
    """Delete a specific user by ID."""
    print(request.data)
    try:
        user = User.objects.get(id=user_id)
        if user == request.user:
            return Response({'error': "You cannot delete yourself."}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def login(request):
    """Authenticate and log in a user."""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)
    
    if not user.check_password(password):
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    refresh = RefreshToken.for_user(user)
    serializer = UserSerializer(user)
    
    return Response({
        'user': serializer.data,
        'token': {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def register(request):
    """Register a new user."""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(request.data['password'])
        user.is_active = True
        user.save()
        token = Token.objects.create(user=user)
        return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Log out the authenticated user."""
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        token = RefreshToken(refresh_token)
        token.blacklist()  # Ensure the blacklist feature is enabled
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSuperUser])
def update_user_permissions(request):
    """Update user permissions based on the provided data."""
    user_id = request.data.get('user_id')
    permissions = request.data.get('permissions', {})  # Dictionary of permission fields

    if not user_id or not isinstance(permissions, dict):
        return Response({'error': 'user_id and permissions are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
        
        # Update permissions based on the provided data
        for perm, value in permissions.items():
            if hasattr(user, perm):
                setattr(user, perm, value)
            else:
                return Response({'error': f'Permission field {perm} does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.save()
        
        return Response({'message': 'Permissions updated successfully.'}, status=status.HTTP_200_OK)
    
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def request_password_reset(request):
    """Handle password reset requests."""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        identifier = serializer.validated_data['identifier']
        
        try:
            user = User.objects.get(username=identifier)
        except User.DoesNotExist:
            return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Create a password reset token
        token = PasswordResetToken.objects.create(
            user=user,
            expires_at=timezone.now() + timezone.timedelta(hours=1)  # Token valid for 1 hour
        )

        # Send email with password reset link
        reset_link = f"http://127.0.0.1:3000/reset-password/{token.token}/"  # Assuming React app runs on port 3000
        send_mail(
            "Password Reset Request",
            f"Click the following link to reset your password: {reset_link}",
            'no-reply@yourdomain.com',
            [user.email],
            fail_silently=False,
        )

        return Response({"message": "Password reset link has been sent to the user's email."}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def reset_password(request):
    """Handle password reset confirmations."""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        token_value = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            token = PasswordResetToken.objects.get(token=token_value)
            if token.is_expired():
                return Response({"error": "Token has expired."}, status=status.HTTP_400_BAD_REQUEST)

            user = token.user
            user.set_password(new_password)
            user.save()

            # Delete the token after it is used
            token.delete()

            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    user = request.user
    user_profile = {
        'userId': user.id,
        'username': user.username,
        'email': user.email,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'can_manage_device': user.can_manage_device,
        'can_manage_access': user.can_manage_access,
        'can_manage_role': user.can_manage_role,
        'can_manage_timezone': user.can_manage_timezone,
        'can_manage_assignment': user.can_manage_assignment,
        'can_manage_bracelet': user.can_manage_bracelet,
        'can_manage_settings': user.can_manage_settings,
        'can_manage_door': user.can_manage_door,
    }
    return Response(user_profile)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsSuperUser])
def update_user_details(request, user_id):
    """Update a user's username, password, or email (only for superusers)."""
    try:
        # Fetch the user to be updated
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Extract the data from the request
    new_username = request.data.get('username')
    new_email = request.data.get('email')
    new_password = request.data.get('password')

    # Update username if provided and it's different
    if new_username and new_username != user.username:
        if User.objects.filter(username=new_username).exclude(id=user.id).exists():
            return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)
        user.username = new_username

    # Update email if provided and it's different
    if new_email and new_email != user.email:
        if User.objects.filter(email=new_email).exclude(id=user.id).exists():
            return Response({'error': 'Email already in use.'}, status=status.HTTP_400_BAD_REQUEST)
        user.email = new_email

    # Update password if provided
    if new_password:
        user.set_password(new_password)

    # Save the updated user details
    user.save()

    # Return the updated user profile
    user_serializer = UserSerializer(user)
    return Response({
        'message': 'User details updated successfully.',
        'user': user_serializer.data
    }, status=status.HTTP_200_OK)
