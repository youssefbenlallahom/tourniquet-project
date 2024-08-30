from django.db import models
from door.models import Door
class Access(models.Model):
    GameName=models.CharField(max_length=50)
    doors = models.ManyToManyField(Door, related_name='accesses')
    def __str__(self):
        return f"Access {self.GameName}"
