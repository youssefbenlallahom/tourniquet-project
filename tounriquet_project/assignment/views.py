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

def user_has_permission(user):
    return user.is_superuser or user.is_staff or user.can_manage_assignment
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_assignment(request):
    export_data_as_json()
    transform_data()
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    # Fetch the assignments, including related data if needed
    items = Assignment.objects.all().select_related('role').prefetch_related('access_ids', 'timezone_ids')
    
    if items.exists():
        serializer = AssignmentSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No assignments found.'}, status=status.HTTP_404_NOT_FOUND)
def generate_all_assignments_json():
    assignments = Assignment.objects.all().select_related('role').prefetch_related('access_ids__doors__device', 'timezone_ids')
    
    result = defaultdict(list)

    for assignment in assignments:
        assignment_data = generate_assignment_data(assignment.id)
        
        # Fusionner les données de chaque assignment dans le résultat final basé sur l'IP, pas l'ID de l'assignment
        for ip, timezones in assignment_data.items():
            result[ip].extend(timezones)
    
    # Nommer le fichier 'exported_assignment.json'
    file_path = 'C:\\Users\\youssef\\Desktop\\tourniquet-project\\tounriquet_project\\assignment\\exported_assignment.json'
    
    # Sauvegarder toutes les données d'assignments dans un fichier JSON
    with open(file_path, 'w') as file:
        json.dump(result, file, indent=4)

    return file_path


# Générez les données d'un assignment spécifique
def generate_assignment_data(assignment_id):
    try:
        # Récupérer l'Assignment avec les relations nécessaires
        assignment = Assignment.objects.select_related('role') \
                                        .prefetch_related('access_ids__doors__device', 'timezone_ids') \
                                        .get(pk=assignment_id)

        # Dictionnaire pour stocker les adresses IP et leurs timezones
        result = defaultdict(list)

        # Dictionnaire pour éviter d'associer plusieurs fois le même timezone à la même adresse IP
        timezone_per_device = defaultdict(set)

        # Pour chaque timezone, on va chercher les adresses IP associées à l'access
        for timezone in assignment.timezone_ids.all():
            timezone_id = timezone.TimezoneId
            # On va chercher les access associés à ce timezone
            for access in assignment.access_ids.all():
                for door in access.doors.all():
                    ip_address = door.device.device_ip
                    
                    # Si ce timezone n'a pas encore été ajouté à cette IP, on l'ajoute
                    if timezone_id not in timezone_per_device[ip_address]:
                        # Générer le dictionnaire de temps pour ce timezone
                        time_dict = generate_time_dict(timezone)
                        result[ip_address].append(time_dict)
                        # Marquer ce timezone comme déjà associé à cette IP
                        timezone_per_device[ip_address].add(timezone_id)

        return result

    except Assignment.DoesNotExist:
        return {'error': 'Assignment not found'}
    
    
def format_time(time_str):
        try:
            parts = time_str.split(' ', 1)
            if len(parts) == 2:
                date_str = parts[1]
                dt = parser.parse(date_str)
                return dt.strftime('%H%M')
        except (ValueError, TypeError) as e:
            print(f"Erreur de conversion pour {time_str} - {e}")
        return "0000"
# Génère un dictionnaire des heures pour chaque timezone
def generate_time_dict(timezone):
    # Initialisation de tous les champs à "0000"
    time_data = {
        "TimezoneId": timezone.TimezoneId,
        "SunTime1": "0000",
        "SunTime2": "0000",
        "SunTime3": "0000",
        "MonTime1": "0000",
        "MonTime2": "0000",
        "MonTime3": "0000",
        "TueTime1": "0000",
        "TueTime2": "0000",
        "TueTime3": "0000",
        "WedTime1": "0000",
        "WedTime2": "0000",
        "WedTime3": "0000",
        "ThuTime1": "0000",
        "ThuTime2": "0000",
        "ThuTime3": "0000",
        "FriTime1": "0000",
        "FriTime2": "0000",
        "FriTime3": "0000",
        "SatTime1": "0000",
        "SatTime2": "0000",
        "SatTime3": "0000"
    }

    # Fonction pour formater les heures


    # Fonction pour obtenir le label de temps en fonction du jour de la semaine
    def get_time_label(day_of_week, index):
        labels = {
            'Sun': 'SunTime',
            'Mon': 'MonTime',
            'Tue': 'TueTime',
            'Wed': 'WedTime',
            'Thu': 'ThuTime',
            'Fri': 'FriTime',
            'Sat': 'SatTime'
        }
        label_prefix = labels.get(day_of_week, '')
        if label_prefix:
            return f"{label_prefix}{index}"
        return None

    # Remplir les champs en fonction de startTime
    if timezone.startTime:
        start_time_str = timezone.startTime.strftime('%a %m/%d/%Y %H:%M')
        day_of_week = timezone.startTime.strftime('%a')
        
        for index in range(1, 3):
            time_label = get_time_label(day_of_week, index)
            if time_label and time_label in time_data:
                time_data[time_label] = format_time(start_time_str)
                break

    return time_data

