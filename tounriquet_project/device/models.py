from django.db import models

class Device(models.Model):
    DeviceId = models.AutoField(primary_key=True)
    device_ip= models.GenericIPAddressField(unique=True)
    port=models.CharField(max_length=50,default='4370')
    nb_doors=models.IntegerField(default=4)

    def __str__(self):
        return f"Device {self.DeviceId}"
