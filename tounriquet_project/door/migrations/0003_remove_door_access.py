# Generated by Django 5.0.7 on 2024-07-31 14:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('door', '0002_door_access'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='door',
            name='access',
        ),
    ]
