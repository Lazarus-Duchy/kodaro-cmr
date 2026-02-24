from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Survivor, SurvivorContact
from .serializers import (
    SurvivorListSerializer,
    SurvivorSerializer,
    SurvivorContactSerializer,
)


class SurvivorListCreateView(generics.ListCreateAPIView):
    """
    GET  /survivors/   → List all survivors.
    POST /survivors/   → Create a new survivor.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "city", "country"]
    ordering_fields = ["name", "status", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Survivor.objects.select_related("assigned_to", "created_by").prefetch_related("contacts")

        status_param = self.request.query_params.get("status")
        industry_param = self.request.query_params.get("industry")
        assigned_to_me = self.request.query_params.get("mine")

        if status_param:
            qs = qs.filter(status=status_param)
        if industry_param:
            qs = qs.filter(industry=industry_param)
        if assigned_to_me:
            qs = qs.filter(assigned_to=self.request.user)

        return qs

    def get_serializer_class(self):
        if self.request.method == "GET":
            return SurvivorListSerializer
        return SurvivorSerializer


class SurvivorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /survivors/<id>/   → Retrieve full survivor detail.
    PATCH  /survivors/<id>/   → Update a survivor.
    DELETE /survivors/<id>/   → Delete a survivor (admin only).
    """
    serializer_class = SurvivorSerializer
    queryset = Survivor.objects.select_related("assigned_to", "created_by").prefetch_related("contacts")

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [IsAuthenticated()]


class SurvivorContactListCreateView(generics.ListCreateAPIView):
    """
    GET  /survivors/<survivor_id>/contacts/   → List contacts.
    POST /survivors/<survivor_id>/contacts/   → Add a contact.
    """
    serializer_class = SurvivorContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SurvivorContact.objects.filter(survivor_id=self.kwargs["survivor_pk"])

    def perform_create(self, serializer):
        survivor = generics.get_object_or_404(Survivor, pk=self.kwargs["survivor_pk"])
        serializer.save(survivor=survivor)


class SurvivorContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /survivors/<survivor_id>/contacts/<id>/   → Retrieve a contact.
    PATCH  /survivors/<survivor_id>/contacts/<id>/   → Update a contact.
    DELETE /survivors/<survivor_id>/contacts/<id>/   → Delete a contact.
    """
    serializer_class = SurvivorContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SurvivorContact.objects.filter(survivor_id=self.kwargs["survivor_pk"])


class SurvivorStatsView(APIView):
    """
    GET /survivors/stats/   → Aggregated counts by status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count
        stats = (
            Survivor.objects
            .values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        return Response({item["status"]: item["count"] for item in stats})