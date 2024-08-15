from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Role ,Timezone ,Access
from .serializers import RoleSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_role(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    if request.query_params:
        items = Role.objects.filter(**request.query_params.dict())
    else:
        items = Role.objects.all()
 
    if items:
        serializer = RoleSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_role(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    # Extract fields from the request
    role_id = request.data.get('id')
    access_ids = request.data.get('access', [])
    timezone_ids = request.data.get('timezone', [])
    name = request.data.get('name', '')
    role_type = request.data.get('type', '')

    # Ensure access and timezone are lists
    if isinstance(access_ids, int):
        access_ids = [access_ids]  # Convert single ID to list
    elif not isinstance(access_ids, list):
        return Response({'error': 'access must be a list or a single integer.'}, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(timezone_ids, int):
        timezone_ids = [timezone_ids]  # Convert single ID to list
    elif not isinstance(timezone_ids, list):
        return Response({'error': 'timezone must be a list or a single integer.'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate access IDs
    if not Access.objects.filter(id__in=access_ids).exists():
        return Response({'error': 'One or more access IDs do not exist.'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate timezone IDs
    if not Timezone.objects.filter(TimezoneId__in=timezone_ids).exists():
        return Response({'error': 'One or more timezone IDs do not exist.'}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch or create the role object
    if role_id:
        try:
            role = Role.objects.get(id=role_id)
        except Role.DoesNotExist:
            return Response({'error': 'Role object not found.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        role, created = Role.objects.get_or_create(name=name, defaults={'type': role_type})

    # Set the many-to-many relationships
    access_objects = Access.objects.filter(id__in=access_ids)
    timezone_objects = Timezone.objects.filter(TimezoneId__in=timezone_ids)

    role.access.set(access_objects)
    role.timezone.set(timezone_objects)
    role.save()

    serializer = RoleSerializer(role)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_role(request, RoleId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        role = Role.objects.get(id=RoleId)
    except Role.DoesNotExist:
        return Response({'error': 'Role not found.'}, status=status.HTTP_404_NOT_FOUND)

    role.delete()
    return Response({'message': 'Role deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_role(request, RoleId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        Role = Role.objects.get(RoleId=RoleId,user=request.user)
    except Role.DoesNotExist:
        return Response({'error': 'Role not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = RoleSerializer(Role, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

