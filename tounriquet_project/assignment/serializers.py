from rest_framework import serializers
from .models import Assignment ,Assignment_Access
from role.serializers import RoleSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    role=RoleSerializer()
    class Meta:
        model = Assignment
        fields = '__all__'
        
class Assignment_AccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment_Access
        fields = '__all__'