# Sauvegarde les données d'un assignment spécifique dans un fichier JSON
def save_assignment_data_to_json(assignment_id):
    data = generate_assignment_data(assignment_id)
    with open(f'assignment_{assignment_id}.json', 'w') as file:
        json.dump(data, file, indent=4)
    return f'Données sauvegardées dans assignment_{assignment_id}.json'

def export_data_as_json():
    # Récupérer tous les assignments avec les relations nécessaires
    assignments = Assignment.objects.select_related('role').prefetch_related('access_ids__doors', 'timezone_ids')
    
    # Préparer les données pour l'export
    data = []

    for assignment in assignments:
        # Récupérer les détails du role
        role = assignment.role.name if assignment.role else "No Role"

        for timezone in assignment.timezone_ids.all():
            start_time = timezone.startTime.strftime('%Y-%m-%dT%H:%M:%SZ') if timezone.startTime else ""
            end_time = timezone.endTime.strftime('%Y-%m-%dT%H:%M:%SZ') if timezone.endTime else ""
            
            for access in assignment.access_ids.all():
                for door in access.doors.all():
                    data.append({
                        "device":door.device.device_ip,
                        "braceletId": assignment.braceletId,
                        "startTime": start_time,
                        "endTime": end_time,
                        "role": role,
                        "timezoneId": timezone.TimezoneId,
                        "doorId": door.id
                    })

    # Nommer le fichier 'exported_data.json'
    file_path = 'C:\\Users\\youssef\\Desktop\\tourniquet-project\\tounriquet_project\\assignment\\exported_data.json'
    
    # Sauvegarder les données dans un fichier JSON
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

    return file_path

def transform_data():
    input_file_path = 'C:\\Users\\youssef\\Desktop\\tourniquet-project\\tounriquet_project\\assignment\\exported_data.json'
    output_file_path = 'C:\\Users\\youssef\\Desktop\\tourniquet-project\\tounriquet_project\\assignment\\controller_data.json'
    with open(input_file_path, 'r') as file:
        data = json.load(file)
    
    # Préparer un dictionnaire pour stocker les résultats
    result = {}
    def format_time(time_str):
        """
        Formate le temps en format HHMM à partir d'une chaîne de caractères ISO 8601.
        """
        try:
            # Convertir la chaîne ISO 8601 en objet datetime
            dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
            # Retourner l'heure au format HHMM
            return dt.strftime('%H%M')
        except ValueError as e:
            print(f"Erreur de conversion pour {time_str} - {e}")
        return "0000"
    for entry in data:
        # Extraire les informations nécessaires
        bracelet_id = entry['braceletId']
        start_time = format_time(entry['startTime'])
        end_time = format_time(entry['endTime'])
        role = entry.get('role', 'user')  # Définir un rôle par défaut si manquant
        timezone_id = entry['timezoneId']
        door_id = entry['doorId']
        ip_address = entry.get('device')  # Remplacer 'unknown_ip' si ip est absent

        # Déterminer si l'utilisateur est un GM
        super_authorize = 1 if role == 'GM' else 0

        # Formater les champs nécessaires
        user_entry = f"CardNo={bracelet_id}\tPin=\tPassword=\tGroup=\tStartTime={start_time}\tEndTime={end_time}\tSuperAuthorize={super_authorize};"
        user_authorize_entry = f"Pin=\tAuthorizeTimezoneId={timezone_id}\tAuthorizeDoorId={door_id};"

        # Ajouter les entrées au dictionnaire de résultats
        if ip_address not in result:
            result[ip_address] = {
                "user": [],
                "userAuthorize": []
            }

        result[ip_address]["user"].append(user_entry)
        result[ip_address]["userAuthorize"].append(user_authorize_entry)
    
    # Sauvegarder les résultats dans un fichier JSON
    with open(output_file_path, 'w') as file:
        json.dump(result, file, indent=4)

    return output_file_path



# Vue pour ajouter un assignment
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_assignment(request):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = UpdateAssignmentSerializer(data=request.data)
    
    if serializer.is_valid():
        assignment = serializer.save()

        # Génère et sauvegarde le fichier JSON nommé 'exported_assignment.json'
        file_path = generate_all_assignments_json()
        export_data_as_json()
        created_assignment = UpdateAssignmentSerializer(assignment).data

        return Response({
            'assignment': created_assignment,
            'json_file_path': file_path
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vue pour supprimer un assignment
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_assignment(request, AssignmentId):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        assignment = Assignment.objects.get(id=AssignmentId)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    assignment.delete()

    # Mettre à jour le fichier JSON après suppression
    file_path = generate_all_assignments_json()
    export_data_as_json()

    return Response({
        'message': 'Assignment deleted successfully.',
        'json_file_path': file_path
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_assignment(request, id):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        assignment_instance = Assignment.objects.get(id=id)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    serializer = UpdateAssignmentSerializer(assignment_instance, data=data, partial=True)
    if serializer.is_valid():
        updated_assignment = serializer.save()

        # Mettre à jour le fichier JSON après la modification de l'Assignment
        file_path = generate_all_assignments_json()
        export_data_as_json()

        return Response({
            'assignment': serializer.data,
            'json_file_path': file_path
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



