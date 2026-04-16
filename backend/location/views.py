from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Location, Notification
from .serializers import LocationSerializer, NotificationSerializer

from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
import csv


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Location.objects.filter(user=self.request.user).order_by("-created_at")

        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")

        if start and end:
            queryset = queryset.filter(created_at__date__range=[start, end])

        return queryset

    def perform_create(self, serializer):
        loc = serializer.save(user=self.request.user)

        # Geofence alert
        if loc.latitude > 50:
            Notification.objects.create(
                user=self.request.user,
                message=f"Device '{loc.name}' crossed geofence boundary (lat > 50°)!"
            )

    # FIX: export actions moved here from NotificationViewSet
    @action(detail=False, methods=["get"])
    def export_json(self, request):
        locations = self.get_queryset()
        serializer = self.get_serializer(locations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        locations = self.get_queryset()

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=location_history.csv"

        writer = csv.writer(response)
        writer.writerow(["Name", "Latitude", "Longitude", "Timestamp"])

        for loc in locations:
            writer.writerow([loc.name, loc.latitude, loc.longitude, loc.created_at])

        return response


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")
