from django.db import models
from access.models import Access
from timezone.models import Timezone
from role.models import Role
class Assignment(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True, blank=True)
    braceletId = models.CharField(max_length=100)
    color = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    access_ids = models.ManyToManyField(Access, related_name='assignments')
    timezone_ids = models.ManyToManyField(Timezone, related_name='assignments')

class Assignment_Access(models.Model):
    access_id = models.ForeignKey(Access, related_name='assignment_accesses', on_delete=models.CASCADE, blank=True, null=True)
    assignment_id = models.ForeignKey(Assignment, related_name='assignment_accesses', on_delete=models.CASCADE, blank=True, null=True)
    timezone_id = models.ForeignKey(Timezone, related_name='assignment_accesses', on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return f"Assignment_Access {self.access_id}"