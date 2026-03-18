from rest_framework import serializers

from .models import Order, Comment, Group
from .validators import validate_no_spaces, validate_positive


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.last_name", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "author_name", "text", "created_at"]
        read_only_fields = ["id", "author_name", "created_at"]


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name", "created_at"]


class OrderSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    manager = serializers.CharField(source="manager.last_name", read_only=True)
    group = GroupSerializer(read_only=True)
    group_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    name = serializers.CharField(required=False, allow_blank=True,allow_null=True)
    surname = serializers.CharField(required=False, allow_blank=True,allow_null=True)
    email = serializers.CharField(required=False, allow_blank=True, allow_null=True,validators=[validate_no_spaces])
    phone = serializers.CharField(required=False, allow_blank=True,allow_null=True)
    utm = serializers.CharField(required=False, allow_blank=True,allow_null=True, validators=[validate_no_spaces])
    msg = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    age = serializers.IntegerField(required=False, allow_null=True, validators=[validate_positive])
    sum = serializers.IntegerField(required=False, allow_null=True, validators=[validate_positive])
    alreadyPaid = serializers.IntegerField(required=False, allow_null=True, validators=[validate_positive])

    class Meta:
        model = Order
        fields = [
            "id",
            "name",
            "surname",
            "email",
            "phone",
            "age",
            "course",
            "course_format",
            "course_type",
            "status",
            "sum",
            "alreadyPaid",
            "created_at",
            "utm",
            "msg",
            "manager",
            "group",
            "group_id",
            "comments",
        ]
        read_only_fields = ["id", "manager", "created_at", "comments"]

    def update(self, instance, validated_data):
        group_id = validated_data.pop("group_id", None)
        if group_id is not None:
            instance.group_id = group_id
        return super().update(instance, validated_data)
