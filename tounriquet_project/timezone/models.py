from django.db import models
from access.models import Access
class Timezone(models.Model):
    TimezoneId = models.AutoField(primary_key=True)
    access = models.ForeignKey(Access, related_name='access', on_delete=models.CASCADE)
    startTime=models.DateTimeField()
    endTime=models.DateTimeField()

    def __str__(self):
        return f"Timezone {self.TimezoneId}"
