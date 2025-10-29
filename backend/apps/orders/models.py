from django.db import models
from django.utils import timezone

from apps.users.models import User


class Group(models.Model):
    class Meta:
        db_table = "groups"

    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name


class Order(models.Model):
    class Meta:
        db_table = "orders"

    class Status(models.TextChoices):
        NEW = "New"
        IN_WORK = "In work"
        AGREE = "Agree"
        DISAGREE = "Disagree"
        DUBBING = "Dubbing"

    class Course(models.TextChoices):
        FS = "FS"
        QACX = "QACX"
        JCX = "JCX"
        JSCX = "JSCX"
        FE = "FE"
        PCX = "PCX"

    class Type(models.TextChoices):
        PRO = "pro"
        MINIMAL = "minimal"
        PREMIUM = "premium"
        INCUBATOR = "incubator"
        VIP = "vip"

    class Format(models.TextChoices):
        STATIC = "static"
        ONLINE = "online"

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    surname = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    course = models.CharField(max_length=50, choices=Course.choices, blank=True, null=True)
    course_type = models.CharField(max_length=50, choices=Type.choices, blank=True, null=True)
    course_format = models.CharField(max_length=50, choices=Format.choices, blank=True, null=True)
    sum = models.IntegerField(blank=True, null=True)
    alreadyPaid = models.IntegerField(blank=True, null=True)
    utm = models.CharField(max_length=255, blank=True, null=True)
    msg = models.TextField(blank=True, null=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name or ''} {self.surname or ''} - {self.course or ''}"


class Comment(models.Model):
    class Meta:
        db_table = "comments"

    order = models.ForeignKey("Order", on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="comments")
    text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Comment by {self.author} on {self.order}"
