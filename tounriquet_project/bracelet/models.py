from django.db import models
from django.utils import timezone
import datetime

class Bracelet(models.Model):
    num = models.IntegerField(unique=True, blank=True, null=True)
    bracelet_id = models.CharField(max_length=50)
    active = models.BooleanField(null=False)
    color = models.CharField(max_length=50)
    add_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Automatically set the num field if it's not set
        if self.num is None:
            last_bracelet = Bracelet.objects.all().order_by('num').last()
            if last_bracelet:
                self.num = last_bracelet.num + 1
            else:
                self.num = 1

        # Adjust time by adding one hour
        self.add_date = timezone.now() + datetime.timedelta(hours=1)
        super(Bracelet, self).save(*args, **kwargs)

    def __str__(self):
        return f"Bracelet {self.num}"