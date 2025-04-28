from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Timezone, Access
from .serializers import TimezoneSerializer, UpdateTimezoneSerializer
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
import os
from django.conf import settings
import json
from django.utils import timezone
from functools import wraps
import logging
import pytz
import subprocess

TUNISIA_TZ = pytz.timezone('Africa/Tunis')
logger = logging.getLogger(__name__)

def user_has_permission(user):
    return user.is_superuser or user.is_staff or user.can_manage_timezone

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def execute_tourniquet_command(request):
    try:
        # Exécuter la commande sans capturer la sortie
        subprocess.run(["tourniquet-gateway", "records-time-json"], check=True)
        return Response({"message": "Commande exécutée avec succès"}, status=status.HTTP_200_OK)
    
    except subprocess.CalledProcessError as e:
        return Response(
            {"error": f"Commande échouée: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
def update_json_after_operation(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        try:
            # Exécuter la vue originale
            response = view_func(*args, **kwargs)
            
            # Si la réponse indique un succès (status code 2xx)
            if 200 <= response.status_code < 300:
                try:
                    update_exported_timezones()
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

def process_timezone_info(timezone_obj):
    """Traiter les informations d'une timezone individuelle avec la nouvelle formule incluant les minutes."""
    start_time = timezone_obj.startTime
    end_time = timezone_obj.endTime
    
    # Traitement de l'heure de début (start_time)
    if start_time:
        if timezone.is_naive(start_time):
            start_time = timezone.make_aware(start_time, TUNISIA_TZ)
        local_start_time = start_time.astimezone(TUNISIA_TZ)
        x = local_start_time.hour  # Extraire l'heure
        start_minutes = local_start_time.minute  # Extraire les minutes
    else:
        x = 0
        start_minutes = 0
    
    # Traitement de l'heure de fin (end_time)
    if end_time:
        if timezone.is_naive(end_time):
            end_time = timezone.make_aware(end_time, TUNISIA_TZ)
        local_end_time = end_time.astimezone(TUNISIA_TZ)
        y = local_end_time.hour  # Extraire l'heure
        end_minutes = local_end_time.minute  # Extraire les minutes
    else:
        y = 0
        end_minutes = 0
    
    # Encodage selon la formule donnée, incluant les minutes
    encoded_time = (((x * 100 + start_minutes) << 16) + (y * 100 + end_minutes))
    
    timezone_info = {
        'TimezoneId': timezone_obj.TimezoneId,
        'SunTime1': '00000000', 'SunTime2': '00000000', 'SunTime3': '00000000',
        'MonTime1': '00000000', 'MonTime2': '00000000', 'MonTime3': '00000000',
        'TueTime1': '00000000', 'TueTime2': '00000000', 'TueTime3': '00000000',
        'WedTime1': '00000000', 'WedTime2': '00000000', 'WedTime3': '00000000',
        'ThuTime1': '00000000', 'ThuTime2': '00000000', 'ThuTime3': '00000000',
        'FriTime1': '00000000', 'FriTime2': '00000000', 'FriTime3': '00000000',
        'SatTime1': '00000000', 'SatTime2': '00000000', 'SatTime3': '00000000'
    }
    
    # Mapping des jours de la semaine
    day_mapping = {
        0: 'MonTime1', 1: 'TueTime1', 2: 'WedTime1',
        3: 'ThuTime1', 4: 'FriTime1', 5: 'SatTime1', 6: 'SunTime1'
    }
    
    # Calcul du jour de la semaine et mise à jour de l'information
    day_of_week = local_start_time.weekday()
    timezone_info[day_mapping[day_of_week]] = str(encoded_time).zfill(8)
    
    return timezone_info

def update_exported_timezones():
    """Mettre à jour le fichier JSON des timezones avec gestion d'erreurs."""
    file_path = settings.BASE_DIR / 'timezone' / 'exported_timezones.json'
    
    # Créer le répertoire s'il n'existe pas
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    try:
        # Lire le fichier JSON existant
        try:
            with open(file_path, 'r') as file:
                timezone_data = json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            timezone_data = {}

        # Récupérer et traiter toutes les timezones
        timezones = Timezone.objects.all()
        new_timezone_data = {}

        for timezone_obj in timezones:
            for access in timezone_obj.access.all():
                for door in access.doors.all():
                    device_ip = door.device.device_ip
                    
                    # Initialiser la liste pour ce device_ip si elle n'existe pas
                    if device_ip not in new_timezone_data:
                        new_timezone_data[device_ip] = []
                    
                    # Utiliser process_timezone_info pour obtenir les informations formatées
                    timezone_info = process_timezone_info(timezone_obj)
                    
                    # Vérifier si une timezone avec le même TimezoneId existe déjà
                    existing_timezone = next(
                        (item for item in new_timezone_data[device_ip] 
                         if item['TimezoneId'] == timezone_info['TimezoneId']),
                        None
                    )
                    
                    # Si elle n'existe pas, l'ajouter
                    if not existing_timezone:
                        new_timezone_data[device_ip].append(timezone_info)

        # Écrire dans un fichier temporaire d'abord
        temp_file_path = str(file_path) + '.tmp'
        with open(temp_file_path, 'w') as file:
            json.dump(new_timezone_data, file, indent=4)
        
        # Remplacer le fichier original
        os.replace(temp_file_path, file_path)
        
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du fichier JSON: {str(e)}")
        raise

@api_view(['GET'])
@update_json_after_operation
def view_timezones(request):
    if not user_has_permission(request.user):
        return Response(
            {'error': 'You do not have permission to perform this action.'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        if request.query_params:
            items = Timezone.objects.filter(**request.query_params.dict())
        else:
            items = Timezone.objects.all()

        if items:
            serializer = TimezoneSerializer(items, many=True)
            return Response(serializer.data)
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des timezones: {str(e)}")
        return Response(
            {'error': 'Une erreur est survenue lors de la récupération des timezones.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def add_timezones(request):
    if not user_has_permission(request.user):
        return Response(
            {'error': 'You do not have permission to perform this action.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = UpdateTimezoneSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def delete_timezones(request, TimezoneId):
    if not user_has_permission(request.user):
        return Response(
            {'error': 'You do not have permission to perform this action.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        timezone = Timezone.objects.get(TimezoneId=TimezoneId)
        timezone.delete()
        return Response(
            {'message': 'Timezone deleted successfully.'}, 
            status=status.HTTP_204_NO_CONTENT
        )
    except Timezone.DoesNotExist:
        return Response(
            {'error': 'Timezone not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def update_timezones(request, TimezoneId):
    if not user_has_permission(request.user):
        return Response(
            {'error': 'You do not have permission to perform this action.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        timezone_instance = Timezone.objects.get(TimezoneId=TimezoneId)
    except Timezone.DoesNotExist:
        return Response(
            {'error': 'Timezone not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = UpdateTimezoneSerializer(
        timezone_instance, 
        data=request.data, 
        partial=True
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)