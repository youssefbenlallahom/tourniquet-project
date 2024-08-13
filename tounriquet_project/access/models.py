from django.db import models
from door.models import Door
class Access(models.Model):
    name=models.CharField(max_length=50)
    doors = models.ForeignKey(Door, related_name='accesses',on_delete=models.CASCADE)
    def __str__(self):
        return f"Access {self.name}"
