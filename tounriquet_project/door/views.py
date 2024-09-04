from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Door
from .serializers import DoorSerializer, UpdateDoorSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

def user_has_permission(user):
    return user.is_superuser or user.is_staff or user.can_manage_door

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_door(request):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    if request.query_params:
        items = Door.objects.filter(**request.query_params.dict())
    else:
        items = Door.objects.all()

    if items:
        serializer = DoorSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_door(request):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = DoorSerializer(data=request.data)
    if serializer.is_valid():
        door = serializer.save()
        response_data = {
            'id': door.id,
            'device': door.device.DeviceId,
            'type': door.type,
            'doorNumber': door.doorNumber
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_door(request, DoorId):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        door = Door.objects.get(id=DoorId)
    except Door.DoesNotExist:
        return Response({'error': 'Door not found.'}, status=status.HTTP_404_NOT_FOUND)

    door.delete()
    return Response({'message': 'Door deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_door(request, DoorId):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        door_instance = Door.objects.get(id=DoorId)
    except Door.DoesNotExist:
        return Response({'error': 'Door not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateDoorSerializer(door_instance, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
