from django.contrib import admin
from django.contrib.admin import AdminSite

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "equipment_count", "created_at"]
    search_fields = ["name"]
    ordering = ["name"]
    readonly_fields = ["id", "created_at"]

    fieldsets = (
        (None, {
            "fields": ("id", "name", "description"),
        }),
        ("Metadata", {
            "classes": ("collapse",),
            "fields": ("created_at",),
        }),
    )

    def equipment_count(self, obj):
        return obj.products.count()
    equipment_count.short_description = "Equipment Items"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name", "sku", "status", "category",
        "price", "currency", "price_with_tax", "created_at",
    ]
    list_filter  = ["status", "currency", "category"]
    search_fields = ["name", "sku", "description"]
    ordering = ["name"]
    readonly_fields = ["id", "price_with_tax", "created_by", "created_at", "updated_at"]
    autocomplete_fields = ["category"]

    fieldsets = (
        ("Equipment Details", {
            "fields": ("id", "name", "sku", "status", "category", "description"),
        }),
        ("Valuation", {
            "fields": ("price", "currency", "tax_rate", "price_with_tax"),
        }),
        ("Metadata", {
            "classes": ("collapse",),
            "fields": ("created_by", "created_at", "updated_at"),
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)