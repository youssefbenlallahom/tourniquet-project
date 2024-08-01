from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Access,Door
from .serializers import AccessSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from access.serializers import AccessSerializer



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_access(request):
    if not request.user.is_staff and not request.user.is_superuser:
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
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    door_ids = request.data.get('door_ids', [])
    name = request.data.get('name', '')

    if not isinstance(door_ids, list):
        return Response({'error': 'door_ids must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        doors = Door.objects.filter(id__in=door_ids)  # Fetch Door instances
        access = Access.objects.create(name=name)     # Create Access instance
        access.doors.set(doors)                       # Associate doors with Access instance
        created_access = AccessSerializer(access).data
        return Response({'access_list': [created_access]}, status=status.HTTP_201_CREATED)
    except Door.DoesNotExist:
        return Response({'error': 'One or more doors do not exist.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_access(request, id):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        access = Access.objects.get(id=id)
    except Access.DoesNotExist:
        return Response({'error': 'Access not found.'}, status=status.HTTP_404_NOT_FOUND)

    access.delete()
    return Response({'message': 'Access deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_access(request, AccessId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        Access = Access.objects.get(AccessId=AccessId,user=request.user)
    except Access.DoesNotExist:
        return Response({'error': 'Access not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AccessSerializer(Access, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

