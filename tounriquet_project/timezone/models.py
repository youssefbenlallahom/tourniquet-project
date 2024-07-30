from django.db import models

class Timezone(models.Model):
    TimezoneId = models.AutoField(primary_key=True)
    SunTime1 = models.CharField(max_length=4)
    SunTime2 = models.CharField(max_length=4, default="0000")
    SunTime3 = models.CharField(max_length=4, default="0000")
    MonTime1 = models.CharField(max_length=4)
    MonTime2 = models.CharField(max_length=4, default="0000")
    MonTime3 = models.CharField(max_length=4, default="0000")
    TueTime1 = models.CharField(max_length=4)
    TueTime2 = models.CharField(max_length=4, default="0000")
    TueTime3 = models.CharField(max_length=4, default="0000")
    WedTime1 = models.CharField(max_length=4)
    WedTime2 = models.CharField(max_length=4, default="0000")
    WedTime3 = models.CharField(max_length=4, default="0000")
    ThuTime1 = models.CharField(max_length=4)
    ThuTime2 = models.CharField(max_length=4, default="0000")
    ThuTime3 = models.CharField(max_length=4, default="0000")
    FriTime1 = models.CharField(max_length=4)
    FriTime2 = models.CharField(max_length=4, default="0000")
    FriTime3 = models.CharField(max_length=4, default="0000")
    SatTime1 = models.CharField(max_length=4)
    SatTime2 = models.CharField(max_length=4, default="0000")
    SatTime3 = models.CharField(max_length=4, default="0000")
    Hol1Time1 = models.CharField(max_length=4)
    Hol1Time2 = models.CharField(max_length=4, default="0000")
    Hol1Time3 = models.CharField(max_length=4, default="0000")
    Hol2Time1 = models.CharField(max_length=4)
    Hol2Time2 = models.CharField(max_length=4, default="0000")
    Hol2Time3 = models.CharField(max_length=4, default="0000")
    Hol3Time1 = models.CharField(max_length=4)
    Hol3Time2 = models.CharField(max_length=4, default="0000")
    Hol3Time3 = models.CharField(max_length=4, default="0000")

    def __str__(self):
        return f"Timezone {self.TimezoneId}"