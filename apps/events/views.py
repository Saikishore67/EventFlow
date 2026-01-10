from django.shortcuts import render
from rest_framework import generics
from .models import Event
from .serializers import EventSerializer

# Create your views here.

class PublicEventListAPIView(generics.ListAPIView):



    serializer_class = EventSerializer

    def get_queryset(self):
        return Event.objects.filter(is_published=True)        
