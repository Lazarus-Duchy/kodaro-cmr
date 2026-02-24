from datetime import date

from django.db.models import Sum, Count
from rest_framework import generics, filters, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Rescue
from .serializers import RescueListSerializer, RescueSerializer


def base_queryset():
    return Rescue.objects.select_related(
        "equipment", "equipment__category", "survivor"
    )


# ── CRUD ──────────────────────────────────────────────────────────────────────

class PurchaseListCreateView(generics.ListCreateAPIView):
    """
    GET  /rescues/   → List all rescue operations (search + ordering).
    POST /rescues/   → Log a new rescue operation.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["equipment__name", "equipment__sku", "survivor__name", "notes"]
    ordering_fields = ["date", "equipment_cost", "created_at", "outcome"]
    ordering = ["-date"]

    def get_queryset(self):
        return base_queryset()

    def get_serializer_class(self):
        return RescueSerializer if self.request.method == "POST" else RescueListSerializer


class PurchaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /rescues/<id>/   → Full rescue operation detail.
    PATCH  /rescues/<id>/   → Update a rescue operation record.
    DELETE /rescues/<id>/   → Delete a rescue record (admin only).
    """
    serializer_class = RescueSerializer
    queryset = base_queryset()

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [IsAuthenticated()]


# ── Filtered views ─────────────────────────────────────────────────────────────

class PurchasesByProductView(generics.ListAPIView):
    """
    GET /rescues/by-equipment/<equipment_id>/
    All rescue operations that used a specific piece of equipment.
    """
    serializer_class = RescueListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return base_queryset().filter(equipment_id=self.kwargs["product_id"])


class PurchasesByDayView(generics.ListAPIView):
    """
    GET /rescues/by-day/<YYYY-MM-DD>/
    All rescue operations on a specific date.
    """
    serializer_class = RescueListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        raw = self.kwargs["date"]
        try:
            target = date.fromisoformat(raw)
        except ValueError:
            raise ValidationError({"date": "Invalid date format. Use YYYY-MM-DD."})
        return base_queryset().filter(date=target)


class PurchasesByCategoryView(generics.ListAPIView):
    """
    GET /rescues/by-category/<category_id>/
    All rescue operations using equipment from a specific category.
    """
    serializer_class = RescueListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return base_queryset().filter(equipment__category_id=self.kwargs["category_id"])


class PurchasesByMonthYearView(generics.ListAPIView):
    """
    GET /rescues/by-month/<YYYY>/<MM>/
    All rescue operations in a specific month of a specific year.
    """
    serializer_class = RescueListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        year = self.kwargs["year"]
        month = self.kwargs["month"]
        if not (1 <= month <= 12):
            raise ValidationError({"month": "Month must be between 1 and 12."})
        return base_queryset().filter(date__year=year, date__month=month)


class PurchasesByMonthAllYearsView(generics.ListAPIView):
    """
    GET /rescues/by-month/<MM>/
    All rescue operations in a given month across ALL years.
    Useful for identifying seasonal patterns, e.g. every January.
    """
    serializer_class = RescueListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        month = self.kwargs["month"]
        if not (1 <= month <= 12):
            raise ValidationError({"month": "Month must be between 1 and 12."})
        return base_queryset().filter(date__month=month)


class PurchasesByClientView(generics.ListAPIView):
    """
    GET /rescues/by-survivor/<survivor_id>/
    All rescue operations involving a specific survivor.
    """
    serializer_class = RescueListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return base_queryset().filter(survivor_id=self.kwargs["client_id"])


class PurchasesOverPriceView(APIView):
    """
    GET /rescues/over-cost/?price=<amount>&currency=<code>
    All rescue operations where equipment cost exceeds the given threshold.
    Both `price` and `currency` are required query params.

    Example: /rescues/over-cost/?price=500&currency=PLN
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        price    = request.query_params.get("price")
        currency = request.query_params.get("currency")

        if not price or not currency:
            raise ValidationError({"detail": "Both `price` and `currency` query params are required."})

        try:
            price = float(price)
        except ValueError:
            raise ValidationError({"price": "Must be a valid number."})

        qs = base_queryset().filter(equipment_cost__gt=price, currency=currency.upper())
        serializer = RescueListSerializer(qs, many=True)
        return Response(serializer.data)


class PurchasesByClientCountryView(generics.ListAPIView):
    """
    GET /rescues/by-country/<country>/
    All rescue operations involving survivors from a given country.

    Example: /rescues/by-country/Poland/
    """
    serializer_class = RescueListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return base_queryset().filter(survivor__country__iexact=self.kwargs["country"])


# ── Stats ──────────────────────────────────────────────────────────────────────

class PurchaseStatsView(APIView):
    """
    GET /rescues/stats/
    Aggregated rescue operation statistics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        totals = Rescue.objects.aggregate(
            total_operations=Count("id"),
            total_equipment_deployed=Sum("equipment_quantity"),
        )
        by_outcome = (
            Rescue.objects
            .values("outcome")
            .annotate(count=Count("id"))
            .order_by("outcome")
        )
        by_currency = (
            Rescue.objects
            .values("currency")
            .annotate(count=Count("id"), total_cost_net=Sum("equipment_cost"))
            .order_by("currency")
        )
        most_used_equipment = (
            Rescue.objects
            .values("equipment__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        most_assisted_survivors = (
            Rescue.objects
            .values("survivor__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        return Response({
            "totals":                   totals,
            "by_outcome":               list(by_outcome),
            "by_currency":              list(by_currency),
            "most_used_equipment":      list(most_used_equipment),
            "most_assisted_survivors":  list(most_assisted_survivors),
        })