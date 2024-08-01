from django.db import models
from role.models import Role
class Assignment(models.Model):
    role = models.ForeignKey(Role, verbose_name=("RoleId"), on_delete=models.CASCADE)
    braceletId = models.IntegerField()
    color=models.CharField(max_length=50)
    startTime=models.TimeField()
    gameName=models.CharField(max_length=50)
    gameDuration=models.IntegerField()
    def __str__(self):
        return f"Assignment {self.braceletId}"
