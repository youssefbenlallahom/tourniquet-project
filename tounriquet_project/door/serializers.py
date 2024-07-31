# door/serializers.py
from rest_framework import serializers
from door.models import Door
from access.serializers import AccessSerializer

class DoorSerializer(serializers.ModelSerializer):
    access_list = AccessSerializer(source='access_set', many=True, read_only=True)

    class Meta:
        model = Door
        fields = ['id', 'name', 'access_list']
