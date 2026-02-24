from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Rescuer, EmergencyContact

User = get_user_model()


class EmergencyContactSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = EmergencyContact
        fields = [
            "id", "rescuer", "first_name", "last_name", "full_name",
            "relationship", "email", "phone", "is_primary", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class EmergencyContactInlineSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = EmergencyContact
        fields = ["id", "full_name", "relationship", "email", "phone", "is_primary"]


class RescuerSerializer(serializers.ModelSerializer):
    emergency_contacts = EmergencyContactInlineSerializer(many=True, read_only=True)
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    supervisor_full_name = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Rescuer
        fields = [
            "id", "first_name", "last_name", "full_name",
            "status", "department", "employment_type", "position",
            "email", "phone",
            "address_line1", "address_line2", "city", "state", "postal_code", "country",
            "hire_date", "termination_date", "salary",
            "notes", "emergency_contacts",
            "supervisor", "supervisor_full_name",
            "created_by", "created_by_email",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_by_email", "created_at", "updated_at"]

    def get_supervisor_full_name(self, obj):
        if obj.supervisor:
            return obj.supervisor.full_name
        return None

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class RescuerListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    emergency_contact_count = serializers.SerializerMethodField()
    supervisor_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Rescuer
        fields = [
            "id", "first_name", "last_name", "full_name",
            "status", "department", "employment_type", "position",
            "email", "phone",
            "city", "country",
            "supervisor", "supervisor_full_name",
            "emergency_contact_count",
            "hire_date",
            "created_at",
        ]

    def get_emergency_contact_count(self, obj):
        return obj.emergency_contacts.count()

    def get_supervisor_full_name(self, obj):
        if obj.supervisor:
            return obj.supervisor.full_name
        return None