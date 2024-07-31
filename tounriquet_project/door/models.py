from django.db import models

class Door(models.Model):
    name=models.CharField(max_length=50)

    def __str__(self):
        return f"Door {self.name}"
