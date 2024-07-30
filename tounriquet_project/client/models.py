from django.db import models


class Client(models.Model):
    first_name=models.CharField(max_length=50)
    last_name=models.CharField(max_length=50)
    pin=models.CharField(max_length=20,unique=False)
    cardNo=models.IntegerField()
    color=models.CharField(max_length=20)
    startHour=models.IntegerField()
    nbrH=models.IntegerField()
    isSuper=models.BooleanField(default=False)
    isAdmin=models.BooleanField(default=False)
    def __str__(self):
        return f"Client {self.id}"