from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Access,Door
from .serializers import AccessSerializer,UpdateAccessSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from access.serializers import AccessSerializer


def user_has_permission(user):
    return user.is_superuser or user.is_staff or user.can_manage_access

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_access(request):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    if request.query_params:
        items = Access.objects.filter(**request.query_params.dict())
    else:
        items = Access.objects.all()
 
    if items.exists():
        serializer = AccessSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_access(request):
    print(request.data)
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = AccessSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    access_id = request.data.get('id')
    door_ids = request.data.get('doors', [])
    GameName = request.data.get('GameName', '')

    if isinstance(door_ids, int):
        door_ids = [door_ids]  # Convert single integer to list
    elif not isinstance(door_ids, list):
        return Response({'error': 'doors must be a list or a single integer.'}, status=status.HTTP_400_BAD_REQUEST)

    if access_id:
        try:
            access = Access.objects.get(id=access_id)
        except Access.DoesNotExist:
            return Response({'error': 'Access object not found.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        access, created = Access.objects.get_or_create(GameName=GameName)

    doors = Door.objects.filter(id__in=door_ids)

    access.GameName = GameName
    access.save()

    # Set the many-to-many relationship with the filtered doors
    access.doors.set(doors)  
    created_access = AccessSerializer(access).data
    return Response({'access_list': [created_access]}, status=status.HTTP_201_CREATED)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_access(request, id):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        access = Access.objects.get(id=id)
    except Access.DoesNotExist:
        return Response({'error': 'Access not found.'}, status=status.HTTP_404_NOT_FOUND)

    access.delete()
    return Response({'message': 'Access deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_access(request, id):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        access_instance = Access.objects.get(id=id)
    except Access.DoesNotExist:
        return Response({'error': 'Access not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateAccessSerializer(access_instance, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

