from rest_framework import serializers
from .models import Assignment, AccessPeriod

class AccessPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessPeriod
        fields = ['id', 'access_type', 'startTime', 'endTime']

class AssignmentSerializer(serializers.ModelSerializer):
    access_periods = AccessPeriodSerializer(many=True, read_only=True)
    
    class Meta:
        model = Assignment
        fields = ['id', 'braceletId', 'color', 'name', 'role', 'access_periods']
        
    def create(self, validated_data):
        access_periods_data = self.context.get('access_periods', [])
        assignment = Assignment.objects.create(**validated_data)
        
        for period_data in access_periods_data:
            AccessPeriod.objects.create(assignment=assignment, **period_data)
            
        return assignment
    
    def update(self, instance, validated_data):
        access_periods_data = self.context.get('access_periods', [])
        
        # Update assignment fields
        instance.braceletId = validated_data.get('braceletId', instance.braceletId)
        instance.color = validated_data.get('color', instance.color)
        instance.name = validated_data.get('name', instance.name)
        instance.role = validated_data.get('role', instance.role)
        instance.save()
        
        # Handle existing access periods
        if 'access_periods_action' in self.context and self.context['access_periods_action'] == 'replace':
            # Delete existing access periods and replace with new ones
            instance.access_periods.all().delete()
            for period_data in access_periods_data:
                AccessPeriod.objects.create(assignment=instance, **period_data)
        else:
            # Update or create access periods based on ID
            existing_periods = {period.id: period for period in instance.access_periods.all()}
            
            for period_data in access_periods_data:
                period_id = period_data.get('id', None)
                
                if period_id and period_id in existing_periods:
                    # Update existing period
                    period = existing_periods[period_id]
                    period.access_type = period_data.get('access_type', period.access_type)
                    period.startTime = period_data.get('startTime', period.startTime)
                    period.endTime = period_data.get('endTime', period.endTime)
                    period.save()
                else:
                    # Create new period
                    AccessPeriod.objects.create(assignment=instance, **{k: v for k, v in period_data.items() if k != 'id'})
        
        return instance
