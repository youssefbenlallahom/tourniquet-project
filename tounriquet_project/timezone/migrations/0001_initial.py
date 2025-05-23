# Generated by Django 5.0.7 on 2024-07-29 10:12

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Timezone',
            fields=[
                ('TimezoneId', models.AutoField(primary_key=True, serialize=False)),
                ('SunTime1', models.CharField(max_length=4)),
                ('SunTime2', models.CharField(default='0000', max_length=4)),
                ('SunTime3', models.CharField(default='0000', max_length=4)),
                ('MonTime1', models.CharField(max_length=4)),
                ('MonTime2', models.CharField(default='0000', max_length=4)),
                ('MonTime3', models.CharField(default='0000', max_length=4)),
                ('TueTime1', models.CharField(max_length=4)),
                ('TueTime2', models.CharField(default='0000', max_length=4)),
                ('TueTime3', models.CharField(default='0000', max_length=4)),
                ('WedTime1', models.CharField(max_length=4)),
                ('WedTime2', models.CharField(default='0000', max_length=4)),
                ('WedTime3', models.CharField(default='0000', max_length=4)),
                ('ThuTime1', models.CharField(max_length=4)),
                ('ThuTime2', models.CharField(default='0000', max_length=4)),
                ('ThuTime3', models.CharField(default='0000', max_length=4)),
                ('FriTime1', models.CharField(max_length=4)),
                ('FriTime2', models.CharField(default='0000', max_length=4)),
                ('FriTime3', models.CharField(default='0000', max_length=4)),
                ('SatTime1', models.CharField(max_length=4)),
                ('SatTime2', models.CharField(default='0000', max_length=4)),
                ('SatTime3', models.CharField(default='0000', max_length=4)),
                ('Hol1Time1', models.CharField(max_length=4)),
                ('Hol1Time2', models.CharField(default='0000', max_length=4)),
                ('Hol1Time3', models.CharField(default='0000', max_length=4)),
                ('Hol2Time1', models.CharField(max_length=4)),
                ('Hol2Time2', models.CharField(default='0000', max_length=4)),
                ('Hol2Time3', models.CharField(default='0000', max_length=4)),
                ('Hol3Time1', models.CharField(max_length=4)),
                ('Hol3Time2', models.CharField(default='0000', max_length=4)),
                ('Hol3Time3', models.CharField(default='0000', max_length=4)),
            ],
        ),
    ]
