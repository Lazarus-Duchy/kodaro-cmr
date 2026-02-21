from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Pracownik, KontaktAwaryjny

User = get_user_model()


class KontaktAwaryjnySerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = KontaktAwaryjny
        fields = [
            "id", "pracownik", "first_name", "last_name", "full_name",
            "relacja", "email", "phone", "is_primary", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class KontaktAwaryjnyInlineSerializer(serializers.ModelSerializer):
    """Lightweight serializer used when embedding contacts inside a Pracownik response."""
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = KontaktAwaryjny
        fields = ["id", "full_name", "relacja", "email", "phone", "is_primary"]


class PracownikSerializer(serializers.ModelSerializer):
    kontakty_awaryjne = KontaktAwaryjnyInlineSerializer(many=True, read_only=True)
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    przelozony_full_name = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Pracownik
        fields = [
            "id", "first_name", "last_name", "full_name",
            "status", "dzial", "rodzaj_zatrudnienia", "stanowisko",
            "email", "phone",
            "address_line1", "address_line2", "city", "state", "postal_code", "country",
            "data_zatrudnienia", "data_zwolnienia", "wynagrodzenie",
            "notes", "kontakty_awaryjne",
            "przelozony", "przelozony_full_name",
            "created_by", "created_by_email",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_by_email", "created_at", "updated_at"]

    def get_przelozony_full_name(self, obj):
        if obj.przelozony:
            return obj.przelozony.full_name
        return None

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class PracownikListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints — no nested contacts."""
    full_name = serializers.ReadOnlyField()
    kontakt_awaryjny_count = serializers.SerializerMethodField()
    przelozony_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Pracownik
        fields = [
            "id", "first_name", "last_name", "full_name",
            "status", "dzial", "rodzaj_zatrudnienia", "stanowisko",
            "email", "phone",
            "city", "country",
            "przelozony", "przelozony_full_name",
            "kontakt_awaryjny_count",
            "data_zatrudnienia",
            "created_at",
        ]

    def get_kontakt_awaryjny_count(self, obj):
        return obj.kontakty_awaryjne.count()

    def get_przelozony_full_name(self, obj):
        if obj.przelozony:
            return obj.przelozony.full_name
        return None