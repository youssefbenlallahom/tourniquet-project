# Generated by Django 5.0.7 on 2024-08-01 09:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('access', '0008_remove_access_device_remove_access_door_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='access',
            old_name='access',
            new_name='door',
        ),
    ]
