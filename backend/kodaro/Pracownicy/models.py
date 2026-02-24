import uuid
from django.db import models
from django.conf import settings


class Rescuer(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        ON_LEAVE = "on_leave", "On Leave"
        TERMINATED = "terminated", "Terminated"
        INTERN = "intern", "Intern"

    class Department(models.TextChoices):
        IT = "it", "IT"
        HR = "hr", "HR"
        FINANCE = "finance", "Finance"
        SALES = "sales", "Sales"
        MARKETING = "marketing", "Marketing"
        OPERATIONS = "operations", "Operations"
        MANAGEMENT = "management", "Management"
        LOGISTICS = "logistics", "Logistics"
        OTHER = "other", "Other"

    class EmploymentType(models.TextChoices):
        FULL_TIME = "full_time", "Full Time"
        PART_TIME = "part_time", "Part Time"
        CONTRACT = "contract", "Contract"
        INTERN = "intern", "Intern"
        B2B = "b2b", "B2B"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    department = models.CharField(max_length=50, choices=Department.choices, default=Department.OTHER, blank=True)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME)
    position = models.CharField(max_length=150, blank=True)

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)

    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)

    hire_date = models.DateField(null=True, blank=True)
    termination_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    notes = models.TextField(blank=True)
    supervisor = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="subordinates",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_rescuers",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]
        verbose_name = "Rescuer"
        verbose_name_plural = "Rescuers"

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class EmergencyContact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rescuer = models.ForeignKey(Rescuer, on_delete=models.CASCADE, related_name="emergency_contacts")

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    relationship = models.CharField(max_length=100, blank=True, help_text="e.g. Spouse, Parent, Sibling")
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30)
    is_primary = models.BooleanField(default=False, help_text="Primary emergency contact")
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_primary", "last_name"]
        verbose_name = "Emergency Contact"
        verbose_name_plural = "Emergency Contacts"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.rescuer.full_name})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()