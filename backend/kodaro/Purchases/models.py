import uuid
from django.db import models
from django.utils import timezone


class Rescue(models.Model):
    """
    Represents a single rescue operation carried out by the Mountain Rescue Team.
    Tracks the survivor assisted, the equipment deployed, and associated costs.
    """

    class Outcome(models.TextChoices):
        SUCCESSFUL      = "successful",      "Successful Rescue"
        HOSPITALIZED    = "hospitalized",    "Rescued – Hospitalisation Required"
        UNSUCCESSFUL    = "unsuccessful",    "Unsuccessful – Fatality"
        FALSE_ALARM     = "false_alarm",     "False Alarm / Hoax"
        ONGOING         = "ongoing",         "Operation Ongoing"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    date = models.DateField(default=timezone.localdate, help_text="Date the rescue operation took place")

    equipment = models.ForeignKey(
        "Products.Product",
        on_delete=models.PROTECT,
        related_name="rescues",
        help_text="Primary equipment item deployed during this operation",
    )
    survivor = models.ForeignKey(
        "Clients.Survivor",
        on_delete=models.PROTECT,
        related_name="rescues",
        help_text="Survivor assisted during this operation",
    )

    outcome = models.CharField(
        max_length=20,
        choices=Outcome.choices,
        default=Outcome.ONGOING,
        help_text="Final outcome of the rescue operation",
    )

    # Equipment cost snapshot — captured at operation time so records remain
    # accurate even if equipment valuation changes later.
    equipment_cost    = models.DecimalField(max_digits=12, decimal_places=2)
    currency          = models.CharField(max_length=3)
    tax_rate          = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    equipment_quantity = models.PositiveIntegerField(
        default=1,
        help_text="Number of units of this equipment deployed",
    )

    notes = models.TextField(blank=True, help_text="Operational notes or after-action remarks")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        verbose_name = "Rescue Operation"
        verbose_name_plural = "Rescue Operations"

    def __str__(self):
        return f"{self.survivor} — {self.equipment} ({self.date})"

    # ── Cost helpers ──────────────────────────────────────────────────────────

    @property
    def total_cost_net(self):
        if self.equipment_cost is None:
            return None
        return round(self.equipment_cost * self.equipment_quantity, 2)

    @property
    def total_cost_gross(self):
        if self.equipment_cost is None:
            return None
        return round(
            self.equipment_cost * self.equipment_quantity * (1 + self.tax_rate / 100), 2
        )

    # ── Auto-snapshot from equipment on first save ─────────────────────────────

    def save(self, *args, **kwargs):
        if not self.equipment_cost:
            self.equipment_cost = self.equipment.price
        if not self.currency:
            self.currency = self.equipment.currency
        if not self.tax_rate:
            self.tax_rate = self.equipment.tax_rate
        super().save(*args, **kwargs)