from datetime import date

from django.db.models import Sum, Count
from rest_framework import generics, filters, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Purchase
from .serializers import PurchaseListSerializer, PurchaseSerializer


def base_queryset():
    return Purchase.objects.select_related(
        "product", "product__category", "client"
    )


# ── CRUD ──────────────────────────────────────────────────────────────────────

class PurchaseListCreateView(generics.ListCreateAPIView):
    """
    GET  /purchases/        → List all purchases (search + ordering).
    POST /purchases/        → Create a purchase.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["product__name", "product__sku", "client__name"]
    ordering_fields = ["date", "unit_price", "created_at"]
    ordering = ["-date"]

    def get_queryset(self):
        return base_queryset()

    def get_serializer_class(self):
        return PurchaseSerializer if self.request.method == "POST" else PurchaseListSerializer


class PurchaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /purchases/<id>/   → Full purchase detail.
    PATCH  /purchases/<id>/   → Update a purchase.
    DELETE /purchases/<id>/   → Delete a purchase (admin only).
    """
    serializer_class = PurchaseSerializer
    queryset = base_queryset()

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [IsAuthenticated()]


# ── Filtered views ─────────────────────────────────────────────────────────────

class PurchasesByProductView(generics.ListAPIView):
    """
    GET /purchases/by-product/<product_id>/
    All purchases of a specific product.
    """
    serializer_class = PurchaseListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return base_queryset().filter(product_id=self.kwargs["product_id"])


class PurchasesByDayView(generics.ListAPIView):
    """
    GET /purchases/by-day/<YYYY-MM-DD>/
    All purchases on a specific date.
    """
    serializer_class = PurchaseListSerializer
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
    GET /purchases/by-category/<category_id>/
    All purchases of products belonging to a category.
    """
    serializer_class = PurchaseListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return base_queryset().filter(product__category_id=self.kwargs["category_id"])


class PurchasesByMonthYearView(generics.ListAPIView):
    """
    GET /purchases/by-month/<YYYY>/<MM>/
    All purchases in a specific month of a specific year.
    e.g. /purchases/by-month/2024/03/
    """
    serializer_class = PurchaseListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        year = self.kwargs["year"]
        month = self.kwargs["month"]
        if not (1 <= month <= 12):
            raise ValidationError({"month": "Month must be between 1 and 12."})
        return base_queryset().filter(date__year=year, date__month=month)


class PurchasesByMonthAllYearsView(generics.ListAPIView):
    """
    GET /purchases/by-month/<MM>/
    All purchases in a given month number across ALL years.
    e.g. /purchases/by-month/03/ → every March, regardless of year.
    """
    serializer_class = PurchaseListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        month = self.kwargs["month"]
        if not (1 <= month <= 12):
            raise ValidationError({"month": "Month must be between 1 and 12."})
        return base_queryset().filter(date__month=month)


class PurchasesByClientView(generics.ListAPIView):
    """
    GET /purchases/by-client/<client_id>/
    All purchases made by a specific client.
    """
    serializer_class = PurchaseListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return base_queryset().filter(client_id=self.kwargs["client_id"])


class PurchasesOverPriceView(APIView):
    """
    GET /purchases/over-price/?price=<amount>&currency=<code>
    All purchases where the unit_price exceeds the given threshold.
    Both `price` and `currency` are required query params.

    Example: /purchases/over-price/?price=500&currency=PLN
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        price = request.query_params.get("price")
        currency = request.query_params.get("currency")

        if not price or not currency:
            raise ValidationError({"detail": "Both `price` and `currency` query params are required."})

        try:
            price = float(price)
        except ValueError:
            raise ValidationError({"price": "Must be a valid number."})

        qs = base_queryset().filter(unit_price__gt=price, currency=currency.upper())
        serializer = PurchaseListSerializer(qs, many=True)
        return Response(serializer.data)


class PurchasesByClientCountryView(generics.ListAPIView):
    """
    GET /purchases/by-country/<country>/
    All purchases made by clients from a given country.
    The country value should match what is stored on the Client model.

    Example: /purchases/by-country/Poland/
             /purchases/by-country/Germany/
    """
    serializer_class = PurchaseListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        country = self.kwargs["country"]
        return base_queryset().filter(client__country__iexact=country)


# ── Stats ──────────────────────────────────────────────────────────────────────

class PurchaseStatsView(APIView):
    """
    GET /purchases/stats/
    Aggregated purchase statistics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        totals = Purchase.objects.aggregate(
            total_purchases=Count("id"),
            total_quantity=Sum("quantity"),
        )
        by_currency = (
            Purchase.objects
            .values("currency")
            .annotate(count=Count("id"), total_net=Sum("unit_price"))
            .order_by("currency")
        )
        top_products = (
            Purchase.objects
            .values("product__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        top_clients = (
            Purchase.objects
            .values("client__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        return Response({
            "totals": totals,
            "by_currency": list(by_currency),
            "top_products": list(top_products),
            "top_clients": list(top_clients),
        })