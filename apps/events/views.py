from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import PermissionDenied
from .models import Event
from .serializers import EventSerializer
from .permissions import IsEventOrganizer, IsEventOwnerOrAdmin


class EventListCreateAPIView(generics.ListCreateAPIView):
    """
    GET  -> Public list of published events
    POST -> Create event (organizer only)
    """

    serializer_class = EventSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        'organizer',
    ]

    search_fields = [
        'title',
        'description',
    ]

    ordering_fields = [
        'start_time',
        'created_at',
    ]

    ordering = ['start_time']

    def get_queryset(self): #Controls WHAT data is returned in GET /api/events/
        queryset = Event.objects.filter(is_published=True)

        if self.request.user.is_authenticated:
            queryset = queryset | Event.objects.filter(organizer=self.request.user)

        return queryset.distinct()

    def get_permissions(self): #Controls WHO can access POST /api/events/
        if self.request.method == "POST":
            return [
                permissions.IsAuthenticated(),
                IsEventOrganizer(),
            ]
        return []

    def perform_create(self, serializer): #Controls HOW an event is created
        serializer.save(organizer=self.request.user)

class EventRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    queryset = Event.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        return [
            permissions.IsAuthenticated(),
            IsEventOwnerOrAdmin(),
        ]
    
    def get_object(self):
        obj = super().get_object()

        if self.request.method != "GET":
            self.check_object_permissions(self.request, obj)

            if not self.request.user.is_staff and not self.request.user.is_organizer:
                raise PermissionDenied("Only organizers can modify this event.")
        return obj 
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {"message" : "Event deleted successfully."},
            status = status.HTTP_200_OK
        )