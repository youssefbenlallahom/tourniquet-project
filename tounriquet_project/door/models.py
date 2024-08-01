from django.db import models
from device.models import Device
class Door(models.Model):
    device = models.ForeignKey(Device, verbose_name=("DeviceId"), on_delete=models.CASCADE)
    type = models.CharField(max_length=5, choices=[('E', 'e'), ('S', 's'), ('E/S', 'e/s')])
    port=models.IntegerField()
    doorNumber=models.IntegerField()
    def __str__(self):
        return f"Door {self.type}"
