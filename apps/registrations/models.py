from django.db import models
from django.conf import settings
from apps.events.models import Event

# Create your models here.
import uuid
import qrcode
import os
from django.conf import settings as django_settings

User = settings.AUTH_USER_MODEL

def generate_ticket_code():
    #generate a unique code
    return "EVT-" + uuid.uuid4().hex[:8].upper()

def generate_qr_code(ticket_code):
    #generate a QR code for ticket code and save it to media/qrcodes/
    qr = qrcode.make(ticket_code)

    qr_dir = os.path.join(django_settings.MEDIA_ROOT, 'qrcodes')
    os.makedirs(qr_dir, exist_ok=True)

    filename = f"qr_{ticket_code}.png"
    filepath = os.path.join(qr_dir, filename)
    qr.save(filepath)

    return f"qrcodes/{filename}" # relative path stored in DB

class Registration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')

    ticket_code = models.CharField(max_length=20, unique=True, blank=True)
    qr_code = models.ImageField(upload_to='qrcodes/', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = (
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("waitlisted", "Waitlisted"),
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="confirmed"
    )

    class Meta:
        unique_together = ("user", "event")
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.ticket_code:
            self.ticket_code = generate_ticket_code()
            self.qr_code = generate_qr_code(self.ticket_code)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user} registered for {self.event} | {self.ticket_code}"