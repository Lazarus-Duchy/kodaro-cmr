import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Equipment Category"
        verbose_name_plural = "Equipment Categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Represents a piece of rescue equipment, vehicle, or supply item
    managed by the Mountain Rescue Team.
    """

    class Status(models.TextChoices):
        AVAILABLE    = "available",     "Available"
        UNAVAILABLE  = "unavailable",   "Unavailable (Under Maintenance)"
        DECOMMISSIONED = "decommissioned", "Decommissioned"

    class Currency(models.TextChoices):
        PLN = "PLN", "PLN"
        USD = "USD", "USD"
        EUR = "EUR", "EUR"
        GBP = "GBP", "GBP"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Name of the equipment item or supply")
    sku = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        help_text="Asset / Serial number used to identify this equipment",
    )
    description = models.TextField(blank=True, help_text="Additional notes, specs, or usage instructions")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        help_text="Current operational status of the equipment",
    )
    category = models.ForeignKey(
        Category,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="products",
    )

    # Valuation
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Acquisition / replacement cost",
    )
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.PLN)
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        help_text="Tax rate as a percentage, e.g. 23.00 for 23% VAT",
    )

    # Meta
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_products",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Equipment Item"
        verbose_name_plural = "Equipment Items"

    def __str__(self):
        return f"{self.name} ({self.sku})" if self.sku else self.name

    @property
    def price_with_tax(self):
        if self.price is None:
            return None
        return round(self.price * (1 + self.tax_rate / 100), 2)