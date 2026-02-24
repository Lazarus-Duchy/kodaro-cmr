import uuid
from django.db import models
from django.conf import settings


class Survivor(models.Model):

    class Status(models.TextChoices):
        LEAD = "lead", "Lead"
        PROSPECT = "prospect", "Prospect"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        CHURNED = "churned", "Churned"

    class Industry(models.TextChoices):
        TECHNOLOGY = "technology", "Technology"
        FINANCE = "finance", "Finance"
        HEALTHCARE = "healthcare", "Healthcare"
        RETAIL = "retail", "Retail"
        MANUFACTURING = "manufacturing", "Manufacturing"
        EDUCATION = "education", "Education"
        REAL_ESTATE = "real_estate", "Real Estate"
        LOGISTICS = "logistics", "Logistics"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.LEAD)
    industry = models.CharField(max_length=50, choices=Industry.choices, default=Industry.OTHER, blank=True)

    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    website = models.URLField(blank=True)

    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)

    notes = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_survivors",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_survivors",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Survivor"
        verbose_name_plural = "Survivors"

    def __str__(self):
        return self.name


class SurvivorContact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    survivor = models.ForeignKey(Survivor, on_delete=models.CASCADE, related_name="contacts")

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    job_title = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    is_primary = models.BooleanField(default=False, help_text="Primary contact for this survivor")
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_primary", "last_name"]
        verbose_name = "Survivor Contact"
        verbose_name_plural = "Survivor Contacts"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.survivor.name})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()