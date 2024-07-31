from rest_framework import serializers
from .models import Access ,Device
from device.serializers import DeviceSerializer

class AccessSerializer(serializers.ModelSerializer):
    device = serializers.PrimaryKeyRelatedField(queryset=Device.objects.all())
    class Meta:
        model = Access
        fields = '__all__'
