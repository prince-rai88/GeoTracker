from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Location, Notification
from .serializers import LocationSerializer, NotificationSerializer

from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
import csv
import json



class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()   # ⭐ REQUIRED
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Location.objects.filter(user=self.request.user)

        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")

        if start and end:
            queryset = queryset.filter(created_at__range=[start, end])

        return queryset

    def perform_create(self, serializer):
        loc = serializer.save(user=self.request.user)

        # Example Geofence Alert
        if loc.latitude > 50:
            Notification.objects.create(
                user=self.request.user,
                message="Device crossed geofence boundary!"
            )


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()   # ⭐ REQUIRED
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    


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
        writer.writerow(["Latitude", "Longitude", "Timestamp"])

        for loc in locations:
            writer.writerow([loc.latitude, loc.longitude, loc.created_at])

        return response

