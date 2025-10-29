from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    MeView,
    ManagerListView,
    ManagerActionView,
    ActivateManagerView,
    ActivateByTokenView,
    RecoveryManagerView,
    RecoveryByTokenView,
    ManagerCreateView, ManagerStatisticsView,
)
from .auth import CustomTokenObtainPairView

urlpatterns = [
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("managers/", ManagerListView.as_view(), name="manager_list"),
    path("managers/create/", ManagerCreateView.as_view(), name="manager_create"),
    path("managers/<int:pk>/action/", ManagerActionView.as_view(), name="manager_action"),
    path("managers/<int:pk>/activate/", ActivateManagerView.as_view(), name="manager_activate"),
    path("activate/<str:token>/", ActivateByTokenView.as_view(), name="activate_by_token"),
    path("managers/<int:pk>/recovery/", RecoveryManagerView.as_view(), name="manager_recovery"),
    path("recovery/<str:token>/", RecoveryByTokenView.as_view(), name="recovery_by_token"),
    path("statistics/", ManagerStatisticsView.as_view(), name="manager_statistics"),

]
