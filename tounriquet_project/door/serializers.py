from rest_framework import serializers
from door.models import Door
from device.models import Device

class DoorSerializer(serializers.ModelSerializer):
    device_ip = serializers.CharField(source='device.device_ip', read_only=True)
    device_name = serializers.CharField(source='device.device_name', read_only=True)
   
    class Meta:
        model = Door
        fields = '__all__'

    def create(self, validated_data):
        device = validated_data.pop('device')
        door = Door.objects.create(device=device, **validated_data)
        return door