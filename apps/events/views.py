from rest_framework import generics, permissions
from .models import Event
from .serializers import EventSerializer
from .permissions import IsEventOrganizer


class EventListCreateAPIView(generics.ListCreateAPIView):
    """
    GET  -> Public list of published events
    POST -> Create event (organizer only)
    """

    serializer_class = EventSerializer

    def get_queryset(self):
        return Event.objects.filter(is_published=True)

    def get_permissions(self):
        if self.request.method == "POST":
            return [
                permissions.IsAuthenticated(),
                IsEventOrganizer(),
            ]
        return []

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
