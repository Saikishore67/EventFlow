from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from .serializers import RegisterSerializer
from .models import User


class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "message" : "Account created successfully.",
            "user" : {
                'username' : user.username,
                'id' : user.id,
                'email' : user.email,
                "is_organizer" : user.is_organizer,
                "is_attendee" : user.is_attendee,
            },
            "tokens" : {
                "refresh" : str(refresh),
                "access" : str(refresh.access_token)
            }
        }, status = status.HTTP_201_CREATED)