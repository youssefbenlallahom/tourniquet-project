from django.db import models
from access.models import Access
from timezone.models import Timezone
class Role(models.Model):
    access = models.ManyToManyField(Access, verbose_name=("AccessId"))
    timezone=models.ManyToManyField(Timezone, verbose_name=("TimezoneId"))
    roleName = models.CharField(max_length=50)
    type = models.CharField(max_length=5, choices=[('E', 'e'), ('S', 's'), ("E/S", 'e/s')])
    def __str__(self):
        return f"Role {self.roleName}"
