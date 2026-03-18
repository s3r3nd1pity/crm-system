from rest_framework import serializers

def validate_no_spaces(value: str):
    if ' ' in value:
        raise serializers.ValidationError("Cannot contain spaces")
    return value

def validate_positive(value):
    if value is not None and value < 0:
        raise serializers.ValidationError("Must be positive or zero")
    return value
