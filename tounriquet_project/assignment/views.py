from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Assignment ,Assignment_Access,Access,Timezone,Role
from .serializers import AssignmentSerializer ,Assignment_AccessSerializer,UpdateAssignmentSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from collections import defaultdict
import os
import json
from datetime import datetime
from dateutil import parser
from django.core.exceptions import ObjectDoesNotExist
import subprocess
from functools import wraps
import logging
logger = logging.getLogger(__name__)

def user_has_permission(user):
    return user.is_superuser or user.is_staff or user.can_manage_assignment

def update_json_after_operation(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        try:
            # Exécuter la vue originale
            response = view_func(*args, **kwargs)
            
            # Si la réponse indique un succès (status code 2xx)
            if 200 <= response.status_code < 300:
                try:
                    generate_assignments_json()
                except Exception as e:
                    logger.error(f"Erreur lors de la mise à jour du fichier JSON: {str(e)}")
                    # On continue malgré l'erreur de mise à jour du fichier
            
            return response
            
        except Exception as e:
            logger.error(f"Erreur dans la vue {view_func.__name__}: {str(e)}")
            return Response(
                {'error': 'Une erreur est survenue lors du traitement de la requête.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return wrapper

@api_view(['POST'])
def execute_assignment_command(request):
    try:
        # Exécuter la commande sans capturer la sortie
        subprocess.run(["tourniquet-gateway", "records-user-json"], check=True)
        return Response({"message": "Commande exécutée avec succès"}, status=status.HTTP_200_OK)
    
    except subprocess.CalledProcessError as e:
        return Response(
            {"error": f"Commande échouée: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def view_assignment(request):
    
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    # Fetch the assignments, including related data if needed
    items = Assignment.objects.all().select_related('role').prefetch_related('access_ids', 'timezone_ids')
    
    if items.exists():
        
        generate_assignments_json()
        serializer = AssignmentSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No assignments found.'}, status=status.HTTP_404_NOT_FOUND)

def generate_assignments_json():
    assignments = Assignment.objects.select_related('role').prefetch_related('access_ids__doors__device', 'timezone_ids')
    result = defaultdict(list)

    for assignment in assignments:
        bracelet_id = assignment.braceletId
        role = assignment.role  # Récupérer le rôle
        
        super_authorize = "1" if role and role.roleName == "GM" else "0"
        
        for timezone in assignment.timezone_ids.all():
            start_time = timezone.startTime.strftime('%H%M') if timezone.startTime else ""
            end_time = timezone.endTime.strftime('%H%M') if timezone.endTime else ""
            user_entry = f"CardNo={bracelet_id}\tPin=\tPassword=\tGroup=\tStartTime={start_time}\tEndTime={end_time}\tSuperAuthorize={super_authorize};"
            for access in assignment.access_ids.all():
                for door in access.doors.all():
                    ip_address = door.device.device_ip
                    door_id = door.id
                    timezone_id = timezone.TimezoneId
                    user_authorize_entry = f"Pin=\tAuthorizeTimezoneId={timezone_id}\tAuthorizeDoorId={door_id};"
                    result[ip_address].append({"user_entry": user_entry, "user_authorize_entry": user_authorize_entry})
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'exported_assignment.json')
    
    with open(file_path, 'w') as file:
        json.dump(result, file, indent=4)
    
    return file_path


# Vue pour ajouter un assignment
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def add_assignment(request):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = UpdateAssignmentSerializer(data=request.data)
    
    if serializer.is_valid():
        assignment = serializer.save()
        created_assignment = UpdateAssignmentSerializer(assignment).data
        generate_assignments_json()
        return Response({
            'assignment': created_assignment,
            #'json_file_path': file_path
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vue pour supprimer un assignment
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def delete_assignment(request, AssignmentId):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        assignment = Assignment.objects.get(id=AssignmentId)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    assignment.delete()

    # Mettre à jour le fichier JSON après suppression
    #file_path = generate_all_assignments_json()
    generate_assignments_json()

    return Response({
        'message': 'Assignment deleted successfully.',
        #'json_file_path': file_path
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def update_assignment(request, id):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        assignment_instance = Assignment.objects.get(id=id)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    serializer = AssignmentSerializer(assignment_instance, data=data, partial=True)
    if serializer.is_valid():
        updated_assignment = serializer.save()
        generate_assignments_json()
        return Response({
            'assignment': serializer.data,
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



################### Assignment_access ###################

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_assignment_access(request):
    if not user_has_permission(request.user):
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
    if not user_has_permission(request.user):
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
    if not user_has_permission(request.user):
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
    if not user_has_permission(request.user):
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



