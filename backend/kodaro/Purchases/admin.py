from django.contrib import admin

from .models import Purchase


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = [
        "date", "client", "product", "quantity",
        "unit_price", "currency", "total_gross_display", "created_at",
    ]
    list_filter = ["currency", "date", "product__category__name"]
    search_fields = ["client__name", "product__name", "product__sku"]
    ordering = ["-date"]
    readonly_fields = [
        "id", "unit_price", "currency", "tax_rate",
        "total_net_display", "total_gross_display",
        "created_at", "updated_at",
    ]
    # raw_id_fields gives a lookup popup without requiring search_fields on related admins
    raw_id_fields = ["product", "client"]
    date_hierarchy = "date"

    fieldsets = (
        (None, {
            "fields": ("id", "date", "client", "product", "quantity"),
        }),
        ("Pricing (snapshotted at purchase time)", {
            "fields": ("unit_price", "currency", "tax_rate", "total_net_display", "total_gross_display"),
        }),
        ("Metadata", {
            "classes": ("collapse",),
            "fields": ("created_at", "updated_at"),
        }),
    )

    def total_gross_display(self, obj):
        return obj.total_gross
    total_gross_display.short_description = "Total (gross)"

    def total_net_display(self, obj):
        return obj.total_net
    total_net_display.short_description = "Total (net)"