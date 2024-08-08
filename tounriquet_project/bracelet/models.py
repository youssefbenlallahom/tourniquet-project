from django.db import models
from django.utils import timezone
import datetime
class Bracelet(models.Model):
    num = models.IntegerField()
    bracelet_id = models.CharField(max_length=50)
    active = models.BooleanField(null=False)
    color = models.CharField(max_length=50)
    add_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Adjust time by adding one hour
        if not self.pk:  # Ensures it only changes on the first save
            self.add_date = timezone.now() + datetime.timedelta(hours=1)
        super(Bracelet, self).save(*args, **kwargs)

    def __str__(self):
        return f"bracelet {self.num}"