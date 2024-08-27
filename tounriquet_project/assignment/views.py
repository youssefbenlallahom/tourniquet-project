from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Assignment ,Assignment_Access,Access,Timezone
from .serializers import AssignmentSerializer ,Assignment_AccessSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_assignment(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    items = Assignment.objects.all()
    if items:
        serializer = AssignmentSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_assignment(request):
    # Log the incoming data for debugging purposes
    print(request.data)
    
    # Extract data from request
    role_id = request.data.get('role')
    bracelet_id = request.data.get('braceletId')
    color = request.data.get('color')
    name = request.data.get('name')
    access_ids = request.data.get('access_ids', [])
    timezone_ids = request.data.get('timezone_ids', [])

    # Ensure access_ids and timezone_ids are lists of integers
    if isinstance(access_ids, int):
        access_ids = [access_ids]  # Convert single integer to list
    elif not isinstance(access_ids, list) or not all(isinstance(i, int) for i in access_ids):
        return Response({'error': 'access_ids must be a list of integers.'}, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(timezone_ids, int):
        timezone_ids = [timezone_ids]  # Convert single integer to list
    elif not isinstance(timezone_ids, list) or not all(isinstance(i, int) for i in timezone_ids):
        return Response({'error': 'timezone_ids must be a list of integers.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check user permissions
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    # Create the assignment
    assignment_data = {
        'role': role_id,
        'braceletId': bracelet_id,
        'color': color,
        'name': name
    }

    serializer = AssignmentSerializer(data=assignment_data)
    if serializer.is_valid():
        assignment = serializer.save()

        # Fetch the Access and Timezone objects
        accesses = Access.objects.filter(id__in=access_ids)
        timezones = Timezone.objects.filter(id__in=timezone_ids)

        # Set the many-to-many relationships
        assignment.access_ids.set(accesses)  # Utiliser le nom correct du champ ManyToMany
        assignment.timezone_ids.set(timezones)  # Utiliser le nom correct du champ ManyToMany

        # Serialize the created Assignment object
        created_assignment = AssignmentSerializer(assignment).data
        return Response({'assignment': created_assignment}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_assignment(request, AssignmentId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        assignment = Assignment.objects.get(id=AssignmentId)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    assignment.delete()
    return Response({'message': 'Assignment deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_assignment(request, AssignmentId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        assignment = Assignment.objects.get(id=AssignmentId)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    serializer = AssignmentSerializer(assignment, data=data, partial=True)
    if serializer.is_valid():
        updated_assignment = serializer.save()
        # Update related access and timezones if provided
        access_ids = data.get('access_ids', [])
        timezone_ids = data.get('timezone_ids', [])
        if access_ids:
            updated_assignment.access_id.set(access_ids)
        if timezone_ids:
            updated_assignment.timezone_id.set(timezone_ids)
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


################### Assignment_access ###################

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_assignment_access(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    if request.query_params:
        items = Assignment_Access.objects.filter(**request.query_params.dict())
    else:
        items = Assignment_Access.objects.all()
 
    if items:
        serializer = Assignment_AccessSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_assignment_access(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = Assignment_AccessSerializer(data=request.data)
    if serializer.is_valid():
        assignment = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    elif not request.data:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_assignment_access(request, Assignment_accessId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        assignment = Assignment_Access.objects.get(id=Assignment_accessId)
    except Assignment_Access.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    assignment.delete()
    return Response({'message': 'Assignment deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_assignment_access(request, AssignmentId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        Assignment = Assignment.objects.get(AssignmentId=AssignmentId,user=request.user)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = Assignment_AccessSerializer(Assignment, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



