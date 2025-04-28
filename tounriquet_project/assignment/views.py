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
@permission_classes([IsAuthenticated])
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
        generate_detailed_assignments_json()
        serializer = AssignmentSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No assignments found.'}, status=status.HTTP_404_NOT_FOUND)

def generate_assignments_json():
    assignments = Assignment.objects.select_related('role').prefetch_related('access_ids__doors__device', 'timezone_ids')
    result = {}

    for assignment in assignments:
        bracelet_id = assignment.braceletId
        role = assignment.role
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

                    # Initialiser la structure si l'IP n'existe pas
                    if ip_address not in result:
                        result[ip_address] = {
                            "user": [],
                            "userAuthorize": []
                        }

                    # Éviter les doublons si nécessaire
                    if user_entry not in result[ip_address]["user"]:
                        result[ip_address]["user"].append(user_entry)

                    if user_authorize_entry not in result[ip_address]["userAuthorize"]:
                        result[ip_address]["userAuthorize"].append(user_authorize_entry)

    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'exported_assignment.json')

    with open(file_path, 'w') as file:
        json.dump(result, file, indent=4)

    return file_path

def generate_detailed_assignments_json():
    assignments = Assignment.objects.prefetch_related(
        'access_ids__doors__device', 'timezone_ids'
    )

    # Define the rooms/games we want to include
    rooms = {
        "chillRoom": "ChillRoom",
        "gameOn": "GameOn",
        "office": "Office",
        "escape1": "Escape1",
        "escape2": "Escape2",
        "escape3": "Escape3", 
        "axeThrowing": "AxeThrowing"
    }

    # Instead of a dictionary with bracelet IDs as keys,
    # we'll just use a single person_data object at the root level
    person_data = None

    # Process the first assignment only
    for assignment in assignments:
        timezone = assignment.timezone_ids.first()
        if not timezone:
            continue

        start = timezone.startTime
        end = timezone.endTime
        
        # Format startHour as integer (14:00 => 140)
        start_hour_str = start.strftime('%H:%M') if start else ""
        start_hour_int = 0
        if start_hour_str:
            # Convert to 1400 then divide by 10 to get 140
            start_hour_int = int(start_hour_str.replace(':', '')) // 10
        
        # Calculate hours
        nbrH = 0
        if start and end:
            nbrH = int((end - start).total_seconds() // 3600)

        # Get port from device
        port = ""
        for access in assignment.access_ids.all():
            for door in access.doors.all():
                if door.device and door.device.port:
                    port = door.device.port
                    break
            if port:
                break

        # Create access mapping
        access_map = {}
        for db_name in rooms.keys():
            access_map[db_name] = 0

        # Set access value for each room
        for access in assignment.access_ids.all():
            # Normalize game name
            game_raw = access.GameName
            game_normalized = access.GameName.lower().replace(" ", "")
            
            # Debug print to help troubleshoot
            print(f"Processing access: {game_raw} -> normalized: {game_normalized}")
            
            # Find matching room key
            for room_key in rooms:
                if room_key.lower() == game_normalized:
                    access_map[room_key] = 1
                    print(f"Match found! Setting access for {room_key} to 1")
                    break
            
        # Create person entry with basic info (directly, without bracelet ID as key)
        person_data = {
            "name": assignment.name,
            "cardNo": assignment.braceletId,
            "pin": port,
            "color": assignment.color,
            "startHour": start_hour_int,
            "numberOfHours": nbrH,
            "isSuper": False,
            "isAdmin": False
        }
        
        # Add room access objects
        for db_name, json_name in rooms.items():
            has_access = access_map.get(db_name, 0)
            person_data[json_name] = {
                "access": has_access,
                # If has_access is 1, use the main values, otherwise use 0
                "startHour": start_hour_int if has_access == 1 else 0,
                "numberOfHours": nbrH if has_access == 1 else 0
            }
        
        # We've processed one assignment, so break the loop
        break

    # If no valid assignments were found, create empty data
    if person_data is None:
        person_data = {}

    # Save to JSON file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'detailed_assignment.json')

    with open(file_path, 'w') as f:
        json.dump(person_data, f, indent=4)

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
        generate_detailed_assignments_json()
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
    generate_detailed_assignments_json()
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
    print(request.data)
    if serializer.is_valid():
        updated_assignment = serializer.save()
        generate_assignments_json()
        generate_detailed_assignments_json()
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



