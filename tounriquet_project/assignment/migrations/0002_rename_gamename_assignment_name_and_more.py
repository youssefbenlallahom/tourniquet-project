# Generated by Django 5.0.7 on 2024-08-13 08:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assignment', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='assignment',
            old_name='gameName',
            new_name='name',
        ),
        migrations.RemoveField(
            model_name='assignment',
            name='gameDuration',
        ),
        migrations.RemoveField(
            model_name='assignment',
            name='role',
        ),
        migrations.RemoveField(
            model_name='assignment',
            name='startTime',
        ),
    ]
