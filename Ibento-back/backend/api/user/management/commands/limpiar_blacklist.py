from django.core.management.base import BaseCommand
from api.models import TokenBlackList
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Elimina tokens de la blacklist con más de 7 días'

    def handle(self, *args, **kwargs):
        expirados = timezone.now() - timedelta(days=7)
        eliminados = TokenBlackList.objects.filter(fecha__lt=expirados).delete()
        self.stdout.write(f'Tokens eliminados: {eliminados[0]}')
