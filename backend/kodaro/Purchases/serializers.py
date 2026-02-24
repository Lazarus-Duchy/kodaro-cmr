from rest_framework import serializers

from .models import Rescue


class RescueSerializer(serializers.ModelSerializer):
    total_cost_net   = serializers.ReadOnlyField()
    total_cost_gross = serializers.ReadOnlyField()

    # Readable labels alongside FK ids
    equipment_name     = serializers.CharField(source="equipment.name",          read_only=True)
    equipment_sku      = serializers.CharField(source="equipment.sku",           read_only=True)
    equipment_category = serializers.CharField(source="equipment.category.name", read_only=True)
    survivor_name      = serializers.CharField(source="survivor.name",           read_only=True)
    survivor_country   = serializers.CharField(source="survivor.country",        read_only=True)
    survivor_city      = serializers.CharField(source="survivor.city",           read_only=True)

    class Meta:
        model = Rescue
        fields = [
            "id", "date", "outcome", "notes",
            "equipment", "equipment_name", "equipment_sku", "equipment_category",
            "survivor", "survivor_name", "survivor_country", "survivor_city",
            "equipment_quantity", "equipment_cost", "currency", "tax_rate",
            "total_cost_net", "total_cost_gross",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "equipment_cost", "currency", "tax_rate",
            "created_at", "updated_at",
        ]


class RescueListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list and filter endpoints."""
    total_cost_gross = serializers.ReadOnlyField()
    equipment_name   = serializers.CharField(source="equipment.name", read_only=True)
    survivor_name    = serializers.CharField(source="survivor.name",  read_only=True)

    class Meta:
        model = Rescue
        fields = [
            "id", "date", "outcome",
            "equipment", "equipment_name",
            "survivor", "survivor_name",
            "equipment_quantity", "equipment_cost", "currency", "total_cost_gross",
        ]