from rest_framework import serializers
from .models import ClientAuth

class ClientAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientAuth
        fields = '__all__'
