from django.db import models
from role.models import Role

class UserRole(models.Model):
    first_name=models.CharField(max_length=50)
    last_name=models.CharField(max_length=50)
    role=models.ForeignKey(Role, on_delete=models.CASCADE)
    def __str__(self):
        return self.role

