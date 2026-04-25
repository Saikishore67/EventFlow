from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Registration
from apps.events.serializers import EventMiniSerializer
from django.db import IntegrityError


# which user is attending what event and what is the status 

class RegistrationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = []

    def validate(self, attrs):
        user = self.context["request"].user
        event = self.context["event"]

        if Registration.objects.filter(user=user, event=event).exists():
            raise serializers.ValidationError("Already registered.")
        
        if Registration.objects.filter(event=event).count() >= event.capacity:
            raise serializers.ValidationError("Event is full")
        
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        event = self.context["event"]

        try:
            return Registration.objects.create(
                user=user,
                event=event,
            )
        except IntegrityError:
            raise serializers.ValidationError("Registration already exists.")


class RegistrationReadSerializer(serializers.ModelSerializer):
    event = EventMiniSerializer(read_only = True)

    class Meta:
        model = Registration
        fields = [
            'id',
            'event',
            'status',
            'ticket_code',
            'qr_code',
            'created_at',
        ]
    def get_qr_code(self, obj):
        request = self.context.get('request')
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None
