from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, NotificationViewSet

router = DefaultRouter()
router.register("locations", LocationViewSet)
router.register("notifications", NotificationViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
