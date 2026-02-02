from rest_framework import serializers
from .models import Registration
from apps.events.serializers import EventMiniSerializer


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
        
        return Registration.objects.create(
            user=user,
            event=event,
            status = "registered",
        )


class RegistrationReadSerializer(serializers.ModelSerializer):
    event = EventMiniSerializer(read_only = True)

    class Meta:
        model = Registration
        fields = [
            'id',
            'event',
            'status',
            'created_at',
        ]

