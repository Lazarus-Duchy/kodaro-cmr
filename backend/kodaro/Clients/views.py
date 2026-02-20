from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Client, Contact
from .serializers import (
    ClientListSerializer,
    ClientSerializer,
    ContactSerializer,
)


# ── Clients ───────────────────────────────────────────────────────────────────

class ClientListCreateView(generics.ListCreateAPIView):
    """
    GET  /clients/          → List all clients (with search & ordering).
    POST /clients/          → Create a new client.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "city", "country"]
    ordering_fields = ["name", "status", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Client.objects.select_related("assigned_to", "created_by").prefetch_related("contacts")

        # Optional query param filters
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
            return ClientListSerializer
        return ClientSerializer


class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /clients/<id>/   → Retrieve full client detail (with contacts).
    PATCH  /clients/<id>/   → Update a client.
    DELETE /clients/<id>/   → Delete a client (admin only).
    """
    serializer_class = ClientSerializer
    queryset = Client.objects.select_related("assigned_to", "created_by").prefetch_related("contacts")

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [IsAuthenticated()]


# ── Contacts ──────────────────────────────────────────────────────────────────

class ContactListCreateView(generics.ListCreateAPIView):
    """
    GET  /clients/<client_id>/contacts/   → List all contacts for a client.
    POST /clients/<client_id>/contacts/   → Add a contact to a client.
    """
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(client_id=self.kwargs["client_pk"])

    def perform_create(self, serializer):
        client = generics.get_object_or_404(Client, pk=self.kwargs["client_pk"])
        serializer.save(client=client)


class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /clients/<client_id>/contacts/<id>/   → Retrieve a contact.
    PATCH  /clients/<client_id>/contacts/<id>/   → Update a contact.
    DELETE /clients/<client_id>/contacts/<id>/   → Delete a contact.
    """
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(client_id=self.kwargs["client_pk"])


class ClientStatsView(APIView):
    """
    GET /clients/stats/   → Aggregated counts by status (admin/internal use).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count
        stats = (
            Client.objects
            .values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        return Response({item["status"]: item["count"] for item in stats})