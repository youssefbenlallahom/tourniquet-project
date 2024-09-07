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
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    # Fetch the assignments, including related data if needed
    items = Assignment.objects.all().select_related('role').prefetch_related('access_ids', 'timezone_ids')
    
    if items.exists():
        serializer = AssignmentSerializer(items, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No assignments found.'}, status=status.HTTP_404_NOT_FOUND)

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

    # Fonction pour extraire et formater l'heure
    def format_time(time_str):
        try:
            # Extraire la partie date-heure
            parts = time_str.split(' ', 1)
            if len(parts) == 2:
                date_str = parts[1]
                # Analyse de date_str
                dt = parser.parse(date_str)
                # Formatage en 'HHMM'
                return dt.strftime('%H%M')
        except (ValueError, TypeError) as e:
            print(f"Erreur de conversion pour {time_str} - {e}")
        return "0000"

    # Fonction pour obtenir le label de temps basé sur le jour
    def get_time_label(day_of_week, index):
        # Map des jours de la semaine aux labels
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
        day_of_week = timezone.startTime.strftime('%a')  # Par exemple, 'Sun', 'Mon'
        
        # Trouver le label de temps correspondant
        for index in range(1, 4):  # Pour Time1, Time2, Time3
            time_label = get_time_label(day_of_week, index)
            if time_label and time_label in time_data:
                time_data[time_label] = format_time(start_time_str)
                break  # On remplit seulement un label, on arrête ici

    return time_data

def save_assignment_data_to_json(assignment_id):
    # Générez les données d'assignement
    data = generate_assignment_data(assignment_id)
    
    # Sauvegardez les données dans un fichier JSON
    with open(f'assignment_{assignment_id}.json', 'w') as file:
        json.dump(data, file, indent=4)

    return f'Données sauvegardées dans assignment_{assignment_id}.json'

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_assignment(request):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = UpdateAssignmentSerializer(data=request.data)
    
    if serializer.is_valid():
        # Enregistre l'instance Assignment
        assignment = serializer.save()

        # Après l'ajout de l'assignment, génère et sauvegarde le fichier JSON avec l'ID de l'Assignment
        file_path = save_assignment_data_to_json(assignment.id)

        # Sérialiser l'objet Assignment créé
        created_assignment = UpdateAssignmentSerializer(assignment).data

        # Retourne à la fois les données de l'assignment et le chemin du fichier JSON
        return Response({
            'assignment': created_assignment,
            'json_file_path': file_path
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



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
    return Response({'message': 'Assignment deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

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



