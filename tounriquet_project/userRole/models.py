from django.db import models

class UserRole(models.Model):
    first_name=models.CharField(max_length=50)
    last_name=models.CharField(max_length=50)
    role=models.CharField(max_length=50)
    def __str__(self):
        return self.role

