# Generated by Django 3.2 on 2025-06-16 02:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_metricas'),
    ]

    operations = [
        migrations.AddField(
            model_name='matches',
            name='compatibilidad',
            field=models.FloatField(default=0.0),
        ),
    ]
