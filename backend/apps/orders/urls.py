from django.urls import path
from .views import OrderListView, OrderUpdateView, CommentCreateView, OrderDetailView, GroupListCreateView, \
    ExportOrdersExcelView

urlpatterns = [
    path("", OrderListView.as_view(), name="order_list"),
    path("<int:pk>/", OrderDetailView.as_view(), name="order_detail"),
    path("<int:pk>/edit/", OrderUpdateView.as_view(), name="order_edit"),
    path("<int:order_id>/comments/", CommentCreateView.as_view(), name="order_comment_create"),
    path("groups/", GroupListCreateView.as_view(), name="group_list_create"),
    path("export/", ExportOrdersExcelView.as_view(), name="export_orders_excel")
]
