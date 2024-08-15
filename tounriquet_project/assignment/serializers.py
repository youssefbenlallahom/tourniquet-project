from rest_framework import serializers
from .models import Assignment ,Assignment_Access,Role
from role.serializers import RoleSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())  # Ensure this handles Role IDs

    class Meta:
        model = Assignment
        fields = '__all__'
        
class Assignment_AccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment_Access
        fields = '__all__'