from django.db import models
from access.models import Access
class Timezone(models.Model):
    TimezoneId = models.CharField(max_length=20, primary_key=True)
    access = models.ManyToManyField(Access, related_name='access')
    startTime=models.DateTimeField()
    endTime=models.DateTimeField()

    def __str__(self):
        return f"Timezone {self.TimezoneId}"
