from django.urls import path
from .views import ItemsView
from rest_framework_simplejwt.views import TokenRefreshView
from Users.views import (
    ChangePasswordView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    UserDetailView,
    UserListView,
)
from Clients.views import (
    SurvivorDetailView,
    SurvivorListCreateView,
    SurvivorStatsView,
    SurvivorContactDetailView,
    SurvivorContactListCreateView,
)

from Products.views import (
    CategoryDetailView,
    CategoryListCreateView,
    ProductDetailView,
    ProductListCreateView,
    ProductStatsView,
)

from Purchases.views import (
    PurchaseDetailView,
    PurchaseListCreateView,
    PurchasesByClientCountryView,
    PurchasesByClientView,
    PurchasesByCategoryView,
    PurchasesByDayView,
    PurchasesByMonthAllYearsView,
    PurchasesByMonthYearView,
    PurchasesByProductView,
    PurchasesOverPriceView,
    PurchaseStatsView,
)
from Pracownicy.views import (
    PracownikListCreateView,
    PracownikDetailView,
    PracownikStatsView,
    KontaktAwaryjnyListCreateView,
    KontaktAwaryjnyDetailView,
)

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # ── Current user ──────────────────────────────────────────────────────────
    path("users/me/", MeView.as_view(), name="user-me"),
    path("users/me/change-password/", ChangePasswordView.as_view(), name="user-change-password"),

    # ── Admin ─────────────────────────────────────────────────────────────────
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<uuid:pk>/", UserDetailView.as_view(), name="user-detail"),

    # ── Survivors ─────────────────────────────────────────────────────────────
    path("survivors/", SurvivorListCreateView.as_view(), name="survivor-list"),
    path("survivors/stats/", SurvivorStatsView.as_view(), name="survivor-stats"),
    path("survivors/<uuid:pk>/", SurvivorDetailView.as_view(), name="survivor-detail"),

    # ── Survivor Contacts (nested) ────────────────────────────────────────────
    path("survivors/<uuid:survivor_pk>/contacts/", SurvivorContactListCreateView.as_view(), name="survivor-contact-list"),
    path("survivors/<uuid:survivor_pk>/contacts/<uuid:pk>/", SurvivorContactDetailView.as_view(), name="survivor-contact-detail"),

    # ── Categories ────────────────────────────────────────────────────────────
    path("products/categories/", CategoryListCreateView.as_view(), name="category-list"),
    path("products/categories/<uuid:pk>/", CategoryDetailView.as_view(), name="category-detail"),

    # ── Products ──────────────────────────────────────────────────────────────
    path("products/", ProductListCreateView.as_view(), name="product-list"),
    path("products/stats/", ProductStatsView.as_view(), name="product-stats"),
    path("products/<uuid:pk>/", ProductDetailView.as_view(), name="product-detail"),

    # ── Purchases CRUD ────────────────────────────────────────────────────────
    path("purchases/", PurchaseListCreateView.as_view(), name="purchase-list"),
    path("purchases/stats/", PurchaseStatsView.as_view(), name="purchase-stats"),
    path("purchases/<uuid:pk>/", PurchaseDetailView.as_view(), name="purchase-detail"),

    # ── Purchases filtered ────────────────────────────────────────────────────
    path("purchases/by-product/<uuid:product_id>/", PurchasesByProductView.as_view(), name="purchases-by-product"),
    path("purchases/by-day/<str:date>/", PurchasesByDayView.as_view(), name="purchases-by-day"),
    path("purchases/by-category/<uuid:category_id>/", PurchasesByCategoryView.as_view(), name="purchases-by-category"),
    path("purchases/by-month/<int:year>/<int:month>/", PurchasesByMonthYearView.as_view(), name="purchases-by-month-year"),
    path("purchases/by-month/<int:month>/", PurchasesByMonthAllYearsView.as_view(), name="purchases-by-month-all-years"),
    path("purchases/by-client/<uuid:client_id>/", PurchasesByClientView.as_view(), name="purchases-by-client"),
    path("purchases/over-price/", PurchasesOverPriceView.as_view(), name="purchases-over-price"),
    path("purchases/by-country/<str:country>/", PurchasesByClientCountryView.as_view(), name="purchases-by-country"),

    # ── Pracownicy ────────────────────────────────────────────────────────────
    path("pracownicy/", PracownikListCreateView.as_view(), name="pracownik-list"),
    path("pracownicy/stats/", PracownikStatsView.as_view(), name="pracownik-stats"),
    path("pracownicy/<uuid:pk>/", PracownikDetailView.as_view(), name="pracownik-detail"),

    # ── Kontakty awaryjne (nested) ────────────────────────────────────────────
    path("pracownicy/<uuid:pracownik_pk>/kontakty/", KontaktAwaryjnyListCreateView.as_view(), name="kontakt-awaryjny-list"),
    path("pracownicy/<uuid:pracownik_pk>/kontakty/<uuid:pk>/", KontaktAwaryjnyDetailView.as_view(), name="kontakt-awaryjny-detail"),
]