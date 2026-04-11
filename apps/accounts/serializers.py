from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only = True,
        required = True,
        validators = [validate_password]
    )
    password2 = serializers.CharField(
        write_only = True,
        required = True,
        label = "Confirm Password"
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password2',
            'is_organizer',
            'is_attendee',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if attrs.get('is_organizer') and attrs.get('is_attendee'):
            raise serializers.ValidationError({"role": "User cannot be both organizer and attendee."})
        
        if not attrs.get('is_organizer') and not attrs.get('is_attendee'):
            raise serializers.ValidationError({"role": "User must be either an organiser or an attendee."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user