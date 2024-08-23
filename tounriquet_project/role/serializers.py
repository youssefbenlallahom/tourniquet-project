# door/serializers.py
from rest_framework import serializers
from .models import Role,Access,Timezone
from access.serializers import AccessSerializer
from timezone.serializers import TimezoneSerializer
class RoleSerializer(serializers.ModelSerializer):
    access = AccessSerializer(many=True)  # Serializer imbriqué pour `Access`
    timezone = TimezoneSerializer(many=True)  # Serializer imbriqué pour `Timezone`

    class Meta:
        model = Role
        fields = '__all__'