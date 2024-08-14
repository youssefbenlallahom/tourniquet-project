from django.db import models
from access.models import Access
from timezone.models import Timezone

class Assignment(models.Model):
    braceletId = models.IntegerField()
    color=models.CharField(max_length=50)
    name=models.CharField(max_length=50)
    def __str__(self):
        return f"Assignment {self.braceletId}"

class Assignment_Access(models.Model):
    access_id = models.ForeignKey(Access, related_name='access_id',on_delete=models.CASCADE,blank=True,null=True)
    assignment_id = models.ForeignKey(Assignment, related_name='assignment_id',on_delete=models.CASCADE,blank=True,null=True)
    timezone_id = models.ForeignKey(Timezone, related_name='timezone_id',on_delete=models.CASCADE,blank=True,null=True)

    def __str__(self):
        return f"Assignment_Access {self.access_id}"