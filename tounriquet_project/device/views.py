from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Device
from .serializers import DeviceSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated



@api_view(['GET'])
def view_device(request):
    print(request)
    if not request.user.is_staff and not request.user.is_superuser and not request.user.can_manage_device:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    if request.query_params:
        items = Device.objects.filter(**request.query_params.dict())
    else:
        items = Device.objects.all()
 
    if items:
        serializer = DeviceSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_device(request):
    serializer = DeviceSerializer(data=request.data)
    if not request.user.is_staff and not request.user.is_superuser and not request.user.can_manage_device:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    if serializer.is_valid():
        if Device.objects.filter(**request.data).exists():
            raise serializers.ValidationError('This data already exists')
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_device(request, DeviceId):
    if not request.user.is_staff and not request.user.is_superuser and not request.user.can_manage_device:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        device = Device.objects.get(id=DeviceId)
    except Device.DoesNotExist:
        return Response({'error': 'Device not found.'}, status=status.HTTP_404_NOT_FOUND)

    device.delete()
    return Response({'message': 'Device deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_device(request, DeviceId):
    print(request.data)
    if not request.user.is_staff and not request.user.is_superuser and not request.user.can_manage_device:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        device_instance = Device.objects.get(DeviceId=DeviceId)
    except Device.DoesNotExist:
        return Response({'error': 'Device not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = DeviceSerializer(device_instance, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    print(serializer.errors)  # Add this line to see what went wrong
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
