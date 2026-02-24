from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Survivor, SurvivorContact

User = get_user_model()


class SurvivorContactSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = SurvivorContact
        fields = [
            "id", "survivor", "first_name", "last_name", "full_name",
            "job_title", "email", "phone", "is_primary", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SurvivorContactInlineSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = SurvivorContact
        fields = ["id", "full_name", "job_title", "email", "phone", "is_primary"]


class SurvivorSerializer(serializers.ModelSerializer):
    contacts = SurvivorContactInlineSerializer(many=True, read_only=True)
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True)
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)

    class Meta:
        model = Survivor
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


class SurvivorListSerializer(serializers.ModelSerializer):
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True)
    contact_count = serializers.SerializerMethodField()

    class Meta:
        model = Survivor
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