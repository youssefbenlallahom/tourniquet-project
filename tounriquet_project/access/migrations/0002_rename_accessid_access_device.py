# Generated by Django 5.0.7 on 2024-07-31 10:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('access', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='access',
            old_name='AccessId',
            new_name='device',
        ),
    ]