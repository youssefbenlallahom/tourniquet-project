# Generated by Django 5.0.7 on 2024-08-30 16:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assignment', '0010_rename_role_assignment_role_ids'),
    ]

    operations = [
        migrations.RenameField(
            model_name='assignment',
            old_name='role_ids',
            new_name='role',
        ),
    ]
