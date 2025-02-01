# Generated by Django 5.0.7 on 2024-08-13 08:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('access', '0013_remove_access_doors_access_doors'),
        ('timezone', '0006_alter_timezone_endtime_alter_timezone_starttime'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='timezone',
            name='access',
        ),
        migrations.AddField(
            model_name='timezone',
            name='access',
            field=models.ManyToManyField(related_name='access', to='access.access'),
        ),
    ]
