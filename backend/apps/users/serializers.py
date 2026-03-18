from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "is_active", "is_banned", "last_login",
                  "date_joined"]


class ManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_banned",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]


class SetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=6)


class ManagerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "is_banned",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "role", "is_active", "is_banned", "date_joined", "last_login"]

        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": True, "allow_blank": False},
            "last_name": {"required": True, "allow_blank": False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("First name cannot be empty.")
        return value

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Last name cannot be empty.")
        return value

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            role=User.Role.MANAGER,
            is_active=False,
            is_banned=False,
        )
        user.set_unusable_password()
        user.save()
        return user

class ManagerActionSerializer(serializers.ModelSerializer):
    action = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["action"]

    def update(self, instance, validated_data):
        action = validated_data.get("action")
        if action == "ban":
            instance.is_banned = True
            instance.save(update_fields=["is_banned"])
        elif action == "unban":
            instance.is_banned = False
            instance.save(update_fields=["is_banned"])
        else:
            raise serializers.ValidationError("Invalid action")
        return instance