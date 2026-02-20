import uuid
from django.db import models
from django.utils import timezone


class Purchase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    date = models.DateField(default=timezone.localdate)
    product = models.ForeignKey(
        "Products.Product",
        on_delete=models.PROTECT,
        related_name="purchases",
    )
    client = models.ForeignKey(
        "Clients.Client",
        on_delete=models.PROTECT,
        related_name="purchases",
    )

    # Snapshot the price at the time of purchase so historical records stay accurate
    # even if the product price changes later.
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    quantity = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        verbose_name = "Purchase"
        verbose_name_plural = "Purchases"

    def __str__(self):
        return f"{self.client} — {self.product} ({self.date})"

    @property
    def total_net(self):
        if self.unit_price is None:
            return None
        return round(self.unit_price * self.quantity, 2)
    
    @property
    def total_gross(self):
        if self.unit_price is None:
            return None
        return round(self.unit_price * self.quantity * (1 + self.tax_rate / 100), 2)

    def save(self, *args, **kwargs):
        # Auto-snapshot product price & currency on first save
        if not self.unit_price:
            self.unit_price = self.product.price
        if not self.currency:
            self.currency = self.product.currency
        if not self.tax_rate:
            self.tax_rate = self.product.tax_rate
        super().save(*args, **kwargs)