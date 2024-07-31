from django.db import models

class Device(models.Model):
    DeviceId = models.AutoField(primary_key=True)
    device_ip= models.GenericIPAddressField(unique=True)
    device_name=models.CharField(max_length=50)
    nb_port=models.IntegerField()

    def __str__(self):
        return f"Device {self.DeviceId}"
