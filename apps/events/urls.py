from django.urls import path
from .views import PublicEventListAPIView

urlpatterns = [
    path('', PublicEventListAPIView.as_view(), name='public-event-list'),
]