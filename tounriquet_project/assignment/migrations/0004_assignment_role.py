# Generated by Django 5.0.7 on 2024-08-15 10:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assignment', '0003_assignment_access'),
        ('role', '0004_remove_role_assignment'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignment',
            name='role',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='role.role', verbose_name='AssignmentId'),
        ),
    ]
