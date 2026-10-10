from django.db.models.signals import pre_save
from django.contrib.auth.models import User


def use_email_as_username(sender, instance, **kwargs):
    if instance.email:
        instance.email = instance.email.strip().lower()
        instance.username = instance.email


pre_save.connect(use_email_as_username, sender=User)