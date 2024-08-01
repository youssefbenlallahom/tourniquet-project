from rest_framework import serializers
from .models import Access
from door.serializers import DoorSerializer

class AccessSerializer(serializers.ModelSerializer):
    door_list = serializers.SerializerMethodField()  # Custom field for related doors

    class Meta:
        model = Access
        fields = ['id','name', 'door_list']

    def get_door_list(self, obj):
        # Serialize the related Door instances
        doors = obj.doors.all()  # Use the related_name to access the doors
        return DoorSerializer(doors, many=True).data
