from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Client, Contact

User = get_user_model()


class ContactSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Contact
        fields = [
            "id", "client", "first_name", "last_name", "full_name",
            "job_title", "email", "phone", "is_primary", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ContactInlineSerializer(serializers.ModelSerializer):
    """Lightweight serializer used when embedding contacts inside a Client response."""
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Contact
        fields = ["id", "full_name", "job_title", "email", "phone", "is_primary"]


class ClientSerializer(serializers.ModelSerializer):
    contacts = ContactInlineSerializer(many=True, read_only=True)
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True)
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)

    class Meta:
        model = Client
        fields = [
            "id", "name", "status", "industry",
            "email", "phone", "website",
            "address_line1", "address_line2", "city", "state", "postal_code", "country",
            "notes", "contacts",
            "assigned_to", "assigned_to_email",
            "created_by", "created_by_email",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_by_email", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class ClientListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints — no nested contacts."""
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True)
    contact_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id", "name", "status", "industry",
            "email", "phone",
            "city", "country",
            "assigned_to", "assigned_to_email",
            "contact_count",
            "created_at",
        ]

    def get_contact_count(self, obj):
        return obj.contacts.count()