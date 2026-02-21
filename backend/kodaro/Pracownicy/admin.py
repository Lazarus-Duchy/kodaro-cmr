from django.contrib import admin

from .models import Pracownik, KontaktAwaryjny


class KontaktAwaryjnyInline(admin.TabularInline):
    model = KontaktAwaryjny
    extra = 0
    fields = ["first_name", "last_name", "relacja", "email", "phone", "is_primary"]
    ordering = ["-is_primary", "last_name"]


@admin.register(Pracownik)
class PracownikAdmin(admin.ModelAdmin):
    list_display = [
        "full_name", "status", "dzial", "stanowisko",
        "rodzaj_zatrudnienia", "email", "city", "data_zatrudnienia",
    ]
    list_filter = ["status", "dzial", "rodzaj_zatrudnienia", "country"]
    search_fields = ["first_name", "last_name", "email", "stanowisko", "city"]
    ordering = ["last_name", "first_name"]
    readonly_fields = ["id", "created_by", "created_at", "updated_at"]
    autocomplete_fields = ["przelozony"]
    inlines = [KontaktAwaryjnyInline]

    fieldsets = (
        (None, {
            "fields": ("id", "first_name", "last_name", "status", "dzial"),
        }),
        ("Stanowisko", {
            "fields": ("stanowisko", "rodzaj_zatrudnienia", "przelozony"),
        }),
        ("Dane kontaktowe", {
            "fields": ("email", "phone"),
        }),
        ("Adres", {
            "classes": ("collapse",),
            "fields": ("address_line1", "address_line2", "city", "state", "postal_code", "country"),
        }),
        ("Zatrudnienie", {
            "fields": ("data_zatrudnienia", "data_zwolnienia", "wynagrodzenie"),
        }),
        ("Notatki", {
            "fields": ("notes",),
        }),
        ("Metadane", {
            "classes": ("collapse",),
            "fields": ("created_by", "created_at", "updated_at"),
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:  # tylko przy tworzeniu
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(KontaktAwaryjny)
class KontaktAwaryjnyAdmin(admin.ModelAdmin):
    list_display = ["full_name", "pracownik", "relacja", "email", "phone", "is_primary"]
    list_filter = ["is_primary", "pracownik__status"]
    search_fields = ["first_name", "last_name", "email", "pracownik__first_name", "pracownik__last_name"]
    ordering = ["last_name"]
    readonly_fields = ["id", "created_at", "updated_at"]
    autocomplete_fields = ["pracownik"]

    fieldsets = (
        (None, {
            "fields": ("id", "pracownik", "is_primary"),
        }),
        ("Dane osobowe", {
            "fields": ("first_name", "last_name", "relacja"),
        }),
        ("Dane kontaktowe", {
            "fields": ("email", "phone"),
        }),
        ("Notatki", {
            "fields": ("notes",),
        }),
        ("Metadane", {
            "classes": ("collapse",),
            "fields": ("created_at", "updated_at"),
        }),
    )