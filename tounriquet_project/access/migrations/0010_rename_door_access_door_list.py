# Generated by Django 5.0.7 on 2024-08-01 09:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('access', '0009_rename_access_access_door'),
    ]

    operations = [
        migrations.RenameField(
            model_name='access',
            old_name='door',
            new_name='door_list',
        ),
    ]