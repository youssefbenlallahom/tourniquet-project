from django.db import models
from client.models import Client
from timezone.models import Timezone

class ClientAuth(models.Model):
    client_id = models.OneToOneField(Client, primary_key=True, verbose_name="client_id", on_delete=models.CASCADE)
    AuthorizeTimezoneId = models.ForeignKey(Timezone, verbose_name="TimezoneId", on_delete=models.CASCADE, to_field='TimezoneId')
    ip = models.GenericIPAddressField(unique=True)
    AuthorizeDoorId = models.CharField(max_length=50)

    def __str__(self):
        return f"Client {self.id}"