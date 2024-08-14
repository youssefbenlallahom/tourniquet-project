# door/serializers.py
from rest_framework import serializers
from .models import Role
from access.serializers import AccessSerializer
class RoleSerializer(serializers.ModelSerializer):
    access=AccessSerializer()
    class Meta:
        model = Role
        fields = '__all__'