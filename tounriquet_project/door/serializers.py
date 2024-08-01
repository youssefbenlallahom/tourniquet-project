# door/serializers.py
from rest_framework import serializers
from door.models import Door
from device.serializers import DeviceSerializer
from device.models import Device

class DoorSerializer(serializers.ModelSerializer):
    device = serializers.PrimaryKeyRelatedField(queryset=Device.objects.all())
    
    class Meta:
        model = Door
        fields = '__all__'

    def create(self, validated_data):
        device = validated_data.pop('device')
        door = Door.objects.create(device=device, **validated_data)
        return door