from django.urls import path
from .views import EventRegistrationAPIView

urlpatterns = [
    path('events/<int:event_id>/register/',
    EventRegistrationAPIView.as_view(),
    name='event-register'
    ),
]