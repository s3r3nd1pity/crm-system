from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create default admin if not exists"

    def handle(self, *args, **options):
        User = get_user_model()
        if not User.objects.filter(email="admin@gmail.com").exists():
            User.objects.create_superuser(email="admin@gmail.com", password="admin")
            self.stdout.write(self.style.SUCCESS("Default admin created: admin@gmail.com / admin"))
        else:
            self.stdout.write(self.style.WARNING("Default admin already exists"))
