from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Pracownik, KontaktAwaryjny
from .serializers import (
    PracownikListSerializer,
    PracownikSerializer,
    KontaktAwaryjnySerializer,
)


# ── Pracownicy ────────────────────────────────────────────────────────────────

class PracownikListCreateView(generics.ListCreateAPIView):
    """
    GET  /pracownicy/          → Lista wszystkich pracowników (z wyszukiwaniem i sortowaniem).
    POST /pracownicy/          → Utwórz nowego pracownika.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "email", "stanowisko", "city", "country"]
    ordering_fields = ["last_name", "status", "dzial", "data_zatrudnienia", "created_at"]
    ordering = ["last_name", "first_name"]

    def get_queryset(self):
        qs = Pracownik.objects.select_related("przelozony", "created_by").prefetch_related("kontakty_awaryjne")

        # Optional query param filters
        status_param = self.request.query_params.get("status")
        dzial_param = self.request.query_params.get("dzial")
        rodzaj_param = self.request.query_params.get("rodzaj_zatrudnienia")
        moi_podwladni = self.request.query_params.get("podwladni")

        if status_param:
            qs = qs.filter(status=status_param)
        if dzial_param:
            qs = qs.filter(dzial=dzial_param)
        if rodzaj_param:
            qs = qs.filter(rodzaj_zatrudnienia=rodzaj_param)
        if moi_podwladni:
            qs = qs.filter(przelozony=self.request.user)

        return qs

    def get_serializer_class(self):
        if self.request.method == "GET":
            return PracownikListSerializer
        return PracownikSerializer


class PracownikDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /pracownicy/<id>/   → Pobierz szczegóły pracownika (z kontaktami awaryjnymi).
    PATCH  /pracownicy/<id>/   → Zaktualizuj dane pracownika.
    DELETE /pracownicy/<id>/   → Usuń pracownika (tylko admin).
    """
    serializer_class = PracownikSerializer
    queryset = Pracownik.objects.select_related("przelozony", "created_by").prefetch_related("kontakty_awaryjne")

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [IsAuthenticated()]


# ── Kontakty awaryjne ─────────────────────────────────────────────────────────

class KontaktAwaryjnyListCreateView(generics.ListCreateAPIView):
    """
    GET  /pracownicy/<pracownik_id>/kontakty/   → Lista kontaktów awaryjnych pracownika.
    POST /pracownicy/<pracownik_id>/kontakty/   → Dodaj kontakt awaryjny do pracownika.
    """
    serializer_class = KontaktAwaryjnySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KontaktAwaryjny.objects.filter(pracownik_id=self.kwargs["pracownik_pk"])

    def perform_create(self, serializer):
        pracownik = generics.get_object_or_404(Pracownik, pk=self.kwargs["pracownik_pk"])
        serializer.save(pracownik=pracownik)


class KontaktAwaryjnyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /pracownicy/<pracownik_id>/kontakty/<id>/   → Pobierz kontakt awaryjny.
    PATCH  /pracownicy/<pracownik_id>/kontakty/<id>/   → Zaktualizuj kontakt awaryjny.
    DELETE /pracownicy/<pracownik_id>/kontakty/<id>/   → Usuń kontakt awaryjny.
    """
    serializer_class = KontaktAwaryjnySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KontaktAwaryjny.objects.filter(pracownik_id=self.kwargs["pracownik_pk"])


class PracownikStatsView(APIView):
    """
    GET /pracownicy/stats/   → Zagregowane liczby według statusu i działu (admin/internal use).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count

        stats_status = (
            Pracownik.objects
            .values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        stats_dzial = (
            Pracownik.objects
            .values("dzial")
            .annotate(count=Count("id"))
            .order_by("dzial")
        )
        return Response({
            "by_status": {item["status"]: item["count"] for item in stats_status},
            "by_dzial": {item["dzial"]: item["count"] for item in stats_dzial},
        })