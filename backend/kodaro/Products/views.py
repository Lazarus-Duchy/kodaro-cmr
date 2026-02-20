from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product
from .serializers import CategorySerializer, ProductListSerializer, ProductSerializer


# ── Categories ────────────────────────────────────────────────────────────────

class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /products/categories/   → List all categories.
    POST /products/categories/   → Create a category (admin only).
    """
    serializer_class = CategorySerializer
    queryset = Category.objects.prefetch_related("products")

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [IsAuthenticated()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /products/categories/<id>/   → Retrieve a category.
    PATCH  /products/categories/<id>/   → Update a category (admin only).
    DELETE /products/categories/<id>/   → Delete a category (admin only).
    """
    serializer_class = CategorySerializer
    queryset = Category.objects.prefetch_related("products")

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT", "DELETE"):
            return [IsAdminUser()]
        return [IsAuthenticated()]


# ── Products ──────────────────────────────────────────────────────────────────

class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET  /products/          → List all products (with search, filter & ordering).
    POST /products/          → Create a new product.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "sku", "description"]
    ordering_fields = ["name", "price", "status", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        qs = Product.objects.select_related("category", "created_by")

        status_param = self.request.query_params.get("status")
        category_param = self.request.query_params.get("category")
        currency_param = self.request.query_params.get("currency")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")

        if status_param:
            qs = qs.filter(status=status_param)
        if category_param:
            qs = qs.filter(category_id=category_param)
        if currency_param:
            qs = qs.filter(currency=currency_param)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        return qs

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ProductListSerializer
        return ProductSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /products/<id>/   → Retrieve full product detail.
    PATCH  /products/<id>/   → Update a product.
    DELETE /products/<id>/   → Delete a product (admin only).
    """
    serializer_class = ProductSerializer
    queryset = Product.objects.select_related("category", "created_by")

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [IsAuthenticated()]


class ProductStatsView(APIView):
    """
    GET /products/stats/   → Aggregated counts by status and category breakdown.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count, Avg, Min, Max

        status_stats = (
            Product.objects
            .values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        category_stats = (
            Product.objects
            .values("category__name")
            .annotate(count=Count("id"), avg_price=Avg("price"))
            .order_by("-count")
        )
        price_stats = Product.objects.aggregate(
            avg_price=Avg("price"),
            min_price=Min("price"),
            max_price=Max("price"),
        )

        return Response({
            "by_status": {item["status"]: item["count"] for item in status_stats},
            "by_category": list(category_stats),
            "price_summary": price_stats,
        })