from django.db import models
from access.models import Access
class Role(models.Model):
    access = models.ForeignKey(Access, verbose_name=("AccessId"), on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    startTime=models.TimeField()
    endTime=models.TimeField()
    def __str__(self):
        return f"Role {self.name}"
