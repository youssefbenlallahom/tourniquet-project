# Generated by Django 5.0.7 on 2024-07-31 13:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('access', '0005_rename_entry_port_access_port_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='access',
            name='door',
        ),
    ]