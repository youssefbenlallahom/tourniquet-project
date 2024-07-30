from rest_framework import serializers
from .models import Timezone

class TimezoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timezone
        fields = [
            'TimezoneId',
            'SunTime1', 'SunTime2', 'SunTime3',
            'MonTime1', 'MonTime2', 'MonTime3',
            'TueTime1', 'TueTime2', 'TueTime3',
            'WedTime1', 'WedTime2', 'WedTime3',
            'ThuTime1', 'ThuTime2', 'ThuTime3',
            'FriTime1', 'FriTime2', 'FriTime3',
            'SatTime1', 'SatTime2', 'SatTime3',
            'Hol1Time1', 'Hol1Time2', 'Hol1Time3',
            'Hol2Time1', 'Hol2Time2', 'Hol2Time3',
            'Hol3Time1', 'Hol3Time2', 'Hol3Time3'
        ]
