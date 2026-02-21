import uuid
from django.db import models
from django.conf import settings


class Pracownik(models.Model):

    class Status(models.TextChoices):
        AKTYWNY = "aktywny", "Aktywny"
        NIEAKTYWNY = "nieaktywny", "Nieaktywny"
        URLOP = "urlop", "Na urlopie"
        ZWOLNIONY = "zwolniony", "Zwolniony"
        STAZ = "staz", "Staż"

    class Dzial(models.TextChoices):
        IT = "it", "IT"
        HR = "hr", "HR"
        FINANSE = "finanse", "Finanse"
        SPRZEDAZ = "sprzedaz", "Sprzedaż"
        MARKETING = "marketing", "Marketing"
        OPERACJE = "operacje", "Operacje"
        ZARZAD = "zarzad", "Zarząd"
        LOGISTYKA = "logistyka", "Logistyka"
        INNY = "inny", "Inny"

    class RodzajZatrudnienia(models.TextChoices):
        ETAT = "etat", "Pełny etat"
        CZESC_ETATU = "czesc_etatu", "Część etatu"
        KONTRAKT = "kontrakt", "Kontrakt"
        STAZ = "staz", "Staż"
        B2B = "b2b", "B2B"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AKTYWNY)
    dzial = models.CharField(max_length=50, choices=Dzial.choices, default=Dzial.INNY, blank=True)
    rodzaj_zatrudnienia = models.CharField(
        max_length=20, choices=RodzajZatrudnienia.choices, default=RodzajZatrudnienia.ETAT
    )
    stanowisko = models.CharField(max_length=150, blank=True)

    # Kontakt
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)

    # Adres
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)

    # Zatrudnienie
    data_zatrudnienia = models.DateField(null=True, blank=True)
    data_zwolnienia = models.DateField(null=True, blank=True)
    wynagrodzenie = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Meta
    notes = models.TextField(blank=True)
    przelozony = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="podwladni",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_pracownicy",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]
        verbose_name = "Pracownik"
        verbose_name_plural = "Pracownicy"

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class KontaktAwaryjny(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pracownik = models.ForeignKey(Pracownik, on_delete=models.CASCADE, related_name="kontakty_awaryjne")

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    relacja = models.CharField(max_length=100, blank=True, help_text="np. Małżonek, Rodzic, Brat")
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30)
    is_primary = models.BooleanField(default=False, help_text="Główny kontakt awaryjny")
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_primary", "last_name"]
        verbose_name = "Kontakt awaryjny"
        verbose_name_plural = "Kontakty awaryjne"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.pracownik.full_name})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()