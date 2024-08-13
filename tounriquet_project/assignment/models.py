from django.db import models
class Assignment(models.Model):
    braceletId = models.IntegerField()
    color=models.CharField(max_length=50)
    name=models.CharField(max_length=50)
    def __str__(self):
        return f"Assignment {self.braceletId}"
