from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Timezone ,Access
from .serializers import TimezoneSerializer,UpdateTimezoneSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

def user_has_permission(user):
    return user.is_superuser or user.is_staff or user.can_manage_timezone


@api_view(['GET'])
def view_timezones(request):
    if not user_has_permission(request.user):
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
    print(request.data)
    
    # Check for permission
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    # Use the UpdateTimezoneSerializer to validate and save the data
    serializer = UpdateTimezoneSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()  # Save the Timezone instance along with associated Access objects
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_timezones(request, TimezoneId):
    if not user_has_permission(request.user):
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
    print(request.data)
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        timezone_instance = Timezone.objects.get(TimezoneId=TimezoneId)
    except Timezone.DoesNotExist:
        return Response({'error': 'Timezone not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateTimezoneSerializer(timezone_instance, data=request.data, partial=True)  # Partial update
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
