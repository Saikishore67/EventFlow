from django.contrib import admin
from .models import User

# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'is_staff', 'is_active', 'is_organizer', 'is_attendee')
    search_fields = ('username', 'email')
    list_filter = ('is_staff', 'is_active')
    ordering = ('id',)
