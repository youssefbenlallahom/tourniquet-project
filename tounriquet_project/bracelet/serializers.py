from rest_framework import serializers
from .models import Bracelet

class BraceletSerializer(serializers.ModelSerializer):
    add_date = serializers.SerializerMethodField()

    class Meta:
        model = Bracelet
        fields = ['num', 'bracelet_id', 'active', 'color', 'add_date']

    def get_add_date(self, obj):
        # Format time as hour:minutes
        return obj.add_date.strftime('%d/%m/%Y %H:%M')
