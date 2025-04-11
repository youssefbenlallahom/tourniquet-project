import json
from django.http import JsonResponse, HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Device
from .serializers import DeviceSerializer
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
import json
import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Device
from .serializers import DeviceSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

def export_devices_to_json_file():
    devices = Device.objects.all()
    if devices.exists():
        serializer = DeviceSerializer(devices, many=True)
        data = serializer.data
        
        # Définir le chemin où enregistrer le fichier JSON
        export_directory = r'C:\Users\youssef\Desktop\tourniquet-project\tounriquet_project\device'
        export_file_path = os.path.join(export_directory, 'exported_devices.json')
        
        # Vérifier si le répertoire existe, sinon le créer
        if not os.path.exists(export_directory):
            os.makedirs(export_directory)
        
        # Écrire les données dans un fichier JSON
        with open(export_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, ensure_ascii=False, indent=4)

# Vue pour l'exportation manuelle
@api_view(['GET'])
def export_devices_to_json(request):
    if not request.user.is_staff and not request.user.is_superuser and not request.user.can_manage_device:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        export_devices_to_json_file()
        return Response({'message': 'Devices exported successfully.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def view_device(request):
    if not request.user.is_staff and not request.user.is_superuser and not request.user.can_manage_device:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.query_params:
        items = Device.objects.filter(**request.query_params.dict())
    else:
        items = Device.objects.all()

    if items:
        serializer = DeviceSerializer(items, many=True)
        
        # Extraire les données en tant que JSON
        data = serializer.data
        
        # Convertir les données en chaîne JSON
        json_data = json.dumps(data, indent=4)
        
        # Créer une réponse HTTP avec le fichier JSON
        response = HttpResponse(json_data, content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="devices.json"'
        return response
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_device(request):
    serializer = DeviceSerializer(data=request.data)
    if not request.user.is_staff and not request.user.is_superuser and not request.user.can_manage_device:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    if serializer.is_valid():
        if Device.objects.filter(**request.data).exists():
            raise serializers.ValidationError('This data already exists')
        serializer.save()
        
        # Mettre à jour le fichier JSON
        export_devices_to_json_file()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# CRUD - Supprimer un appareil
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_device(request, DeviceId):
    if not request.user.is_staff and not request.user.is_superuser and not request.user.can_manage_device:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        device = Device.objects.get(DeviceId=DeviceId)
    except Device.DoesNotExist:
        return Response({'error': 'Device not found.'}, status=status.HTTP_404_NOT_FOUND)

    device.delete()
    
    # Mettre à jour le fichier JSON
    export_devices_to_json_file()
    
    return Response({'message': 'Device deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

# CRUD - Mettre à jour un appareil
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_device(request, DeviceId):
    if not request.user.is_staff and not request.user.is_superuser and not request.user.can_manage_device:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        device_instance = Device.objects.get(DeviceId=DeviceId)
    except Device.DoesNotExist:
        return Response({'error': 'Device not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = DeviceSerializer(device_instance, data=request.data)
    if serializer.is_valid():
        serializer.save()
        
        # Mettre à jour le fichier JSON
        export_devices_to_json_file()
        
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)