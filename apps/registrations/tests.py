from django.test import TestCase

# Create your tests here.
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.events.models import Event
from apps.notifications.models import Notification
from .models import Registration


User = get_user_model()


class RegistrationNotificationTests(APITestCase):
    def setUp(self):
        self.organizer = User.objects.create_user(
            username="organizer",
            password="pass12345",
            is_organizer=True,
            is_attendee=False,
        )
        self.attendee = User.objects.create_user(
            username="attendee",
            password="pass12345",
            is_organizer=False,
            is_attendee=True,
        )
        self.event = Event.objects.create(
            organizer=self.organizer,
            title="Design Summit",
            description="A design conference.",
            start_time=timezone.now() + timedelta(days=10),
            end_time=timezone.now() + timedelta(days=10, hours=3),
            capacity=50,
            is_published=True,
        )
        self.register_url = reverse(
            "event-register",
            kwargs={"event_id": self.event.pk},
        )

    def test_registration_creates_confirmation_notification(self):
        self.client.force_authenticate(user=self.attendee)

        response = self.client.post(self.register_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Notification.objects.filter(
                user=self.attendee,
                notification_type=Notification.TYPE_REGISTRATION_CONFIRMED,
                title="Registration confirmed",
            ).exists()
        )

    def test_cancellation_creates_cancellation_notification(self):
        self.client.force_authenticate(user=self.attendee)
        registration = Registration.objects.create(
            user=self.attendee,
            event=self.event,
        )
        cancel_url = reverse(
            "cancel-registration",
            kwargs={"registration_id": registration.pk},
        )

        response = self.client.delete(cancel_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Registration.objects.filter(pk=registration.pk).exists())
        self.assertTrue(
            Notification.objects.filter(
                user=self.attendee,
                notification_type=Notification.TYPE_REGISTRATION_CANCELLED,
                title="Registration cancelled",
            ).exists()
        )