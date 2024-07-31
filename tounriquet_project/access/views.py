from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Access,Device
from .serializers import AccessSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_access(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    if 'DeviceId' in request.query_params:
        DeviceId = request.query_params.get('DeviceId')
        try:
            device = Device.objects.get(id=DeviceId)
        except Device.DoesNotExist:
            return Response({'error': 'Device not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        items = Access.objects.filter(device=device)
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
    serializer = AccessSerializer(data=request.data)
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    if serializer.is_valid():
        if Access.objects.filter(**request.data).exists():
            raise serializers.ValidationError('This data already exists')
        serializer.save()
        print(request.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_access(request, AccessId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        access = Access.objects.get(id=AccessId)
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

