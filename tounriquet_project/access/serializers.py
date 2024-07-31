from rest_framework import serializers
from .models import Access
from device.serializers import DeviceSerializer

class AccessSerializer(serializers.ModelSerializer):
    device=DeviceSerializer()
    class Meta:
        model = Access
        fields = ['id','name','status','num_port','device']
