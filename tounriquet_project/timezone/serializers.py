from rest_framework import serializers
from .models import Timezone,Access
from access.serializers import AccessSerializer
class TimezoneSerializer(serializers.ModelSerializer):
    access = AccessSerializer(many=True)

    class Meta:
        model = Timezone
        fields = '__all__'
        
class UpdateTimezoneSerializer(serializers.ModelSerializer):
    access = serializers.PrimaryKeyRelatedField(many=True, queryset=Access.objects.all())

    class Meta:
        model = Timezone
        fields = '__all__'
