from rest_framework import serializers
from door.models import Door
from device.models import Device

class DoorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Door
        fields = ['id', 'device', 'type', 'doorNumber']

    def create(self, validated_data):
        device = validated_data.pop('device')
        door = Door.objects.create(device=device, **validated_data)
        return door
    
class UpdateDoorSerializer(serializers.ModelSerializer):
    device = serializers.PrimaryKeyRelatedField(many=True, queryset=Device.objects.all())
    class Meta:
        model = Device
        fields = '__all__'
