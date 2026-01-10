from django.contrib import admin
from .models import Event

# Register your models here.
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'organizer',
        'start_time',
        'capacity',
        'is_published',
    )

    list_filter = ('is_published', 'start_time')
    search_filter = ('title', 'description')
    ordering = ('-start_time',)