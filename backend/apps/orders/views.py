import openpyxl
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, serializers, filters, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.users.permissions import IsAdminOrManager
from .filters import OrderFilter
from .models import Order, Group
from .serializers import OrderSerializer, CommentSerializer, GroupSerializer


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OrderFilter
    search_fields = ["name", "surname", "email", "phone", "utm", "msg"]
    ordering_fields = [
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
        "group__name",
        "manager__last_name",
        "created_at",
    ]
    ordering = ["-id"]

    def get_queryset(self):
        queryset = Order.objects.select_related("manager", "group").prefetch_related("comments")
        mine = self.request.query_params.get("mine")
        if mine and mine.lower() in ["true", "1"]:
            queryset = queryset.filter(manager=self.request.user)
        return queryset


class OrderUpdateView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    queryset = Order.objects.all()

    def perform_update(self, serializer):
        user = self.request.user
        order = self.get_object()
        if order.manager not in [None, user]:
            raise PermissionDenied("You can edit only your or free orders.")

        new_status = self.request.data.get("status")

        if new_status == Order.Status.NEW:
            serializer.save(status=Order.Status.NEW, manager=None)
            return

        if order.manager is None:
            if not new_status or new_status == Order.Status.NEW:
                serializer.save(manager=user, status=Order.Status.IN_WORK)
            else:
                serializer.save(manager=user, status=new_status)
            return

        serializer.save()


class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]

    def perform_create(self, serializer):
        user = self.request.user
        order_id = self.kwargs.get("order_id")
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            raise serializers.ValidationError({"detail": "Order not found."})
        if order.manager is None and order.status in [Order.Status.NEW, None]:
            order.manager = user
            order.status = Order.Status.IN_WORK
            order.save(update_fields=["manager", "status"])
        if order.manager != user:
            raise PermissionDenied("You can comment only orders assigned to you.")
        serializer.save(author=user, order=order)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    queryset = Order.objects.all()


class GroupListCreateView(generics.ListCreateAPIView):
    queryset = Group.objects.all().order_by("-created_at")
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]

    def create(self, request, *args, **kwargs):
        name = request.data.get("name")
        if not name:
            return Response({"detail": "Group name is required."}, status=status.HTTP_400_BAD_REQUEST)
        if Group.objects.filter(name__iexact=name).exists():
            return Response({"detail": "Group with this name already exists."}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)


class ExportOrdersExcelView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OrderFilter
    search_fields = ["name", "surname", "email", "phone", "utm", "msg"]
    ordering_fields = [
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
        "group__name",
        "manager__last_name",
        "created_at",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Order.objects.select_related("manager", "group").prefetch_related("comments")
        mine = self.request.query_params.get("mine")
        if mine and mine.lower() in ["true", "1"]:
            queryset = queryset.filter(manager=self.request.user)
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(self.request, queryset, self)
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Orders"
        headers = [
            "ID",
            "Name",
            "Surname",
            "Email",
            "Phone",
            "Age",
            "Course",
            "Course Format",
            "Course Type",
            "Status",
            "Sum",
            "Already Paid",
            "UTM",
            "Message",
            "Group",
            "Manager",
            "Created At",
        ]
        ws.append(headers)
        for order in queryset:
            ws.append([
                order.id,
                order.name or "",
                order.surname or "",
                order.email or "",
                order.phone or "",
                order.age or "",
                order.course or "",
                order.course_format or "",
                order.course_type or "",
                order.status or "",
                order.sum or "",
                order.alreadyPaid or "",
                order.utm or "",
                order.msg or "",
                order.group.name if order.group else "",
                order.manager.last_name if order.manager else "",
                order.created_at.strftime("%Y-%m-%d %H:%M") if order.created_at else "",
            ])
        response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = 'attachment; filename="orders.xlsx"'
        wb.save(response)
        return response
