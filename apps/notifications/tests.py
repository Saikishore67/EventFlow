from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Notification


User = get_user_model()


class NotificationAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="attendee",
            password="pass12345",
            is_organizer=False,
            is_attendee=True,
        )
        self.other_user = User.objects.create_user(
            username="other-attendee",
            password="pass12345",
            is_organizer=False,
            is_attendee=True,
        )
        self.notification = Notification.objects.create(
            user=self.user,
            title="Registration confirmed",
            message="You have successfully registered for Design Summit.",
            notification_type=Notification.TYPE_REGISTRATION_CONFIRMED,
        )
        self.other_notification = Notification.objects.create(
            user=self.other_user,
            title="Other notification",
            message="This belongs to another user.",
            notification_type=Notification.TYPE_REGISTRATION_CONFIRMED,
        )

    def test_user_can_list_only_their_notifications(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("notification-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification_ids = [item["id"] for item in response.data["results"]]

        self.assertIn(self.notification.id, notification_ids)
        self.assertNotIn(self.other_notification.id, notification_ids)

    def test_user_can_mark_notification_as_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "notification-read",
            kwargs={"notification_id": self.notification.id},
        )

        response = self.client.patch(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)

    def test_user_cannot_mark_other_users_notification_as_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "notification-read",
            kwargs={"notification_id": self.other_notification.id},
        )

        response = self.client.patch(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.other_notification.refresh_from_db()
        self.assertFalse(self.other_notification.is_read)

    def test_user_can_mark_all_notifications_as_read(self):
        Notification.objects.create(
            user=self.user,
            title="Registration cancelled",
            message="Your registration has been cancelled.",
            notification_type=Notification.TYPE_REGISTRATION_CANCELLED,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(reverse("notification-read-all"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["updated_count"], 2)
        self.assertFalse(
            Notification.objects.filter(user=self.user, is_read=False).exists()
        )
        self.assertFalse(
            Notification.objects.filter(
                user=self.other_user,
                is_read=True,
            ).exists()
        )