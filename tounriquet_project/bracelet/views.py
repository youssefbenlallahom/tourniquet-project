from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Bracelet
from .serializers import BraceletSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import datetime

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_bracelet(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    if request.query_params:
        items = Bracelet.objects.filter(**request.query_params.dict())
    else:
        items = Bracelet.objects.all()
 
    if items:
        serializer = BraceletSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_bracelet(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = BraceletSerializer(data=request.data)
    if serializer.is_valid():
        bracelet = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_bracelet(request, BraceletId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        bracelet = Bracelet.objects.get(id=BraceletId)
    except Bracelet.DoesNotExist:
        return Response({'error': 'Bracelet not found.'}, status=status.HTTP_404_NOT_FOUND)

    bracelet.delete()
    return Response({'message': 'Bracelet deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_bracelet(request, BraceletId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        Bracelet = Bracelet.objects.get(BraceletId=BraceletId,user=request.user)
    except Bracelet.DoesNotExist:
        return Response({'error': 'Bracelet not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = BraceletSerializer(Bracelet, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

