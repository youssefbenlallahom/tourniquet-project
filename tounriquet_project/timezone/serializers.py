from rest_framework import serializers
from .models import Timezone,Access
from access.serializers import AccessSerializer
class TimezoneSerializer(serializers.ModelSerializer):
    access = serializers.PrimaryKeyRelatedField(queryset=Access.objects.all(), many=True)

    class Meta:
        model = Timezone
        fields = ['TimezoneId', 'access', 'startTime', 'endTime']