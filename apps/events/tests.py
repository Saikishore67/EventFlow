from django.test import TestCase

# Create your tests here.
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Event


User = get_user_model()


class EventDetailUpdateDeleteTests(APITestCase):
    def setUp(self):
        self.organizer = User.objects.create_user(
            username="organizer",
            password="pass12345",
            is_organizer=True,
            is_attendee=False,
        )
        self.other_organizer = User.objects.create_user(
            username="other-organizer",
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
            title="Launch Night",
            description="A product launch event.",
            start_time=timezone.now() + timedelta(days=7),
            end_time=timezone.now() + timedelta(days=7, hours=2),
            capacity=100,
            is_published=True,
        )

        self.detail_url = reverse("event-detail", kwargs={"pk": self.event.pk})

    def test_public_user_can_view_event_detail(self):
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], self.event.title)

    def test_event_owner_can_update_event(self):
        self.client.force_authenticate(user=self.organizer)

        response = self.client.patch(
            self.detail_url,
            {"title": "Updated Launch Night"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.event.refresh_from_db()
        self.assertEqual(self.event.title, "Updated Launch Night")

    def test_non_owner_organizer_cannot_update_event(self):
        self.client.force_authenticate(user=self.other_organizer)

        response = self.client.patch(
            self.detail_url,
            {"title": "Hijacked Launch Night"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.event.refresh_from_db()
        self.assertEqual(self.event.title, "Launch Night")

    def test_attendee_cannot_update_event(self):
        self.client.force_authenticate(user=self.attendee)

        response = self.client.patch(
            self.detail_url,
            {"title": "Attendee Update"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.event.refresh_from_db()
        self.assertEqual(self.event.title, "Launch Night")

    def test_event_owner_can_delete_event(self):
        self.client.force_authenticate(user=self.organizer)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Event.objects.filter(pk=self.event.pk).exists())