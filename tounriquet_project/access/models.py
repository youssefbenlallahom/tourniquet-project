from django.db import models
from device.models import Device
from door.models import Door
class Access(models.Model):
    device = models.ForeignKey(Device, verbose_name=("DeviceId"), on_delete=models.CASCADE)
    door = models.ForeignKey(Door, verbose_name='accesses', on_delete=models.CASCADE)  

    type = models.CharField(max_length=1, choices=[('E', 'e'), ('S', 's')])
    port=models.IntegerField()
    def __str__(self):
        return f"Access {self.device}"
