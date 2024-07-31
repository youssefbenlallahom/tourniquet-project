from django.db import models
from device.models import Device
class Access(models.Model):
    STATUS_CHOICES = [
        ('E', 'e'),
        ('S', 's')
    ]
    name=models.CharField(max_length=50)
    device = models.ForeignKey(Device, verbose_name=("AccessId"), on_delete=models.CASCADE)
    entry_port= models.IntegerField()
    exit_port= models.IntegerField()
    
    def __str__(self):
        return f"Access {self.device}"
