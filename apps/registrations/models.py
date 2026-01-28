from django.db import models
from django.conf import settings
from apps.events.models import Event

# Create your models here.

User = settings.AUTH_USER_MODEL

class Registration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="registrations")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registrations")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "event")
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"{self.user} registered for {self.event}"