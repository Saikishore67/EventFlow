from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_REGISTRATION_CONFIRMED = "registration_confirmed"
    TYPE_REGISTRATION_CANCELLED = "registration_cancelled"
    TYPE_EVENT_UPDATE = "event_update"

    NOTIFICATION_TYPES = (
        (TYPE_REGISTRATION_CONFIRMED, "Registration Confirmed"),
        (TYPE_REGISTRATION_CANCELLED, "Registration Cancelled"),
        (TYPE_EVENT_UPDATE, "Event Update"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.title}"