from rest_framework import serializers

from .models import Purchase


class PurchaseSerializer(serializers.ModelSerializer):
    total_net = serializers.ReadOnlyField()
    total_gross = serializers.ReadOnlyField()

    # Readable labels alongside FK ids
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_category = serializers.CharField(source="product.category.name", read_only=True)
    client_name = serializers.CharField(source="client.name", read_only=True)
    client_country = serializers.CharField(source="client.country", read_only=True)
    client_city = serializers.CharField(source="client.city", read_only=True)

    class Meta:
        model = Purchase
        fields = [
            "id", "date",
            "product", "product_name", "product_sku", "product_category",
            "client", "client_name", "client_country", "client_city",
            "quantity", "unit_price", "currency", "tax_rate",
            "total_net", "total_gross",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "unit_price", "currency", "tax_rate", "created_at", "updated_at"]


class PurchaseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list/filter endpoints."""
    total_gross = serializers.ReadOnlyField()
    product_name = serializers.CharField(source="product.name", read_only=True)
    client_name = serializers.CharField(source="client.name", read_only=True)

    class Meta:
        model = Purchase
        fields = [
            "id", "date",
            "product", "product_name",
            "client", "client_name",
            "quantity", "unit_price", "currency", "total_gross",
        ]