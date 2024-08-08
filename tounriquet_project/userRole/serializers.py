from rest_framework import serializers
from userRole.models import UserRole
from role.serializers import RoleSerializer

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'
