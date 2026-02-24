from django.contrib import admin

from .models import Rescue


@admin.register(Rescue)
class RescueAdmin(admin.ModelAdmin):
    list_display = [
        "date", "survivor", "equipment", "outcome",
        "equipment_quantity", "equipment_cost", "currency",
        "total_cost_gross_display", "created_at",
    ]
    list_filter  = ["outcome", "currency", "date", "equipment__category__name"]
    search_fields = ["survivor__name", "equipment__name", "equipment__sku", "notes"]
    ordering = ["-date"]
    readonly_fields = [
        "id", "equipment_cost", "currency", "tax_rate",
        "total_cost_net_display", "total_cost_gross_display",
        "created_at", "updated_at",
    ]
    raw_id_fields = ["equipment", "survivor"]
    date_hierarchy = "date"

    fieldsets = (
        ("Operation Details", {
            "fields": ("id", "date", "survivor", "equipment", "equipment_quantity", "outcome", "notes"),
        }),
        ("Equipment Cost (snapshotted at operation time)", {
            "fields": (
                "equipment_cost", "currency", "tax_rate",
                "total_cost_net_display", "total_cost_gross_display",
            ),
        }),
        ("Metadata", {
            "classes": ("collapse",),
            "fields": ("created_at", "updated_at"),
        }),
    )

    def total_cost_gross_display(self, obj):
        return obj.total_cost_gross
    total_cost_gross_display.short_description = "Total Cost (gross)"

    def total_cost_net_display(self, obj):
        return obj.total_cost_net
    total_cost_net_display.short_description = "Total Cost (net)"