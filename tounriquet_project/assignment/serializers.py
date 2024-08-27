from rest_framework import serializers
from .models import Assignment ,Access,Role,Timezone,Assignment_Access
from role.serializers import RoleSerializer
from access.serializers import AccessSerializer
from timezone.serializers import TimezoneSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    role = RoleSerializer()
    access_ids = AccessSerializer(many=True)  # Utilisez `many=True` pour `ManyToMany`
    timezone_ids = TimezoneSerializer(many=True)  # Utilisez `many=True` pour `ManyToMany`
    class Meta:
        model = Assignment
        fields = '__all__'
        
class UpdateAssignmentSerializer(serializers.ModelSerializer):
    access_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Access.objects.all())
    timezone_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Timezone.objects.all())

    class Meta:
        model = Access
        fields = '__all__'
class Assignment_AccessSerializer(serializers.ModelSerializer):
    assignment_id = serializers.PrimaryKeyRelatedField(queryset=Assignment.objects.all(), required=True, allow_null=False)
    access_id = serializers.PrimaryKeyRelatedField(queryset=Access.objects.all(), required=True, allow_null=False)
    timezone_id = serializers.PrimaryKeyRelatedField(queryset=Timezone.objects.all(), required=True, allow_null=False)

    class Meta:
        model = Assignment_Access
        fields = '__all__'