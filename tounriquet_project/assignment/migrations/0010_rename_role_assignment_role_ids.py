# Generated by Django 5.0.7 on 2024-08-30 16:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assignment', '0009_remove_assignment_role_assignment_role'),
    ]

    operations = [
        migrations.RenameField(
            model_name='assignment',
            old_name='role',
            new_name='role_ids',
        ),
    ]