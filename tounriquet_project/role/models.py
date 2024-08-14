from django.db import models
from access.models import Access
from timezone.models import Timezone
from assignment.models import Assignment
class Role(models.Model):
    access = models.ForeignKey(Access, verbose_name=("AccessId"), on_delete=models.CASCADE)
    timezone=models.ManyToManyField(Timezone, verbose_name=("TimezoneId"))
    assignment=models.ForeignKey(Assignment, verbose_name=("AssignmentId"), on_delete=models.CASCADE,null=True,blank=True)
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=5, choices=[('E', 'e'), ('S', 's'), ("E/S", 'e/s')])
    def __str__(self):
        return f"Role {self.name}"
