from django.contrib import admin

from .models import Rescuer, EmergencyContact


class EmergencyContactInline(admin.TabularInline):
    model = EmergencyContact
    extra = 0
    fields = ["first_name", "last_name", "relationship", "email", "phone", "is_primary"]
    ordering = ["-is_primary", "last_name"]


@admin.register(Rescuer)
class RescuerAdmin(admin.ModelAdmin):
    list_display = [
        "full_name", "status", "department", "position",
        "employment_type", "email", "city", "hire_date",
    ]
    list_filter = ["status", "department", "employment_type", "country"]
    search_fields = ["first_name", "last_name", "email", "position", "city"]
    ordering = ["last_name", "first_name"]
    readonly_fields = ["id", "created_by", "created_at", "updated_at"]
    autocomplete_fields = ["supervisor"]
    inlines = [EmergencyContactInline]

    fieldsets = (
        (None, {
            "fields": ("id", "first_name", "last_name", "status", "department"),
        }),
        ("Position", {
            "fields": ("position", "employment_type", "supervisor"),
        }),
        ("Contact Info", {
            "fields": ("email", "phone"),
        }),
        ("Address", {
            "classes": ("collapse",),
            "fields": ("address_line1", "address_line2", "city", "state", "postal_code", "country"),
        }),
        ("Employment", {
            "fields": ("hire_date", "termination_date", "salary"),
        }),
        ("Notes", {
            "fields": ("notes",),
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


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ["full_name", "rescuer", "relationship", "email", "phone", "is_primary"]
    list_filter = ["is_primary", "rescuer__status"]
    search_fields = ["first_name", "last_name", "email", "rescuer__first_name", "rescuer__last_name"]
    ordering = ["last_name"]
    readonly_fields = ["id", "created_at", "updated_at"]
    autocomplete_fields = ["rescuer"]

    fieldsets = (
        (None, {
            "fields": ("id", "rescuer", "is_primary"),
        }),
        ("Personal Info", {
            "fields": ("first_name", "last_name", "relationship"),
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