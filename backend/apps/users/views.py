from datetime import timedelta
from django.conf import settings

from rest_framework import generics, permissions, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.response import Response

from .models import User
from .serializers import UserSerializer, ManagerSerializer, SetPasswordSerializer, ManagerCreateSerializer
from .permissions import IsAdmin
from ..orders.models import Order


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ManagerListView(generics.ListAPIView):
    serializer_class = ManagerSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.MANAGER).order_by("-date_joined")


class ManagerActionView(generics.UpdateAPIView):
    serializer_class = ManagerSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.filter(role=User.Role.MANAGER)

    def patch(self, request, *args, **kwargs):
        manager = self.get_object()
        action = request.data.get("action")

        if action == "ban":
            manager.is_active = False
            manager.save(update_fields=["is_active"])
            return Response({"detail": "Manager deactivated."}, status=status.HTTP_200_OK)
        if action == "unban":
            if not manager.is_active:
                manager.is_active = True
                manager.save(update_fields=["is_active"])
                return Response({"detail": "Manager activated."}, status=status.HTTP_200_OK)
            return Response({"detail": "Already active."}, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)


class ActivateManagerView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            manager = User.objects.get(pk=pk, role=User.Role.MANAGER)
        except User.DoesNotExist:
            return Response({"detail": "Manager not found."}, status=status.HTTP_404_NOT_FOUND)
        token = AccessToken.for_user(manager)
        token.set_exp(from_time=None, lifetime=timedelta(minutes=30))
        base_url = getattr(settings, "BACKEND_URL", "http://localhost:8000")
        link = f"{base_url}/api/users/activate/{token}/"
        return Response({"activation_link": link}, status=status.HTTP_200_OK)


class RecoveryManagerView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            manager = User.objects.get(pk=pk, role=User.Role.MANAGER)
        except User.DoesNotExist:
            return Response({"detail": "Manager not found."}, status=status.HTTP_404_NOT_FOUND)
        token = AccessToken.for_user(manager)
        token.set_exp(from_time=None, lifetime=timedelta(minutes=30))
        base_url = getattr(settings, "BACKEND_URL", "http://localhost:8000")
        link = f"{base_url}/api/users/recovery/{token}/"
        return Response({"recovery_link": link}, status=status.HTTP_200_OK)


class ActivateByTokenView(APIView):
    def get(self, request, token):
        try:
            AccessToken(token)
            return Response({"valid": True}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"valid": False}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, token):
        try:
            data = AccessToken(token)
            user_id = data["user_id"]
        except Exception:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        password = request.data.get("password")
        if not password:
            return Response({"detail": "Password required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(password)
        user.is_active = True
        user.save(update_fields=["password", "is_active"])

        return Response({"detail": "Password set successfully."}, status=status.HTTP_200_OK)


class RecoveryByTokenView(APIView):
    def post(self, request, token):
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            access = AccessToken(token)
            user_id = access["user_id"]
        except Exception:
            raise AuthenticationFailed("Invalid or expired token.")
        try:
            user = User.objects.get(id=user_id, role=User.Role.MANAGER)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        user.set_password(serializer.validated_data["password"])
        user.save()
        return Response({"detail": "Password reset successfully."}, status=status.HTTP_200_OK)


class ManagerCreateView(generics.CreateAPIView):
    serializer_class = ManagerCreateSerializer
    queryset = User.objects.filter(role=User.Role.MANAGER)
    permission_classes = [IsAdmin]


class ManagerStatisticsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        orders = Order.objects.all()
        global_stats = {
            "total": orders.count(),
            "New": orders.filter(status=Order.Status.NEW).count(),
            "InWork": orders.filter(status=Order.Status.IN_WORK).count(),
            "Agree": orders.filter(status=Order.Status.AGREE).count(),
            "Disagree": orders.filter(status=Order.Status.DISAGREE).count(),
            "Dubbing": orders.filter(status=Order.Status.DUBBING).count(),
            "null": orders.filter(status__isnull=True).count(),
        }

        managers = []
        for m in User.objects.filter(role=User.Role.MANAGER).order_by("id"):
            user_orders = orders.filter(manager=m)
            managers.append({
                "id": m.id,
                "email": m.email,
                "first_name": m.first_name,
                "last_name": m.last_name,
                "is_active": m.is_active,
                "is_banned": m.is_banned,
                "date_joined": m.date_joined,
                "last_login": m.last_login,
                "stats": {
                    "total": user_orders.count(),
                    "in_work": user_orders.filter(status=Order.Status.IN_WORK).count(),
                    "agree": user_orders.filter(status=Order.Status.AGREE).count(),
                    "disagree": user_orders.filter(status=Order.Status.DISAGREE).count(),
                    "dubbing": user_orders.filter(status=Order.Status.DUBBING).count(),
                    "new": user_orders.filter(status=Order.Status.NEW).count(),
                }
            })

        return Response({"global": global_stats, "managers": managers})
