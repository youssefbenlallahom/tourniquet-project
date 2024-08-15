# door/serializers.py
from rest_framework import serializers
from .models import Role,Access,Timezone
from access.serializers import AccessSerializer
class RoleSerializer(serializers.ModelSerializer):
    access = serializers.PrimaryKeyRelatedField(queryset=Access.objects.all(), many=True)
    timezone = serializers.PrimaryKeyRelatedField(queryset=Timezone.objects.all(), many=True)

    class Meta:
        model = Role
        fields = '__all__'