from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import ClientAuth
from client.models import Client

from .serializers import ClientAuthSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated



@api_view(['GET'])
def view_clientAuth(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.query_params:
        items = ClientAuth.objects.filter(**request.query_params.dict())
    else:
        items = ClientAuth.objects.all()
    
    if items.exists():
        serializer = ClientAuthSerializer(items, many=True)
        response_data = {}
        for item in serializer.data:
            ip = item.get('ip')
            client_id = item.get('client_id')  
            
            if ip and client_id:
                try:
                    client = Client.objects.get(pk=client_id)
                    user_data = f"CardNo={client.cardNo}\tPin={client.pin}\tPassword=\tGroup=\tStartTime={client.startHour}000\tEndTime={(client.startHour + client.nbrH)}000\tSuperAuthorize={client.isSuper};"
                    user_authorize_data = f"Pin={client.pin}\tAuthorizeTimezoneId={item.get('AuthorizeTimezoneId')}\tAuthorizeDoorId={item.get('AuthorizeDoorId')};"
                    
                    response_data[ip] = {
                        "user": [user_data],
                        "userAuthorize": [user_authorize_data]
                    }
                except Client.DoesNotExist:
                    return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({'error': 'Client ID or IP not found in serialized data'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(response_data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_clientAuth(request):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = ClientAuthSerializer(data=request.data)
    if serializer.is_valid():
        if ClientAuth.objects.filter(**request.data).exists():
            raise serializers.ValidationError('This data already exists')

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_clientAuth(request, ClientId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        ClientAuth = ClientAuth.objects.get(ClientId=ClientId)
    except ClientAuth.DoesNotExist:
        return Response({'error': 'ClientAuth not found.'}, status=status.HTTP_404_NOT_FOUND)

    ClientAuth.delete()
    return Response({'message': 'ClientAuth deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_clientAuth(request, ClientId):
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        ClientAuth = ClientAuth.objects.get(ClientId=ClientId,user=request.user)
    except ClientAuth.DoesNotExist:
        return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ClientAuthSerializer(ClientAuth, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

