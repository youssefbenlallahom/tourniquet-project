# access/serializers.py
from rest_framework import serializers
from access.models import Access
from device.models import Device
from door.models import Door

class AccessSerializer(serializers.ModelSerializer):
    device = serializers.PrimaryKeyRelatedField(queryset=Device.objects.all())
    door = serializers.PrimaryKeyRelatedField(queryset=Door.objects.all())

    class Meta:
        model = Access
        fields = ['id', 'device', 'door', 'type', 'port']
