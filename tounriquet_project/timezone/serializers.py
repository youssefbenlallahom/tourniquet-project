from rest_framework import serializers
from .models import Timezone,Access
from access.serializers import AccessSerializer
from datetime import datetime
from dateutil import parser
class TimezoneSerializer(serializers.ModelSerializer):
    access = AccessSerializer(many=True)
    startTime = serializers.SerializerMethodField()
    endTime = serializers.SerializerMethodField()
    
    class Meta:
        model = Timezone
        fields = '__all__'
        
    def get_startTime(self, obj):
        # Convertir le champ startTime en format désiré
        return self.format_datetime(obj.startTime)
    
    def get_endTime(self, obj):
        # Convertir le champ endTime en format désiré
        return self.format_datetime(obj.endTime)

    def format_datetime(self, dt):
        if not dt:
            return ""
        
        # Assurez-vous que dt est un objet datetime
        if isinstance(dt, str):
            dt = parser.isoparse(dt)
        
        # Déterminez le jour de la semaine et la date
        day_of_week = dt.strftime('%a')+"Time1"  # 'Mon', 'Tue', etc.
        formatted_date = dt.strftime('%m/%d/%Y %H:%M')  # Format de date: 'xx/xx/xxxx xx:xx'
        
        # Retourner le format désiré
        return f"{day_of_week} {formatted_date}"
class UpdateTimezoneSerializer(serializers.ModelSerializer):
    access = serializers.PrimaryKeyRelatedField(many=True, queryset=Access.objects.all())
    class Meta:
        model = Timezone
        fields = '__all__'
