from rest_framework import serializers
from .models import Timezone,Access
from access.serializers import AccessSerializer
from datetime import datetime
from dateutil import parser
class TimezoneSerializer(serializers.ModelSerializer):
    access = AccessSerializer(many=True, read_only=True)  # Sérialise les objets Access associés

    class Meta:
        model = Timezone
        fields = ['TimezoneId', 'access', 'startTime', 'endTime']  # Incluez uniquement les champs nécessaires
        
    
class UpdateTimezoneSerializer(serializers.ModelSerializer):
    access = serializers.PrimaryKeyRelatedField(many=True, queryset=Access.objects.all())

    class Meta:
        model = Timezone
        fields = ['TimezoneId', 'access', 'startTime', 'endTime']  # Incluez uniquement les champs nécessaires