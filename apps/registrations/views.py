from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Registration
from .serializers import RegistrationCreateSerializer, RegistrationReadSerializer
from apps.events.models import Event

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

        response_serializer = RegistrationReadSerializer(
            registration,
            context = {"request" : request}
        )

        return Response(
            response_serializer.data,
            status = status.HTTP_201_CREATED,
            )