from django.contrib import admin

from .models import Client, Contact


class ContactInline(admin.TabularInline):
    model = Contact
    extra = 0
    fields = ["first_name", "last_name", "job_title", "email", "phone", "is_primary"]
    ordering = ["-is_primary", "last_name"]


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ["name", "status", "industry", "email", "city", "country", "assigned_to", "created_at"]
    list_filter = ["status", "industry", "country"]
    search_fields = ["name", "email", "city", "country"]
    ordering = ["-created_at"]
    readonly_fields = ["id", "created_by", "created_at", "updated_at"]
    autocomplete_fields = ["assigned_to"]
    inlines = [ContactInline]

    fieldsets = (
        (None, {
            "fields": ("id", "name", "status", "industry"),
        }),
        ("Contact Info", {
            "fields": ("email", "phone", "website"),
        }),
        ("Address", {
            "classes": ("collapse",),
            "fields": ("address_line1", "address_line2", "city", "state", "postal_code", "country"),
        }),
        ("Assignment & Notes", {
            "fields": ("assigned_to", "notes"),
        }),
        ("Metadata", {
            "classes": ("collapse",),
            "fields": ("created_by", "created_at", "updated_at"),
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:  # only on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ["full_name", "client", "job_title", "email", "phone", "is_primary"]
    list_filter = ["is_primary", "client__status"]
    search_fields = ["first_name", "last_name", "email", "client__name"]
    ordering = ["last_name"]
    readonly_fields = ["id", "created_at", "updated_at"]
    autocomplete_fields = ["client"]

    fieldsets = (
        (None, {
            "fields": ("id", "client", "is_primary"),
        }),
        ("Personal Info", {
            "fields": ("first_name", "last_name", "job_title"),
        }),
        ("Contact Details", {
            "fields": ("email", "phone"),
        }),
        ("Notes", {
            "fields": ("notes",),
        }),
        ("Metadata", {
            "classes": ("collapse",),
            "fields": ("created_at", "updated_at"),
        }),
    )