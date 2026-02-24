from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Rescuer, EmergencyContact
from .serializers import (
    RescuerListSerializer,
    RescuerSerializer,
    EmergencyContactSerializer,
)


class RescuerListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "email", "position", "city", "country"]
    ordering_fields = ["last_name", "status", "department", "hire_date", "created_at"]
    ordering = ["last_name", "first_name"]

    def get_queryset(self):
        qs = Rescuer.objects.select_related("supervisor", "created_by").prefetch_related("emergency_contacts")

        status_param = self.request.query_params.get("status")
        department_param = self.request.query_params.get("department")
        employment_type_param = self.request.query_params.get("employment_type")

        if status_param:
            qs = qs.filter(status=status_param)
        if department_param:
            qs = qs.filter(department=department_param)
        if employment_type_param:
            qs = qs.filter(employment_type=employment_type_param)

        return qs

    def get_serializer_class(self):
        if self.request.method == "GET":
            return RescuerListSerializer
        return RescuerSerializer


class RescuerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RescuerSerializer
    queryset = Rescuer.objects.select_related("supervisor", "created_by").prefetch_related("emergency_contacts")

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [IsAuthenticated()]


class EmergencyContactListCreateView(generics.ListCreateAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmergencyContact.objects.filter(rescuer_id=self.kwargs["rescuer_pk"])

    def perform_create(self, serializer):
        rescuer = generics.get_object_or_404(Rescuer, pk=self.kwargs["rescuer_pk"])
        serializer.save(rescuer=rescuer)


class EmergencyContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmergencyContact.objects.filter(rescuer_id=self.kwargs["rescuer_pk"])


class RescuerStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count

        stats_status = (
            Rescuer.objects
            .values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        stats_department = (
            Rescuer.objects
            .values("department")
            .annotate(count=Count("id"))
            .order_by("department")
        )
        return Response({
            "by_status": {item["status"]: item["count"] for item in stats_status},
            "by_department": {item["department"]: item["count"] for item in stats_department},
        })