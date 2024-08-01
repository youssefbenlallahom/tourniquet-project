from rest_framework import serializers
from .models import Access
from door.serializers import DoorSerializer

class AccessSerializer(serializers.ModelSerializer):
    door_list = serializers.SerializerMethodField()  
    class Meta:
        model = Access
        fields = ['id','name', 'door_list']

    def get_door_list(self, obj):
        doors = obj.doors.all()  
        return DoorSerializer(doors, many=True).data
