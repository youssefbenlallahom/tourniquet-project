from rest_framework import serializers
from .models import Assignment
from role.serializers import RoleSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    role=RoleSerializer()
    class Meta:
        model = Assignment
        fields = '__all__'