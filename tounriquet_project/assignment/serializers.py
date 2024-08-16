from rest_framework import serializers
from .models import Assignment ,Access,Role,Timezone,Assignment_Access
from role.serializers import RoleSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())  # Ensure this handles Role IDs

    class Meta:
        model = Assignment
        fields = '__all__'
        
class Assignment_AccessSerializer(serializers.ModelSerializer):
    assignment_id = serializers.PrimaryKeyRelatedField(queryset=Assignment.objects.all(), required=True, allow_null=False)
    access_id = serializers.PrimaryKeyRelatedField(queryset=Access.objects.all(), required=True, allow_null=False)
    timezone_id = serializers.PrimaryKeyRelatedField(queryset=Timezone.objects.all(), required=True, allow_null=False)

    class Meta:
        model = Assignment_Access
        fields = '__all__'