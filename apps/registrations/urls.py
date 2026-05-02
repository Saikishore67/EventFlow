from django.urls import path
from .views import EventRegistrationAPIView, MyRegistrationsAPIView, CancelRegistrationAPIView

urlpatterns = [
    path('events/<int:event_id>/register/', EventRegistrationAPIView.as_view(), name='event-register'),
    path('mine/', MyRegistrationsAPIView.as_view(), name='my-registrations'),
    path('<int:registration_id>/cancel/', CancelRegistrationAPIView.as_view(), name='cancel-registration'),
]