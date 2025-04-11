from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import UserRole
from .serializers import UserRoleSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_userRole(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    if request.query_params:
        items = UserRole.objects.filter(**request.query_params.dict())
    else:
        items = UserRole.objects.all()
 
    if items:
        serializer = UserRoleSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_userRole(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = UserRoleSerializer(data=request.data)
    if serializer.is_valid():
        userRole = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_userRole(request, UserRoleId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        userRole = UserRole.objects.get(id=UserRoleId)
    except UserRole.DoesNotExist:
        return Response({'error': 'UserRole not found.'}, status=status.HTTP_404_NOT_FOUND)

    userRole.delete()
    return Response({'message': 'UserRole deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_userRole(request, UserRoleId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        UserRole = UserRole.objects.get(UserRoleId=UserRoleId,user=request.user)
    except UserRole.DoesNotExist:
        return Response({'error': 'UserRole not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserRoleSerializer(UserRole, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

