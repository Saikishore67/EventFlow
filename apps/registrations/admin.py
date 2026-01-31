from django.contrib import admin
from .models import Registration


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    # What you see in the list view
    list_display = (
        'event_title',
        'user',
        'status',
        'created_at',
    )

    # Clickable links
    list_display_links = ('event_title', 'user')

    # Right sidebar filters
    list_filter = (
        'status',
        'event',
        'created_at',
    )

    # Top search bar
    search_fields = (
        'user__email',
        'user__username',
        'event__title',
    )

    # Default ordering
    ordering = ('-created_at',)

    # Fields that should never be edited manually
    readonly_fields = ('created_at',)

    # Custom column to show event title
    def event_title(self, obj):
        return obj.event.title

    event_title.short_description = 'Event'
