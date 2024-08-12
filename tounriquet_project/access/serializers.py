from rest_framework import serializers
from .models import Access
from door.serializers import DoorSerializer

class AccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Access
        fields = '__all__'

    def get_door_list(self, obj):
        doors = obj.doors.all() 
        return DoorSerializer(doors, many=True).data
