from django.db import models
from device.models import Device
class Access(models.Model):
    STATUS_CHOICES = [
        ('E', 'e'),
        ('S', 's')
    ]
    name=models.CharField(max_length=50)
    status = models.CharField(max_length=1,choices=STATUS_CHOICES)
    device = models.ForeignKey(Device, verbose_name=("AccessId"), on_delete=models.CASCADE)
    num_port= models.IntegerField()
    
    def __str__(self):
        return f"Access {self.device}"
