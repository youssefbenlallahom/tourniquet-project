from rest_framework import serializers
from .models import Timezone
from access.serializers import AccessSerializer
class TimezoneSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Timezone
        fields = '__all__'
