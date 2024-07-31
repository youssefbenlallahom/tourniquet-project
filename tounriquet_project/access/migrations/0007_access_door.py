# Generated by Django 5.0.7 on 2024-07-31 14:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('access', '0006_remove_access_door'),
        ('door', '0003_remove_door_access'),
    ]

    operations = [
        migrations.AddField(
            model_name='access',
            name='door',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='door.door', verbose_name='accesses'),
            preserve_default=False,
        ),
    ]
