# door/serializers.py
from rest_framework import serializers
from .models import Role,Access,Timezone
from access.serializers import AccessSerializer
from timezone.serializers import TimezoneSerializer
class RoleSerializer(serializers.ModelSerializer):
    access = AccessSerializer(many=True)
    timezone = TimezoneSerializer(many=True)

    class Meta:
        model = Role
        fields = '__all__'

class UpdateRoleSerializer(serializers.ModelSerializer):
    access = serializers.PrimaryKeyRelatedField(many=True, queryset=Access.objects.all())
    timezone = serializers.PrimaryKeyRelatedField(many=True, queryset=Timezone.objects.all())

    class Meta:
        model = Role
        fields = '__all__'
