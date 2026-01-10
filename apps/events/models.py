from django.db import models
from django.conf import settings

# Create your models here.

class Event(models.Model):
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE, 
        related_name = "events",
        limit_choices_to={"is_organizer": True},
    )

    title = models.CharField(max_length = 255)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    capacity = models.PositiveIntegerField()
    is_published = models.BooleanField(default = False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_time"]
    
    def __str__(self):
        return self.title
