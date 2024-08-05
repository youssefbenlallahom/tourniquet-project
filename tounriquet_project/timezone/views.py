from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Timezone
from .serializers import TimezoneSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated



@api_view(['GET'])
def view_timezones(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    if request.query_params:
        items = Timezone.objects.filter(**request.query_params.dict())
    else:
        items = Timezone.objects.all()
 
    if items:
        serializer = TimezoneSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_timezones(request):
    serializer = TimezoneSerializer(data=request.data)
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    if serializer.is_valid():
        if Timezone.objects.filter(**request.data).exists():
            raise serializers.ValidationError('This data already exists')
        print(request.data)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_timezones(request, TimezoneId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        timezone = Timezone.objects.get(TimezoneId=TimezoneId)
    except Timezone.DoesNotExist:
        return Response({'error': 'Timezone not found.'}, status=status.HTTP_404_NOT_FOUND)

    timezone.delete()
    return Response({'message': 'Timezone deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_timezones(request, TimezoneId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        Timezone = Timezone.objects.get(TimezoneId=TimezoneId,user=request.user)
    except Timezone.DoesNotExist:
        return Response({'error': 'Timezone not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TimezoneSerializer(Timezone, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

