from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Registration
from .serializers import RegistrationCreateSerializer, RegistrationReadSerializer
from apps.events.models import Event
import os
from apps.notifications.models import Notification

# Create your views here.

class EventRegistrationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        
        event = get_object_or_404(Event, id=event_id)

        serializer = RegistrationCreateSerializer(
            data = request.data,
            context = {
                'request': request,
                'event': event,
            }
        )
        serializer.is_valid(raise_exception=True)
        registration = serializer.save()

        Notification.objects.create(
            user=request.user,
            title="Registration confirmed",
            message=f"You have successfully registered for {event.title}.",
            notification_type=Notification.TYPE_REGISTRATION_CONFIRMED,
        )

        response_serializer = RegistrationReadSerializer(
            registration,
            context = {"request" : request}
        )

        return Response(
            response_serializer.data,
            status = status.HTTP_201_CREATED,
            )

class MyRegistrationsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        registrations = Registration.objects.filter(user=request.user)
        serializer = RegistrationReadSerializer(registrations,
        many=True,
        context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

class CancelRegistrationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, registration_id):
        registration = get_object_or_404(
            Registration,
            id=registration_id,
            user=request.user
        )

        # Delete the OR code image file from disk
        if registration.qr_code:
            qr_path = registration.qr_code.path
            if os.path.exists(qr_path):
                os.remove(qr_path)
        
        event_title = registration.event.title
        registration.delete()

        Notification.objects.create(
            user = request.user,
            title = "Registration cancelled",
            message = f"Your registration for {event_title} has been cancelled.",
            notification_type = Notification.TYPE_REGISTRATION_CANCELLED,
        )

        return Response(
            {"message": "Registration cancelled successfully. Your spot has been released."},
            status=status.HTTP_200_OK
        )